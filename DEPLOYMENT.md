# Railway Deployment Guide

## Backend Deployment

### Prerequisites
1. Install Railway CLI: `npm install -g @railway/cli`
2. Create a Railway account at https://railway.app
3. Create a new project in Railway

### Environment Variables Setup

Set these environment variables in your Railway project dashboard:

```
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Database Setup
1. Add a MySQL plugin to your Railway project
2. Copy the connection details to your environment variables
3. The application will automatically create the database and tables on first run

### Deployment Steps

1. **Link your project to Railway:**
   ```bash
   cd backendfinals
   railway login
   railway link
   ```

2. **Deploy:**
   ```bash
   railway up
   ```

3. **Set environment variables in Railway dashboard**

4. **Your API will be available at:**
   ```
   https://thriving-adventure-production.up.railway.app
   ```

### Health Check
- Endpoint: `GET /health`
- Returns: `{ "status": "OK", "timestamp": "..." }`

### API Endpoints
- Accounts: `/accounts`
- Bookings: `/bookings`
- Rooms: `/rooms`
- Archives: `/archives`

## Frontend Deployment

### Build for Production
```bash
cd "capstone2brobro front/Frontendbomboclat"
npm run build
```

### Deploy Frontend
You can deploy the frontend to:
- Vercel
- Netlify
- GitHub Pages
- Or any static hosting service

### Update API Base URL
Update the API base URL in your frontend environment files to point to your Railway backend URL.

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check environment variables
   - Ensure MySQL plugin is added to Railway project

2. **JWT Authentication Issues**
   - Verify JWT_SECRET is set correctly
   - Check CORS configuration

3. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility

### Logs
View deployment logs in Railway dashboard or use:
```bash
railway logs
```

## Security Notes
- Never commit sensitive environment variables
- Use strong JWT secrets
- Enable HTTPS in production
- Configure CORS properly for your frontend domain 