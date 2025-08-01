const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'bcflats1@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'ilmy kgmv oyft wczi' //kunin sa app password through google account
    }
};

let emailQueue = [];
let isProcessing = false;
const EMAIL_DELAY = 2000; 

const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
    bookingConfirmation: (bookingData) => ({
        subject: `BC Flats Hotel - Booking Confirmation for ${bookingData.guest.first_name} ${bookingData.guest.last_name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">🏨 BC Flats Hotel</h1>
                        <h2 style="color: #34495e; margin: 10px 0;">Booking Confirmation</h2>
                        <p style="color: #7f8c8d; margin: 10px 0;">Thank you for choosing BC Flats Hotel!</p>
                    </div>
                    
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">📋 Booking Details</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #34495e;">Booking ID:</strong><br>
                                <span style="color: #2c3e50;">#${bookingData.id}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Room Type:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.roomType || 'Standard'}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Check-in:</strong><br>
                                <span style="color: #2c3e50;">${new Date(bookingData.availability.checkIn).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Check-out:</strong><br>
                                <span style="color: #2c3e50;">${new Date(bookingData.availability.checkOut).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Adults:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.availability.adults}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Children:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.availability.children}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">👤 Guest Information</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #34495e;">Name:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.guest.first_name} ${bookingData.guest.last_name}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Email:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.guest.email}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Phone:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.guest.phone}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">City:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.guest.city}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">💳 Payment Information</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #34495e;">Payment Method:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.payment.paymentMethod}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Amount Paid:</strong><br>
                                <span style="color: #2c3e50;">$${bookingData.payment.amount}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Payment Status:</strong><br>
                                <span style="color: ${bookingData.pay_status === 'paid' ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                                    ${bookingData.pay_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    ${bookingData.requests ? `
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">📝 Special Requests</h2>
                        <p style="color: #2c3e50; margin: 0;">${bookingData.requests}</p>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                        <p style="color: #7f8c8d; margin: 0;">If you have any questions, please contact us at bcflats1@gmail.com</p>
                        <p style="color: #7f8c8d; margin: 10px 0;">Thank you for choosing BC Flats Hotel!</p>
                        <p style="color: #95a5a6; font-size: 12px; margin: 10px 0;">© 2024 BC Flats Hotel. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `
    }),

    paymentConfirmation: (bookingData) => ({
        subject: `BC Flats Hotel - Payment Confirmation for ${bookingData.guest.first_name} ${bookingData.guest.last_name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">🏨 BC Flats Hotel</h1>
                        <h2 style="color: #27ae60; margin: 10px 0;">✅ Payment Confirmed!</h2>
                        <p style="color: #7f8c8d; margin: 10px 0;">Your payment has been successfully processed.</p>
                    </div>
                    
                    <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #27ae60;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">💳 Payment Details</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #34495e;">Booking ID:</strong><br>
                                <span style="color: #2c3e50;">#${bookingData.id}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Payment Method:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.payment?.paymentMethod || bookingData.payment?.paymentMode || 'N/A'}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Amount Paid:</strong><br>
                                <span style="color: #27ae60; font-weight: bold;">$${bookingData.payment?.amount || bookingData.paidamount || 0}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Payment Status:</strong><br>
                                <span style="color: #27ae60; font-weight: bold;">✅ Confirmed</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">📋 Booking Summary</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #34495e;">Guest Name:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.guest.first_name} ${bookingData.guest.last_name}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Check-in:</strong><br>
                                <span style="color: #2c3e50;">${new Date(bookingData.availability.checkIn).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Check-out:</strong><br>
                                <span style="color: #2c3e50;">${new Date(bookingData.availability.checkOut).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <strong style="color: #34495e;">Room Type:</strong><br>
                                <span style="color: #2c3e50;">${bookingData.roomType || 'Standard'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                        <p style="color: #7f8c8d; margin: 0;">Your booking is now confirmed and payment has been received.</p>
                        <p style="color: #7f8c8d; margin: 10px 0;">If you have any questions, please contact us at bcflats1@gmail.com</p>
                        <p style="color: #95a5a6; font-size: 12px; margin: 10px 0;">© 2024 BC Flats Hotel. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `
    })
};


const emailService = {
 
    checkEmailConfig() {
        console.log('📧 Email User:', emailConfig.auth.user);
        
        if (emailConfig.auth.user === 'your-email@gmail.com') {
            console.warn('⚠️ Email configuration is using default values. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
        }
    },

    // queue 
    async processEmailQueue() {
        if (isProcessing || emailQueue.length === 0) return;
        
        isProcessing = true;
        
        while (emailQueue.length > 0) {
            const emailTask = emailQueue.shift();
            try {
                console.log(`📧 Sending email to: ${emailTask.to}`);
                const result = await emailTask.sendFunction();
                console.log(`✅ Email sent successfully to: ${emailTask.to}`);
                
                // Add delay between emails to respect Gmail rate limits
                if (emailQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY));
                }
            } catch (error) {
                console.error(`❌ Failed to send email to ${emailTask.to}:`, error.message);
            }
        }
        
        isProcessing = false;
    },

    // Add email to queue
    addToEmailQueue(sendFunction, to) {
        emailQueue.push({ sendFunction, to });
        this.processEmailQueue();
    },

    async sendBookingConfirmation(bookingData, recipientEmail) {
        try {
            const template = emailTemplates.bookingConfirmation(bookingData);
            
            const mailOptions = {
                from: '"BC Flats Hotel" <' + emailConfig.auth.user + '>',
                to: recipientEmail,
                subject: template.subject,
                html: template.html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Booking confirmation email sent successfully to', recipientEmail);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email Service: Error sending booking confirmation email:', error);
            return { success: false, error: error.message };
        }
    },

    // Send payment confirmation email
    async sendPaymentConfirmation(bookingData, recipientEmail) {
        try {
            const template = emailTemplates.paymentConfirmation(bookingData);
            
            const mailOptions = {
                from: '"BC Flats Hotel" <' + emailConfig.auth.user + '>',
                to: recipientEmail,
                subject: template.subject,
                html: template.html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Payment confirmation email sent successfully to', recipientEmail);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email Service: Error sending payment confirmation email:', error);
            return { success: false, error: error.message };
        }
    },

    async sendBookingConfirmationToMultiple(bookingData, recipientEmails) {
        const results = [];
        for (const email of recipientEmails) {
            const result = await this.sendBookingConfirmation(bookingData, email);
            results.push({ email, ...result });
        }
        return results;
    },


    async testEmailConnection() {
        try {
            await transporter.verify();
            console.log('✅ Email service is ready');
            return { success: true };
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = emailService; 

emailService.checkEmailConfig(); 