const db = require('../_helpers/db');
const Booking = db.Booking;
const Room = db.Room; 
const Archive = db.Archive;
const RoomType = db.RoomType;
const RoomOccupancy = db.RoomOccupancy;
const emailService = require('../_helpers/email.service');
const roomAvailabilityService = require('../rooms/room-availability.service');
const { Op } = require('sequelize');

module.exports = {
    createBooking,
    getAllBookings,
    updateBooking,
    extendBooking,
    deleteBooking,
    getBookingById,
    getBookingByEmail,
    checkInBooking
};

// --- Mapping functions ---
function flattenBooking(nested) {
    return {
    
        guest_firstName: nested.guest?.first_name || nested.guest?.firstName || '',
        guest_lastName: nested.guest?.last_name || nested.guest?.lastName || '',
        guest_email: nested.guest?.email || '',
        guest_phone: nested.guest?.phone || '',
        guest_address: nested.guest?.address || '',
        guest_city: nested.guest?.city || '',

        checkIn: nested.availability?.checkIn || '',
        checkOut: nested.availability?.checkOut || '',
        adults: nested.availability?.adults || 0,
        children: nested.availability?.children || 0,
        rooms: nested.availability?.rooms || 1,
 
        paymentMode: nested.payment?.paymentMode || '',
        paymentMethod: nested.payment?.paymentMethod || '',
        amount: nested.payment?.amount || 0,
        cardNumber: nested.payment?.cardNumber || '',
        expiry: nested.payment?.expiry || '',
        cvv: nested.payment?.cvv || '',
  
        room_id: nested.room_id,
       
        pay_status: nested.pay_status || false, //(for pending)
        created_at: nested.created_at || new Date(),
        updated_at: nested.updated_at || new Date(),
        requests: nested.requests || '',
        paidamount: nested.paidamount || nested.payment?.amount || 0, //(for reservation amount)
        status: nested.status || 'reserved'  //default to 'reserved'
    };
}

function nestBooking(flat) {
    // Helper function to format dates consistently
    const formatDate = (dateValue) => {
        if (!dateValue) return null;
        
        try {
            let date;
            
            
            if (dateValue instanceof Date) {
                date = dateValue;
            } else if (typeof dateValue === 'string') {
                date = new Date(dateValue);
            } else {
                date = new Date(dateValue);
            }
            
            if (isNaN(date.getTime())) {
                console.error('Invalid date value:', dateValue);
                return null;
            }
            
            // Return YYYY-MM-DD format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', dateValue, error);
            return null;
        }
    };

    return {
        id: flat.id,
        guest: {
            first_name: flat.guest_firstName,
            last_name: flat.guest_lastName,
            email: flat.guest_email,
            phone: flat.guest_phone,
            address: flat.guest_address,
            city: flat.guest_city
        },
        availability: {
            checkIn: formatDate(flat.checkIn),
            checkOut: formatDate(flat.checkOut),
            adults: flat.adults,
            children: flat.children,
            rooms: flat.rooms
        },
        payment: {
            paymentMode: flat.paymentMode,
            paymentMethod: flat.paymentMethod,
            amount: flat.amount,
            cardNumber: flat.cardNumber,
            expiry: flat.expiry,
            cvv: flat.cvv
        },
        room_id: flat.room_id,
        pay_status: flat.pay_status,
        created_at: flat.created_at,
        updated_at: flat.updated_at,
        requests: flat.requests,
        paidamount: flat.paidamount,
        status: flat.status || 'reserved'
    };
}

// Helper function to calculate reservation fee based on room type
async function calculateReservationFee(roomTypeId) {
    try {
        const roomType = await RoomType.findByPk(roomTypeId);
        if (!roomType) {
            throw new Error('Room type not found');
        }
        
        const reservationFee = (parseFloat(roomType.basePrice) * parseFloat(roomType.reservationFeePercentage)) / 100;
        return Math.round(reservationFee * 100) / 100; // Round to 2 decimal places
    } catch (err) {
        console.error('Error calculating reservation fee:', err);
        return 0;
    }
}

// --- Service functions ---
async function createBooking(nestedBooking) {
    const flatBooking = flattenBooking(nestedBooking);
    
    // Calculate reservation fee based on room type
    const reservationFee = await calculateReservationFee(nestedBooking.roomTypeId);
    
    if (!flatBooking.amount || flatBooking.amount < reservationFee) {
        throw new Error(`Payment amount must be at least ₱${reservationFee} (${reservationFee}% of room price).`);
    }

    // Find available rooms using date-based availability
    const availableRooms = await roomAvailabilityService.findAvailableRooms(
        flatBooking.checkIn,
        flatBooking.checkOut,
        nestedBooking.roomTypeId
    );
    
    if (availableRooms.length < (flatBooking.rooms || 1)) {
        throw new Error(`Not enough available rooms for selected type. Only ${availableRooms.length} rooms available for the selected dates.`);
    }

    const bookings = [];
    for (let i = 0; i < (flatBooking.rooms || 1); i++) {
        const room = availableRooms[i];
        
        // Create booking
        const booking = await Booking.create({
            ...flatBooking,
            room_id: room.id
        });
        
        // Create room occupancy record
        await roomAvailabilityService.createRoomOccupancy(
            room.id,
            booking.id,
            flatBooking.checkIn,
            flatBooking.checkOut
        );
        
        const nestedBooking = nestBooking(booking);
        bookings.push(nestedBooking);
    }
    return bookings;
}

