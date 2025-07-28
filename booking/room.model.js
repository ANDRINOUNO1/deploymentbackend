module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        room_number: { type: DataTypes.INTEGER, allowNull: false },
        room_type_id: { type: DataTypes.INTEGER, allowNull: false },
        floor: { type: DataTypes.INTEGER, allowNull: false },
        status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        timestamps: false,
        tableName: 'Rooms'
    });
    return Room;
};
