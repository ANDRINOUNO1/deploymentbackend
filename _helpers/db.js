const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    // Models
    db.Account = require('../account/account.model')(sequelize, DataTypes);
    db.RefreshToken = require('../account/refresh-token.model')(sequelize);
    db.Booking = require('../booking/booking.model')(sequelize, DataTypes);
    db.Room = require('../booking/room.model')(sequelize, DataTypes);

    // Associations
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });
    // Add more associations as needed

    // 3 accs
    await sequelize.sync({ alter: true });
    await db.Account.seedDefaults();

    // Bookinggyat
    db.Booking.belongsTo(db.Room, { foreignKey: 'room_id' });
    db.Room.hasMany(db.Booking, { foreignKey: 'room_id' });
}

module.exports.initialize = initialize;
