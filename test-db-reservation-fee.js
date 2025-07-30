const axios = require('axios');

async function testDatabaseReservationFee() {
    try {
        console.log('🧪 Testing database-integrated reservation fee...');
        
        // Test GET reservation fee from database
        console.log('\n1. Testing GET /rooms/reservation-fee (from database)...');
        const getResponse = await axios.get('http://localhost:4000/rooms/reservation-fee');
        console.log('✅ GET Response:', getResponse.data);
        
        // Test PUT update reservation fee in database
        console.log('\n2. Testing PUT /rooms/reservation-fee (update in database)...');
        const putResponse = await axios.put('http://localhost:4000/rooms/reservation-fee', { 
            fee: 750 
        });
        console.log('✅ PUT Response:', putResponse.data);
        
        // Test GET again to verify database update
        console.log('\n3. Testing GET again to verify database update...');
        const getResponse2 = await axios.get('http://localhost:4000/rooms/reservation-fee');
        console.log('✅ Updated GET Response:', getResponse2.data);
        
        // Test another update
        console.log('\n4. Testing another update to 600...');
        const putResponse2 = await axios.put('http://localhost:4000/rooms/reservation-fee', { 
            fee: 600 
        });
        console.log('✅ Second PUT Response:', putResponse2.data);
        
        // Final verification
        console.log('\n5. Final verification...');
        const getResponse3 = await axios.get('http://localhost:4000/rooms/reservation-fee');
        console.log('✅ Final GET Response:', getResponse3.data);
        
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Backend server is not running. Please start it with: node server.js');
        }
    }
}

testDatabaseReservationFee(); 