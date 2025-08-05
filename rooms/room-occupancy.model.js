module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        roomId: { type: DataTypes.INTEGER, allowNull: false },
        bookingId: { type: DataTypes.INTEGER, allowNull: false },
        checkIn: { type: DataTypes.DATE, allowNull: false },
        checkOut: { type: DataTypes.DATE, allowNull: false },
        status: { 
            type: DataTypes.ENUM('active', 'completed', 'cancelled'), 
            allowNull: false, 
            defaultValue: 'active' 
        },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    };

    const options = {
        timestamps: true,
        tableName: 'RoomOccupancy',
        indexes: [
            {
                fields: ['roomId', 'checkIn', 'checkOut']
            },
            {
                fields: ['bookingId']
            },
            {
                fields: ['status']
            }
        ]
    };

    const RoomOccupancy = sequelize.define('RoomOccupancy', attributes, options);
    
    // Instance methods
    RoomOccupancy.prototype.isOverlapping = function(otherOccupancy) {
        return !(this.checkOut <= otherOccupancy.checkIn || otherOccupancy.checkOut <= this.checkIn);
    };
    
    // Static methods
    RoomOccupancy.findAvailableRooms = async function(checkIn, checkOut, roomTypeId = null) {
        const whereClause = {
            [sequelize.Op.or]: [
                // Rooms with no occupancy in the date range
                {
                    id: {
                        [sequelize.Op.notIn]: sequelize.literal(`
                            SELECT DISTINCT "roomId" 
                            FROM "RoomOccupancy" 
                            WHERE "status" = 'active' 
                            AND (
                                ("checkIn" <= '${checkIn}' AND "checkOut" > '${checkIn}')
                                OR ("checkIn" < '${checkOut}' AND "checkOut" >= '${checkOut}')
                                OR ("checkIn" >= '${checkIn}' AND "checkOut" <= '${checkOut}')
                            )
                        `)
                    }
                },
                // Rooms with occupancy but not overlapping
                {
                    id: {
                        [sequelize.Op.in]: sequelize.literal(`
                            SELECT DISTINCT r.id
                            FROM "Rooms" r
                            LEFT JOIN "RoomOccupancy" ro ON r.id = ro."roomId" 
                                AND ro."status" = 'active'
                                AND (
                                    (ro."checkIn" <= '${checkIn}' AND ro."checkOut" > '${checkIn}')
                                    OR (ro."checkIn" < '${checkOut}' AND ro."checkOut" >= '${checkOut}')
                                    OR (ro."checkIn" >= '${checkIn}' AND ro."checkOut" <= '${checkOut}')
                                )
                            WHERE ro."roomId" IS NULL
                        `)
                    }
                }
            ]
        };
        
        if (roomTypeId) {
            whereClause.roomTypeId = roomTypeId;
        }
        
        return await sequelize.models.Room.findAll({
            where: whereClause,
            include: [{
                model: sequelize.models.RoomType,
                as: 'roomType'
            }]
        });
    };
    
    RoomOccupancy.checkRoomAvailability = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
        const whereClause = {
            roomId,
            status: 'active',
            [sequelize.Op.or]: [
                {
                    checkIn: {
                        [sequelize.Op.lt]: checkOut,
                        [sequelize.Op.gte]: checkIn
                    }
                },
                {
                    checkOut: {
                        [sequelize.Op.gt]: checkIn,
                        [sequelize.Op.lte]: checkOut
                    }
                },
                {
                    [sequelize.Op.and]: [
                        { checkIn: { [sequelize.Op.gte]: checkIn } },
                        { checkOut: { [sequelize.Op.lte]: checkOut } }
                    ]
                }
            ]
        };
        
        if (excludeBookingId) {
            whereClause.bookingId = { [sequelize.Op.ne]: excludeBookingId };
        }
        
        const conflictingOccupancy = await this.findOne({ where: whereClause });
        return !conflictingOccupancy; // Return true if room is available
    };
    
    return RoomOccupancy;
}; 