const { DataTypes } = require('sequelize');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

const Account = db.sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    role: { type: DataTypes.STRING, defaultValue: Role.frontdeskUser },
    password: { type: DataTypes.STRING },
    // jwtToken is not stored in DB, generated on login
}, {
    timestamps: true
});

module.exports = Account;
