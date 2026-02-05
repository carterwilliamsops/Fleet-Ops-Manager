const express = require('express');
const AuthController = require('../controllers/auth.controller');
const VehicleController = require('../controllers/vehicle.controller');
const TicketController = require('../controllers/ticket.controller');
const WorkOrderController = require('../controllers/workorder.controller');
const ReportsController = require('../controllers/reports.controller');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);

// ===== AUTHENTICATED ROUTES =====
router.use(authenticateToken);

// Auth
router.get('/auth/me', AuthController.getCurrentUser);

// Users
router.get('/users', requireRole('Admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/technicians', async (req, res) => {
  try {
    const technicians = await User.getTechnicians();
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/drivers', async (req, res) => {
  try {
    const drivers = await User.getDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vehicles
router.get('/vehicles', VehicleController.getAll);
router.get('/vehicles/:id', VehicleController.getById);
router.get('/vehicles/vin/:vin', VehicleController.getByVIN);
router.post('/vehicles', requireRole('Admin', 'Technician'), VehicleController.create);
router.patch('/vehicles/:id', requireRole('Admin', 'Technician'), VehicleController.update);
router.get('/vehicles/:id/maintenance-history', VehicleController.getMaintenanceHistory);

// Tickets
router.get('/tickets', TicketController.getAll);
router.get('/tickets/:id', TicketController.getById);
router.post('/tickets', TicketController.create);
router.patch('/tickets/:id/status', requireRole('Admin', 'Technician'), TicketController.updateStatus);
router.get('/tickets/statistics', TicketController.getStatistics);

// Work Orders
router.get('/work-orders', WorkOrderController.getAll);
router.get('/work-orders/:id', WorkOrderController.getById);
router.post('/work-orders', requireRole('Admin', 'Technician'), WorkOrderController.create);
router.post('/work-orders/:id/start', requireRole('Admin', 'Technician'), WorkOrderController.start);
router.post('/work-orders/:id/complete', requireRole('Admin', 'Technician'), WorkOrderController.complete);
router.post('/work-orders/:id/repair-items', requireRole('Admin', 'Technician'), WorkOrderController.addRepairItem);
router.get('/work-orders/:id/repair-items', WorkOrderController.getRepairItems);

// Reports & Analytics
router.get('/reports/common-repairs', ReportsController.getCommonRepairs);
router.get('/reports/repair-time-by-vehicle', ReportsController.getRepairTimeByVehicle);
router.get('/reports/repair-time-by-technician', ReportsController.getRepairTimeByTechnician);
router.get('/reports/vehicle-status-distribution', ReportsController.getVehicleStatusDistribution);
router.get('/reports/ticket-trends', ReportsController.getTicketTrends);
router.get('/reports/cost-analysis', ReportsController.getCostAnalysis);
router.get('/reports/fleet-health-score', ReportsController.getFleetHealthScore);
router.get('/reports/dashboard-summary', ReportsController.getDashboardSummary);

// Exports
router.get('/reports/export/maintenance-log', requireRole('Admin', 'Technician'), ReportsController.exportMaintenanceLog);
router.get('/reports/export/repair-analytics', requireRole('Admin', 'Technician'), ReportsController.exportRepairAnalytics);

module.exports = router;
