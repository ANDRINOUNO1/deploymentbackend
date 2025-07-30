const emailService = require('./_helpers/email.service');

async function testEmailFunctionality() {
    console.log('🧪 Testing Email Functionality...\n');
    
    // Check email configuration
    console.log('1. Checking email configuration...');
    emailService.checkEmailConfig();
    console.log('');
    
    // Test email sending
    console.log('2. Testing email sending...');
    const testBooking = {
        id: 999,
        guest: {
            first_name: 'Test',
            last_name: 'User',
            email: 'sad.shion1@gmail.com', // Your test email
            phone: '+1234567890',
            city: 'Test City'
        },
        availability: {
            checkIn: '2024-01-15',
            checkOut: '2024-01-17',
            adults: 2,
            children: 1
        },
        payment: {
            paymentMethod: 'Credit Card',
            amount: 250.00
        },
        pay_status: 'paid',
        requests: 'Test booking'
    };
    
    try {
        const result = await emailService.sendBookingConfirmation(testBooking, testBooking.guest.email);
        console.log('✅ Test email result:', result);
        
        if (result.success) {
            console.log('🎉 Email test successful! Check your inbox at sad.shion1@gmail.com');
        } else {
            console.log('❌ Email test failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Email test error:', error);
    }
}

// Run the test
testEmailFunctionality(); 