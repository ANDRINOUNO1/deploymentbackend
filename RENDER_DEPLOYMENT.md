# Render Deployment Guide

## Render Configuration

### Build Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node.js Version**: 18.x (specified in package.json and .nvmrc)

### Environment Variables:
Set these in your Render dashboard:

**Database Configuration:**
- `DB_HOST`: `153.92.15.31`
- `DB_NAME`: `u875409848_mata`
- `DB_USER`: `u875409848_mata`
- `DB_PASSWORD`: `]8v]5+mK`
- `DB_PORT`: `3306`
- `DB_DIALECT`: `mysql`

**JWT Configuration:**
- `JWT_SECRET`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

**Server Configuration:**
- `NODE_ENV`: `production`
- `PORT`: `5000` (Render will override this)

## Deployment Steps:

1. **Push your updated code** to your Git repository
2. **In Render dashboard**:
   - Create new Web Service
   - Connect your Git repository
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
   - Add all environment variables listed above
3. **Deploy** - Render will use Node.js 18.x and avoid the debug module issue

## What Will Happen:
- ✅ Uses Node.js 18.x (stable version)
- ✅ Connects to your online MySQL database
- ✅ Adds `reservationFeePercentage` to room types
- ✅ Seeds room types with new percentage-based fees
- ✅ Removes old reservation fee table
- ✅ Your API will be available at `https://your-backend-name.onrender.com`

## Troubleshooting:
If you still get the debug module error, try:
1. Clear Render cache
2. Redeploy with the updated package.json
3. Make sure you're using the `npm install` build command, not `npm start` 