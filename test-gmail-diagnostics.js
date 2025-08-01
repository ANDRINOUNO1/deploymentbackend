const emailService = require('./_helpers/email.service');
const nodemailer = require('nodemailer');

async function diagnoseGmailIssues() {
    console.log('🔍 Gmail Diagnostic Tool\n');
    
    // 1. Check email configuration
    console.log('1. 📧 Checking Email Configuration...');
    emailService.checkEmailConfig();
    console.log('');
    
    // 2. Test transporter connection
    console.log('2. 🔗 Testing Transporter Connection...');
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'bcflats1@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'ilmy kgmv oyft wczi'
            }
        });
        
        await transporter.verify();
        console.log('✅ Transporter connection successful');
    } catch (error) {
        console.error('❌ Transporter connection failed:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔐 AUTHENTICATION ERROR DETECTED');
            console.log('Possible solutions:');
            console.log('1. Check if your app password is correct');
            console.log('2. Generate a new app password in Google Account settings');
            console.log('3. Enable 2-factor authentication if not enabled');
            console.log('4. Make sure "Less secure app access" is enabled (if using regular password)');
        }
    }
    console.log('');
    
    // 3. Test simple email sending
    console.log('3. 📤 Testing Simple Email Sending...');
    try {
        const testResult = await emailService.sendPaymentConfirmation({
            id: 999,
            guest: {
                first_name: 'Test',
                last_name: 'User',
                email: 'sad.shion1@gmail.com'
            },
            availability: {
                checkIn: '2024-01-15',
                checkOut: '2024-01-17'
            },
            payment: {
                paymentMethod: 'Credit Card',
                amount: 250.00
            },
            pay_status: 'paid'
        }, 'sad.shion1@gmail.com');
        
        console.log('✅ Test email result:', testResult);
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
    }
    console.log('');
    
    // 4. Check Gmail account status
    console.log('4. 📋 Gmail Account Status Check...');
    console.log('Please manually check the following:');
    console.log('- Go to https://myaccount.google.com/security');
    console.log('- Check if 2-factor authentication is enabled');
    console.log('- Check if app passwords are properly configured');
    console.log('- Check if there are any security alerts');
    console.log('- Check if the account has been suspended');
    console.log('');
    
    // 5. Rate limiting check
    console.log('5. ⏱️ Rate Limiting Information...');
    console.log('Gmail limits:');
    console.log('- Regular accounts: ~500 emails/day');
    console.log('- Google Workspace: ~2000 emails/day');
    console.log('- Per-minute: ~20-30 emails');
    console.log('- Per-second: ~1 email');
    console.log('');
    
    // 6. Recommendations
    console.log('6. 💡 Recommendations...');
    console.log('If emails are not sending:');
    console.log('1. Generate a new app password');
    console.log('2. Wait 24 hours if rate limited');
    console.log('3. Check spam folder for test emails');
    console.log('4. Consider using a different email service (SendGrid, Mailgun)');
    console.log('5. Use Google Workspace for higher limits');
}

// Run diagnostics
diagnoseGmailIssues().catch(console.error); 