const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config.json');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const Account = require('./account.model');
const RefreshToken = db.RefreshToken;

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

async function authenticate({ email, password }) {
    const account = await Account.findOne({ where: { email } });
    console.log('Account found:', account);
    console.log('Comparing:', account?.passwordHash, password);
    if (!account || account.passwordHash !== password) {
        throw 'Email or password is incorrect';
    }
    // Generate JWT token
    const jwtToken = generateJwtToken(account);
    // Generate refresh token
    const refreshToken = await generateRefreshToken(account, ipAddress);
    return {
        ...account.get(),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function register(params) {
    if (await Account.findOne({ where: { email: params.email } })) {
        throw 'Email is already registered';
    }
    if (params.password) {
        params.password = bcrypt.hashSync(params.password, 10);
    } else {
        params.password = bcrypt.hashSync('changeme', 10);
    }
    params.role = Role.frontdeskUser;
    params.status = 'Pending';
    const account = await Account.create(params);
    return account;
}

async function getAll() {
    return await Account.findAll();
}

async function getById(id) {
    return await Account.findByPk(id);
}

async function update(id, params) {
    const account = await Account.findByPk(id);
    if (!account) throw 'Account not found';
    if (params.password) {
        params.password = bcrypt.hashSync(params.password, 10);
    }
    Object.assign(account, params);
    await account.save();
    return account;
}

async function _delete(id) {
    const account = await Account.findByPk(id);
    if (!account) throw 'Account not found';
    await account.destroy();
}

// --- Refresh Token Logic ---

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;
    // Replace old refresh token with a new one and revoke old
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    // Generate new JWT
    const jwtToken = generateJwtToken(account);
    return {
        ...account.get(),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

// --- Helper Functions ---

function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id, role: account.role }, config.secret, { expiresIn: '15m' });
}

async function generateRefreshToken(account, ipAddress) {
    return await RefreshToken.create({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000), // 7 days
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

async function getRefreshToken(token) {
    const refreshToken = await RefreshToken.findOne({ where: { token }, include: db.Account });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}
