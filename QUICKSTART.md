# Quick Start Guide - Fleet Manager

Get up and running in 5 minutes!

## Step 1: Install PostgreSQL

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download installer from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE fleet_manager;
CREATE USER fleet_admin WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE fleet_manager TO fleet_admin;
\q
```

## Step 3: Setup Backend

```bash
# Navigate to backend directory
cd fleet-manager-app/backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DB_USER=fleet_admin
DB_HOST=localhost
DB_NAME=fleet_manager
DB_PASSWORD=SecurePass123!
DB_PORT=5432
PORT=3001
NODE_ENV=development
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Run database migration
node src/scripts/migrate.js

# Start server
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║   Fleet Manager API Server Running    ║
╠════════════════════════════════════════╣
║  Port: 3001
║  Environment: development
```

## Step 4: Test API

Open a new terminal:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleetmanager.com","password":"admin123"}'
```

## Step 5: Launch Web Dashboard

```bash
# Navigate to web dashboard
cd fleet-manager-app/apps/web-dashboard

# Start simple HTTP server
python3 -m http.server 8080

# Or use Node's http-server:
npx http-server -p 8080
```

Open browser: http://localhost:8080

**Login with:**
- Email: `admin@fleetmanager.com`
- Password: `admin123`

## Step 6: Launch Mobile App

```bash
# Navigate to mobile app
cd fleet-manager-app/apps/mobile-driver

# Start HTTP server
python3 -m http.server 8081
```

Open browser: http://localhost:8081

**Login with:**
- Email: `driver@fleetmanager.com`
- Password: `admin123`

## Testing on Mobile Device

### Option 1: ngrok (Recommended)
```bash
# Install ngrok: https://ngrok.com/download

# Expose mobile app
ngrok http 8081

# You'll get a URL like: https://abc123.ngrok.io
# Access this on your phone
```

### Option 2: Local Network
```bash
# Find your local IP
# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig

# Access via: http://YOUR_IP:8081
```

## What's Next?

### Add Your First Vehicle
1. Login to web dashboard as Admin
2. Click "Vehicles" in sidebar
3. Click "Add Vehicle" button
4. Fill in details:
   - VIN: `1HGCM82633A123456`
   - Make: `Honda`
   - Model: `Accord`
   - Year: `2023`
5. Click "Create Vehicle"

### Submit Your First Ticket
1. Open mobile app as Driver
2. Tap "Report Issue"
3. Enter VIN: `1HGCM82633A123456`
4. Select Category: `Engine`
5. Set Priority: `High`
6. Add Description: `Check engine light is on`
7. Tap "Submit Ticket"

### View Analytics
1. Back in web dashboard
2. Click "Reports" in sidebar
3. See "Most Common Repairs" chart
4. Export data as CSV or PDF

## Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U fleet_admin -d fleet_manager -c "SELECT 1"

# Check port 3001 is free
lsof -i :3001
```

### Frontend can't connect to API
1. Check backend is running on port 3001
2. Check `API_BASE_URL` in HTML files
3. Check browser console for CORS errors
4. Verify `.env` has correct settings

### Database connection error
```bash
# Verify credentials
psql -U fleet_admin -d fleet_manager

# If password fails, reset it:
sudo -u postgres psql
ALTER USER fleet_admin WITH PASSWORD 'SecurePass123!';
```

### Migration fails
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE fleet_manager;
CREATE DATABASE fleet_manager;
GRANT ALL PRIVILEGES ON DATABASE fleet_manager TO fleet_admin;
\q

# Run migration again
node src/scripts/migrate.js
```

## Production Tips

### Security
1. Change default passwords immediately
2. Use strong JWT_SECRET (32+ characters)
3. Enable HTTPS in production
4. Set NODE_ENV=production
5. Use environment variables for all secrets

### Performance
1. Enable PostgreSQL connection pooling
2. Add Redis for session storage
3. Implement rate limiting
4. Enable gzip compression
5. Use CDN for static assets

### Monitoring
1. Set up logging (Winston, Pino)
2. Add error tracking (Sentry)
3. Monitor database performance
4. Set up uptime monitoring
5. Track API response times

## Need Help?

- 📚 Full Documentation: See README.md
- 🐛 Report Issues: Create GitHub issue
- 💬 Questions: Open discussion
- 📧 Email: support@fleetmanager.com

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fleetmanager.com | admin123 |
| Technician | tech@fleetmanager.com | admin123 |
| Driver | driver@fleetmanager.com | admin123 |

**⚠️ CHANGE THESE IN PRODUCTION!**

---

Happy fleet managing! 🚗📊
