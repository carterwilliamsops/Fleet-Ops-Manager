const Ticket = require('../models/Ticket');
const WorkOrder = require('../models/WorkOrder');

class TicketController {
  static async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        vehicle_id: req.query.vehicle_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const tickets = await Ticket.findAll(filters);
      res.json(tickets);
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Get repair items if work order exists
      if (ticket.work_order_id) {
        ticket.repair_items = await WorkOrder.getRepairItems(ticket.work_order_id);
      }

      res.json(ticket);
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const { vehicle_id, submitted_by, category, description, priority, photo_url } = req.body;

      if (!vehicle_id || !submitted_by || !category || !description) {
        return res.status(400).json({ 
          error: 'vehicle_id, submitted_by, category, and description are required' 
        });
      }

      const ticket = await Ticket.create({
        vehicle_id,
        submitted_by,
        category,
        description,
        priority,
        photo_url
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['Open', 'In Progress', 'Closed'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }

      const ticket = await Ticket.updateStatus(id, status);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      console.error('Update ticket status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStatistics(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end_date || new Date().toISOString();

      const stats = await Ticket.getStatistics(startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error('Get ticket statistics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = TicketController;
