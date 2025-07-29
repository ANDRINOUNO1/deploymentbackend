const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

// Export the db object directly.
const db = {};
module.exports = db;

// Assign the initialize function to the exported object, but DO NOT call it here.
db.initialize = async function() {
    try {
        // create db if it doesn't already exist
        const { host, port, user, password, database } = config.database;
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();

        // connect to db
        const sequelize = new Sequelize(database, user, password, { 
            dialect: 'mysql',
            logging: false
        });

        // init models and add them to the exported db object
        // Pass DataTypes to each model
        db.Account = require('../account/account.model')(sequelize, DataTypes);
        db.RefreshToken = require('../account/refresh-token.model')(sequelize, DataTypes);
        db.Booking = require('../booking/booking.model')(sequelize, DataTypes);
        db.Room = require('../booking/room.model')(sequelize, DataTypes);

        // define relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE', foreignKey: 'accountId' });
        db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

        db.Account.hasMany(db.Booking, { foreignKey: 'accountId'});
        db.Booking.belongsTo(db.Account, { foreignKey: 'accountId'});

        db.Room.hasMany(db.Booking, { foreignKey: 'roomId' });
        db.Booking.belongsTo(db.Room, { foreignKey: 'roomId' });

        // sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

        // Seed default users only if the table is empty
        const userCount = await db.Account.count();
        if (userCount === 0) {
            await db.Account.seedDefaults();
            console.log('Default users have been seeded.');
        }

        // expose sequelize instance to be used throughout the app
        db.sequelize = sequelize;
        
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
