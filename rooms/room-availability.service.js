const db = require('../_helpers/db');
const Room = db.Room;
const RoomOccupancy = db.RoomOccupancy;
const RoomType = db.RoomType;
const { Op } = require('sequelize');

module.exports = {
    findAvailableRooms,
    checkRoomAvailability,
    createRoomOccupancy,
    updateRoomOccupancy,
    getRoomOccupancy,
    getRoomAvailabilityCalendar
};

// Find available rooms for a specific date range
async function findAvailableRooms(checkIn, checkOut, roomTypeId = null) {
    try {
        console.log(`Finding available rooms from ${checkIn} to ${checkOut}, roomTypeId: ${roomTypeId}`);
        
        // Get all rooms of the specified type
        const whereClause = {};
        if (roomTypeId) {
            whereClause.roomTypeId = roomTypeId;
        }
        
        const allRooms = await Room.findAll({
            where: whereClause,
            include: [{
                model: RoomType,
                as: 'roomType'
            }],
            order: [['roomNumber', 'ASC']]
        });
        
        // Filter out rooms that have conflicting occupancy
        const availableRooms = [];
        for (const room of allRooms) {
            try {
                const isAvailable = await checkRoomAvailability(room.id, checkIn, checkOut);
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
        console.error('Error finding available rooms:', error);
        // Fallback to simple availability check
        console.log('Falling back to simple availability check...');
        const whereClause = { isAvailable: true };
        if (roomTypeId) {
            whereClause.roomTypeId = roomTypeId;
        }
        
        const fallbackRooms = await Room.findAll({
            where: whereClause,
            include: [{
                model: RoomType,
                as: 'roomType'
            }],
            order: [['roomNumber', 'ASC']]
        });
        
        console.log(`Fallback: Found ${fallbackRooms.length} available rooms`);
        return fallbackRooms;
    }
}

// Check if a specific room is available for a date range
async function checkRoomAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
    try {
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
        
        const conflictingOccupancy = await RoomOccupancy.findOne({ where: whereClause });
        const isAvailable = !conflictingOccupancy;
        
        console.log(`Room ${roomId} availability for ${checkIn} to ${checkOut}: ${isAvailable ? 'Available' : 'Occupied'}`);
        return isAvailable;
    } catch (error) {
        console.error('Error checking room availability:', error);
        // Return false (not available) on error to be safe
        return false;
    }
}

// Create room occupancy record
async function createRoomOccupancy(roomId, bookingId, checkIn, checkOut) {
    try {
        // Validate inputs
        if (!roomId || !bookingId || !checkIn || !checkOut) {
            console.error('Invalid inputs for createRoomOccupancy:', { roomId, bookingId, checkIn, checkOut });
            throw new Error('Invalid inputs for room occupancy creation');
        }
        
        // First check if room is available
        const isAvailable = await checkRoomAvailability(roomId, checkIn, checkOut);
        if (!isAvailable) {
            throw new Error(`Room ${roomId} is not available for the specified date range`);
        }
        
        const occupancy = await RoomOccupancy.create({
            roomId,
            bookingId,
            checkIn,
            checkOut,
            status: 'active'
        });
        
        console.log(`Created room occupancy: Room ${roomId}, Booking ${bookingId}, ${checkIn} to ${checkOut}`);
        return occupancy;
    } catch (error) {
        console.error('Error creating room occupancy:', error);
        throw error;
    }
}

// Update room occupancy (for extending stays)
async function updateRoomOccupancy(bookingId, newCheckOut) {
    try {
        const occupancy = await RoomOccupancy.findOne({
            where: { bookingId, status: 'active' }
        });
        
        if (!occupancy) {
            throw new Error(`No active occupancy found for booking ${bookingId}`);
        }
        
        // Check if the extended date conflicts with other bookings
        const isAvailable = await checkRoomAvailability(
            occupancy.roomId, 
            occupancy.checkIn, 
            newCheckOut, 
            bookingId
        );
        
        if (!isAvailable) {
            throw new Error(`Room is not available for the extended date range`);
        }
        
        await occupancy.update({ checkOut: newCheckOut });
        
        console.log(`Updated room occupancy: Booking ${bookingId}, new checkout: ${newCheckOut}`);
        return occupancy;
    } catch (error) {
        console.error('Error updating room occupancy:', error);
        throw error;
    }
}

// Get room occupancy for a specific room
async function getRoomOccupancy(roomId, startDate = null, endDate = null) {
    try {
        const whereClause = { roomId };
        
        if (startDate && endDate) {
            whereClause[Op.or] = [
                {
                    checkIn: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                {
                    checkOut: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                {
                    [Op.and]: [
                        { checkIn: { [Op.lte]: startDate } },
                        { checkOut: { [Op.gte]: endDate } }
                    ]
                }
            ];
        }
        
        const occupancy = await RoomOccupancy.findAll({
            where: whereClause,
            include: [{
                model: db.Booking,
                as: 'booking'
            }],
            order: [['checkIn', 'ASC']]
        });
        
        return occupancy;
    } catch (error) {
        console.error('Error getting room occupancy:', error);
        throw error;
    }
}

// Get room availability calendar (for frontend display)
async function getRoomAvailabilityCalendar(startDate, endDate, roomTypeId = null) {
    try {
        const whereClause = {};
        
        if (roomTypeId) {
            whereClause.roomTypeId = roomTypeId;
        }
        
        const rooms = await Room.findAll({
            where: whereClause,
            include: [{
                model: RoomType,
                as: 'roomType'
            }],
            order: [['roomNumber', 'ASC']]
        });
        
        const calendar = [];
        
        for (const room of rooms) {
            const occupancy = await getRoomOccupancy(room.id, startDate, endDate);
            
            calendar.push({
                roomId: room.id,
                roomNumber: room.roomNumber,
                roomType: room.roomType?.type || 'Unknown',
                occupancy: occupancy.map(o => ({
                    bookingId: o.bookingId,
                    checkIn: o.checkIn,
                    checkOut: o.checkOut,
                    status: o.status,
                    guestName: o.booking ? `${o.booking.guest_firstName} ${o.booking.guest_lastName}` : 'Unknown'
                }))
            });
        }
        
        return calendar;
    } catch (error) {
        console.error('Error getting room availability calendar:', error);
        throw error;
    }
} 