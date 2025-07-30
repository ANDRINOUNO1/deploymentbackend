// room-type.model.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        type: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g., 'Classic', 'Deluxe', 'Prestige', 'Luxury'
        description: { type: DataTypes.STRING },
        basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    };

    const options = {
        timestamps: false, // No createdAt/updatedAt for this model
        tableName: 'RoomTypes' // Explicitly define table name
    };

    return sequelize.define('RoomType', attributes, options);
};
