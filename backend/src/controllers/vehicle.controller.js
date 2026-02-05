const Vehicle = require('../models/Vehicle');

class VehicleController {
  static async getAll(req, res) {
    try {
      const vehicles = await Vehicle.findAll();
      res.json(vehicles);
    } catch (error) {
      console.error('Get all vehicles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getByVIN(req, res) {
    try {
      const { vin } = req.params;
      const vehicle = await Vehicle.findByVIN(vin);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Get vehicle by VIN error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const { vin, make, model, year, license_plate, assigned_driver_id } = req.body;

      if (!vin || !make || !model || !year) {
        return res.status(400).json({ error: 'VIN, make, model, and year are required' });
      }

      const existingVehicle = await Vehicle.findByVIN(vin);
      if (existingVehicle) {
        return res.status(409).json({ error: 'Vehicle with this VIN already exists' });
      }

      const vehicle = await Vehicle.create({
        vin,
        make,
        model,
        year,
        license_plate,
        assigned_driver_id
      });

      res.status(201).json(vehicle);
    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const vehicle = await Vehicle.update(id, updates);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMaintenanceHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await Vehicle.getMaintenanceHistory(id);
      res.json(history);
    } catch (error) {
      console.error('Get maintenance history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = VehicleController;
