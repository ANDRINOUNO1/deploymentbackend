const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config.json');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');



module.exports = {
    authenticate,
    register,
    getAll,
    getById,
    update,
    delete: _delete,
    refreshToken,
    revokeToken
};

async function authenticate({ email, password, ipAddress }) {

    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (!account) {
        throw 'No account found with this email';
    }

    if (account.status !== 'Active') {
        throw 'Account is inactive. Please contact support or admin.';
    }

    const passwordMatch = await bcrypt.compare(password, account.passwordHash);
    if (!passwordMatch) {
        throw 'Password is incorrect';
    }

    const jwtToken = generateJwtToken(account);
    const newRefreshToken = await generateRefreshToken(account, ipAddress);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function register(params) {

    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.passwordHash = bcrypt.hashSync(params.password, 10);
    await account.save();

    return basicDetails(account);
}

async function getAll(status) {

    if (status) {
        return await db.Account.findAll({ where: { status } });
    } else {
        return await db.Account.findAll();
    }
}

async function getById(id) {

    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = bcrypt.hashSync(params.password, 10);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}


// --- Helper Functions ---

async function getAccount(id) {
    // FIX: Use db.Account directly
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    // FIX: Use db.RefreshToken and db.Account directly
    const refreshToken = await db.RefreshToken.findOne({ where: { token }, include: 'Account' });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id, role: account.role }, config.secret, { expiresIn: '1h' });
}

async function generateRefreshToken(account, ipAddress) {
    // FIX: Use db.RefreshToken directly
    return await db.RefreshToken.create({
        accountId: account.id,
        token: crypto.randomBytes(40).toString('hex'),
        expires: new Date(Date.now() + 7*24*60*60*1000), // 7 days
        createdByIp: ipAddress
    });
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, status, created, updated } = account;
    return { id, title, firstName, lastName, email, role, status, created, updated };
}
