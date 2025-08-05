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
        try {
            const { Op } = require('sequelize');
            
            // Get all rooms of the specified type
            const whereClause = {};
            if (roomTypeId) {
                whereClause.roomTypeId = roomTypeId;
            }
            
            const allRooms = await sequelize.models.Room.findAll({
                where: whereClause,
                include: [{
                    model: sequelize.models.RoomType,
                    as: 'roomType'
                }],
                order: [['roomNumber', 'ASC']]
            });
            
            // Filter out rooms that have conflicting occupancy
            const availableRooms = [];
            for (const room of allRooms) {
                try {
                    const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut);
                    if (isAvailable) {
                        availableRooms.push(room);
                    }
                } catch (error) {
                    console.error(`Error checking availability for room ${room.id}:`, error);
                    // If we can't check availability, assume room is available
                    availableRooms.push(room);
                }
            }
            
            console.log(`Found ${availableRooms.length} available rooms out of ${allRooms.length} total`);
            return availableRooms;
        } catch (error) {
            console.error('Error in findAvailableRooms:', error);
            // Fallback to simple availability check
            console.log('Falling back to simple availability check...');
            const whereClause = { isAvailable: true };
            if (roomTypeId) {
                whereClause.roomTypeId = roomTypeId;
            }
            
            const fallbackRooms = await sequelize.models.Room.findAll({
                where: whereClause,
                include: [{
                    model: sequelize.models.RoomType,
                    as: 'roomType'
                }],
                order: [['roomNumber', 'ASC']]
            });
            
            console.log(`Fallback: Found ${fallbackRooms.length} available rooms`);
            return fallbackRooms;
        }
    };
    
    RoomOccupancy.checkRoomAvailability = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
        try {
            const { Op } = require('sequelize');
            
            // Validate inputs
            if (!roomId || !checkIn || !checkOut) {
                console.log(`Invalid inputs: roomId=${roomId}, checkIn=${checkIn}, checkOut=${checkOut}`);
                return false;
            }
            
            const whereClause = {
                roomId,
                status: 'active',
                [Op.or]: [
                    {
                        checkIn: {
                            [Op.lt]: checkOut,
                            [Op.gte]: checkIn
                        }
                    },
                    {
                        checkOut: {
                            [Op.gt]: checkIn,
                            [Op.lte]: checkOut
                        }
                    },
                    {
                        [Op.and]: [
                            { checkIn: { [Op.gte]: checkIn } },
                            { checkOut: { [Op.lte]: checkOut } }
                        ]
                    }
                ]
            };
            
            if (excludeBookingId) {
                whereClause.bookingId = { [Op.ne]: excludeBookingId };
            }
            
            const conflictingOccupancy = await this.findOne({ where: whereClause });
            const isAvailable = !conflictingOccupancy;
            
            console.log(`Room ${roomId} availability for ${checkIn} to ${checkOut}: ${isAvailable ? 'Available' : 'Occupied'}`);
            return isAvailable;
        } catch (error) {
            console.error('Error checking room availability:', error);
            // Return false (not available) on error to be safe
            return false;
        }
    };
    
    return RoomOccupancy;
}; 