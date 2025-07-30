
const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');


const db = {};
module.exports = db;


db.initialize = async function() {
    try {
       
        const { host, port, user, password, database } = config.database;
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();

        // connect to db
        const sequelize = new Sequelize(database, user, password, {
            dialect: 'mysql',
            logging: false
        });

       
        db.Account = require('../account/account.model')(sequelize, DataTypes);
        db.RefreshToken = require('../account/refresh-token.model')(sequelize, DataTypes);
        db.Booking = require('../booking/booking.model')(sequelize, DataTypes);
        db.Room = require('../booking/room.model')(sequelize, DataTypes);
        db.RoomType = require('../booking/room-type.model')(sequelize); 

        // define relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE', foreignKey: 'accountId' });
        db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

        db.Account.hasMany(db.Booking, { foreignKey: 'accountId'});
        db.Booking.belongsTo(db.Account, { foreignKey: 'accountId'});

      
        db.Room.hasMany(db.Booking, { foreignKey: 'room_id' });
        db.Booking.belongsTo(db.Room, { foreignKey: 'room_id' });

        db.RoomType.hasMany(db.Room, { foreignKey: 'roomTypeId' });
        db.Room.belongsTo(db.RoomType, { foreignKey: 'roomTypeId' });


        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');


        const userCount = await db.Account.count();
        if (userCount === 0) {
            await db.Account.seedDefaults();
            console.log('Default users have been seeded.');
        }

        db.sequelize = sequelize;

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
