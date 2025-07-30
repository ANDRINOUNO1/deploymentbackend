const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 500.00 },
        description: { type: DataTypes.STRING, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    };

    const options = {
        timestamps: true,
        tableName: 'ReservationFees'
    };

    const ReservationFee = sequelize.define('ReservationFee', attributes, options);
    
    ReservationFee.seedDefaults = async function() {

        const count = await ReservationFee.count();
        
        if (count === 0) {
            await ReservationFee.create({
                fee: 500.00,
                description: 'every room reservation fee for the moments',
                isActive: true
            });
            
        }
    };

    return ReservationFee;
}; 