async function getAllBookings() {
    const bookings = await Booking.findAll();
    return bookings.map(nestBooking);
}

async function updateBooking(id, nestedBooking) {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    const flatBooking = flattenBooking(nestedBooking);
    await booking.update(flatBooking);
    return nestBooking(booking);
}

async function extendBooking(id, updateData) {
    console.log('Extend booking called with ID:', id);
    console.log('Update data received:', updateData);
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
        console.error('Booking not found with ID:', id);
        return null;
    }
    
    console.log('Current booking data:', booking.toJSON());
    
    try {
        // Handle flat structure from frontend
        const updateFields = {};
        
        // Update checkout date if provided
        if (updateData.checkOut) {
            // Check room availability for the extended period
            const isAvailable = await roomAvailabilityService.checkRoomAvailability(
                booking.room_id,
                booking.checkIn,
                updateData.checkOut,
                booking.id
            );
            
            if (!isAvailable) {
                throw new Error('Room is not available for the extended date range. Please choose different dates.');
            }
            
            updateFields.checkOut = updateData.checkOut;
            console.log('Setting checkout date to:', updateData.checkOut);
            
            // Update room occupancy record
            await roomAvailabilityService.updateRoomOccupancy(booking.id, updateData.checkOut);
        }
        
        // Update total amount if provided
        if (updateData.totalAmount !== undefined) {
            updateFields.paidamount = updateData.totalAmount;
            console.log('Setting total amount to:', updateData.totalAmount);
        }
        
        // Update other fields if provided (preserve existing data)
        if (updateData.guest_firstName) updateFields.guest_firstName = updateData.guest_firstName;
        if (updateData.guest_lastName) updateFields.guest_lastName = updateData.guest_lastName;
        if (updateData.guest_email) updateFields.guest_email = updateData.guest_email;
        if (updateData.guest_phone) updateFields.guest_phone = updateData.guest_phone;
        if (updateData.checkIn) updateFields.checkIn = updateData.checkIn;
        if (updateData.roomType) updateFields.roomType = updateData.roomType;
        
        // Always preserve the current status - don't change it during extension
        updateFields.status = booking.status;
        console.log('Preserving current status:', booking.status);
        
        // Always update the updated_at timestamp
        updateFields.updated_at = new Date();
        
        console.log('Final update fields:', updateFields);
        
        await booking.update(updateFields);
        const updatedBooking = nestBooking(booking);
        console.log('Updated booking result:', updatedBooking);
        return updatedBooking;
    } catch (error) {
        console.error('Error extending booking:', error);
        throw error;
    }
}

async function deleteBooking(id) {
    const booking = await Booking.findByPk(id);
    if (!booking) return false;

    await Archive.create({
        ...booking.toJSON(),
        deleted_at: new Date()
    });

    // Update room occupancy status to completed
    const occupancy = await RoomOccupancy.findOne({
        where: { bookingId: id, status: 'active' }
    });
    
    if (occupancy) {
        await occupancy.update({ status: 'completed' });
    }

    await booking.destroy();
    return true;
}

async function getBookingById(id) {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    return nestBooking(booking);
}

async function getBookingByEmail(email) {
    const booking = await Booking.findOne({
        where: { guest_email: email },
        order: [['created_at', 'DESC']] 
    });
    if (!booking) return null;
    return nestBooking(booking);
}

async function checkInBooking(id) {
    const booking = await Booking.findByPk(id);
    if (!booking) {
        console.error('Booking not found with ID:', id);
        return null;
    }

    // Allow check-in for any status except already checked-in or checked-out
    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
        console.error('Booking with ID', id, 'is already checked in or checked out.');
        return null;
    }

    try {
        booking.status = 'checked_in';
        booking.updated_at = new Date();
        await booking.save();

        // Update room occupancy status to active
        const occupancy = await RoomOccupancy.findOne({
            where: { bookingId: id, status: 'completed' }
        });

        if (occupancy) {
            await occupancy.update({ status: 'active' });
        }

        console.log('Booking with ID', id, 'checked in successfully.');
        return nestBooking(booking);
    } catch (error) {
        console.error('Error checking in booking:', error);
        throw error;
    }
}

module.exports.getBookingById = getBookingById;
