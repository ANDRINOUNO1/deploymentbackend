
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

    const RoomType = sequelize.define('RoomType', attributes, options);
    
    RoomType.seedDefaults = async function() {
        const defaults = [
            {
                id: 1,
                type: 'Classic',
                description: 'Comfortable and affordable accommodation with essential amenities',
                basePrice: 120.00
            },
            {
                id: 2,
                type: 'Deluxe',
                description: 'Enhanced amenities and spacious rooms for a premium experience',
                basePrice: 200.00
            },
            {
                id: 3,
                type: 'Prestige',
                description: 'Luxury accommodations with premium services and amenities',
                basePrice: 150.00
            },
            {
                id: 4,
                type: 'Luxury',
                description: 'Ultimate luxury experience with top-tier amenities and services',
                basePrice: 80.00
            }
        ];
        
        for (const roomType of defaults) {
            await RoomType.findOrCreate({
                where: { type: roomType.type },
                defaults: roomType
            });
        }
        
        console.log('✅ Room types seeded successfully');
    };

    return RoomType;
};
