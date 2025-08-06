const db = require('./_helpers/db');
const { DataTypes } = require('sequelize');

async function addStatusField() {
    try {
        // Add status
        await db.sequelize.query(`
            ALTER TABLE Bookings 
            ADD COLUMN status ENUM('reserved', 'checked_in', 'checked_out') 
            DEFAULT 'reserved' 
            AFTER pay_status
        `);
        
        console.log('✅ Status field added successfully to Bookings table');
        
        // Update existing bookings
        await db.sequelize.query(`
            UPDATE Bookings 
            SET status = 'reserved' 
            WHERE status IS NULL
        `);
        
        console.log('✅ Existing bookings updated with default status');
        
    } catch (error) {
        console.error('❌ Error adding status field:', error);
    } finally {
        await db.sequelize.close();
    }
}


addStatusField(); 