const AnalyticsService = require('../services/analytics.service');
const ExportService = require('../services/export.service');
const Vehicle = require('../models/Vehicle');
const path = require('path');
const fs = require('fs');

class ReportsController {
  static async getCommonRepairs(req, res) {
    try {
      const { start_date, end_date, limit } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const repairs = await AnalyticsService.getCommonRepairs(
        startDate, 
        endDate, 
        parseInt(limit) || 10
      );
      
      res.json(repairs);
    } catch (error) {
      console.error('Get common repairs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getRepairTimeByVehicle(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const data = await AnalyticsService.getRepairTimeByVehicle(startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error('Get repair time by vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getRepairTimeByTechnician(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const data = await AnalyticsService.getRepairTimeByTechnician(startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error('Get repair time by technician error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getVehicleStatusDistribution(req, res) {
    try {
      const data = await AnalyticsService.getVehicleStatusDistribution();
      res.json(data);
    } catch (error) {
      console.error('Get vehicle status distribution error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTicketTrends(req, res) {
    try {
      const { start_date, end_date, interval } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const data = await AnalyticsService.getTicketTrends(
        startDate, 
        endDate, 
        interval || 'day'
      );
      res.json(data);
    } catch (error) {
      console.error('Get ticket trends error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getCostAnalysis(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const data = await AnalyticsService.getCostAnalysis(startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error('Get cost analysis error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getFleetHealthScore(req, res) {
    try {
      const data = await AnalyticsService.getFleetHealthScore();
      res.json(data);
    } catch (error) {
      console.error('Get fleet health score error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDashboardSummary(req, res) {
    try {
      const summary = await AnalyticsService.getDashboardSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async exportMaintenanceLog(req, res) {
    try {
      const { format, start_date, end_date, vehicle_id } = req.query;
      
      if (!format || !['csv', 'pdf'].includes(format)) {
        return res.status(400).json({ error: 'Valid format (csv or pdf) is required' });
      }

      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      // Get maintenance data
      let maintenanceData;
      if (vehicle_id) {
        maintenanceData = await Vehicle.getMaintenanceHistory(vehicle_id);
      } else {
        // Get all vehicles' maintenance history
        const vehicles = await Vehicle.findAll();
        maintenanceData = [];
        for (const vehicle of vehicles) {
          const history = await Vehicle.getMaintenanceHistory(vehicle.id);
          maintenanceData.push(...history.map(h => ({
            ...h,
            vehicle_id: vehicle.id,
            vin: vehicle.vin,
            make: vehicle.make,
            model: vehicle.model
          })));
        }
      }

      const formattedData = ExportService.formatMaintenanceData(maintenanceData);
      
      const timestamp = Date.now();
      const filename = `maintenance_log_${timestamp}.${format}`;
      const outputPath = path.join('/tmp', filename);

      if (format === 'csv') {
        await ExportService.generateMaintenanceCSV(formattedData, outputPath);
      } else {
        await ExportService.generatePDFReport({
          summary: await AnalyticsService.getDashboardSummary(),
          commonRepairs: await AnalyticsService.getCommonRepairs(startDate, endDate, 10),
          vehiclePerformance: await AnalyticsService.getRepairTimeByVehicle(startDate, endDate),
          costAnalysis: await AnalyticsService.getCostAnalysis(startDate, endDate)
        }, outputPath);
      }

      res.download(outputPath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up file after download
        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
      });
    } catch (error) {
      console.error('Export maintenance log error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async exportRepairAnalytics(req, res) {
    try {
      const { format, start_date, end_date } = req.query;
      
      if (!format || format !== 'csv') {
        return res.status(400).json({ error: 'CSV format is required' });
      }

      const startDate = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const repairs = await AnalyticsService.getCommonRepairs(startDate, endDate, 100);
      
      const timestamp = Date.now();
      const filename = `repair_analytics_${timestamp}.csv`;
      const outputPath = path.join('/tmp', filename);

      await ExportService.generateRepairAnalyticsCSV(repairs, outputPath);

      res.download(outputPath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
      });
    } catch (error) {
      console.error('Export repair analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ReportsController;
