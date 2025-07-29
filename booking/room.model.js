// DataTypes is now passed in as the second argument
module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        roomNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
        roomTypeId: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    };

    const options = {
        timestamps: false,
        tableName: 'Rooms'
    };

    return sequelize.define('Room', attributes, options);
};
