const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: true },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pending' },
        role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'frontdeskUser' },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    };

    const options = {
        timestamps: false,
        tableName: 'Accounts'
    };

    const Account = sequelize.define('Account', attributes, options);

    // static users for testing 
    Account.seedDefaults = async function() {
        const defaults = [
            {
                title: 'superadmin',
                firstName: 'Super',
                lastName: 'Admin',
                email: 'superadmin@example.com',
                status: 'Active',
                role: 'SuperAdmin',
                passwordHash: 'superadmin123'
            },
            {
                title: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                status: 'Active',
                role: 'Admin',
                passwordHash: 'admin123'
            },
            {
                title: 'frontdesk',
                firstName: 'Front',
                lastName: 'Desk',
                email: 'frontdesk@example.com',
                status: 'Active',
                role: 'frontdeskUser',
                passwordHash: 'frontdesk123'
            }
        ];
        for (const user of defaults) {
            await Account.findOrCreate({ where: { email: user.email }, defaults: user });
        }
    };

    return Account;
};   
