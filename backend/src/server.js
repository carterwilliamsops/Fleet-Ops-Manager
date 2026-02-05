const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Fleet Manager API Server Running    ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                          
║  Environment: ${process.env.NODE_ENV || 'development'}
║  
║  API Endpoints:
║  - POST /api/auth/login
║  - GET  /api/vehicles
║  - GET  /api/tickets
║  - GET  /api/reports/dashboard-summary
║  
║  Health Check: http://localhost:${PORT}/health
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
