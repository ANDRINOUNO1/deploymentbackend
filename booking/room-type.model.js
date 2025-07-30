
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        type: { type: DataTypes.STRING, allowNull: false, unique: true }, 
        description: { type: DataTypes.STRING },
        basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    };

    const options = {
        timestamps: false, 
        tableName: 'RoomTypes' 
    };

    return sequelize.define('RoomType', attributes, options);
};
