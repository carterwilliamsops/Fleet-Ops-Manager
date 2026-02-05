const WorkOrder = require('../models/WorkOrder');
const Ticket = require('../models/Ticket');

class WorkOrderController {
  static async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        technician_id: req.query.technician_id
      };

      const workOrders = await WorkOrder.findAll(filters);
      res.json(workOrders);
    } catch (error) {
      console.error('Get all work orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const workOrder = await WorkOrder.findById(id);
      
      if (!workOrder) {
        return res.status(404).json({ error: 'Work order not found' });
      }

      workOrder.repair_items = await WorkOrder.getRepairItems(id);

      res.json(workOrder);
    } catch (error) {
      console.error('Get work order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const { ticket_id, assigned_technician_id, notes } = req.body;

      if (!ticket_id) {
        return res.status(400).json({ error: 'ticket_id is required' });
      }

      const workOrder = await WorkOrder.create({
        ticket_id,
        assigned_technician_id,
        notes
      });

      // Update ticket status
      await Ticket.updateStatus(ticket_id, 'In Progress');

      res.status(201).json(workOrder);
    } catch (error) {
      console.error('Create work order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async start(req, res) {
    try {
      const { id } = req.params;
      const workOrder = await WorkOrder.start(id);
      
      if (!workOrder) {
        return res.status(404).json({ error: 'Work order not found' });
      }

      res.json(workOrder);
    } catch (error) {
      console.error('Start work order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async complete(req, res) {
    try {
      const { id } = req.params;
      const { labor_hours } = req.body;

      if (!labor_hours) {
        return res.status(400).json({ error: 'labor_hours is required' });
      }

      const workOrder = await WorkOrder.complete(id, labor_hours);
      
      if (!workOrder) {
        return res.status(404).json({ error: 'Work order not found' });
      }

      // Update ticket status
      await Ticket.updateStatus(workOrder.ticket_id, 'Closed');

      res.json(workOrder);
    } catch (error) {
      console.error('Complete work order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addRepairItem(req, res) {
    try {
      const { id } = req.params;
      const { category, part_name, part_number, parts_cost, quantity, notes } = req.body;

      if (!category) {
        return res.status(400).json({ error: 'category is required' });
      }

      const repairItem = await WorkOrder.addRepairItem(id, {
        category,
        part_name,
        part_number,
        parts_cost: parts_cost || 0,
        quantity: quantity || 1,
        notes
      });

      res.status(201).json(repairItem);
    } catch (error) {
      console.error('Add repair item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getRepairItems(req, res) {
    try {
      const { id } = req.params;
      const repairItems = await WorkOrder.getRepairItems(id);
      res.json(repairItems);
    } catch (error) {
      console.error('Get repair items error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = WorkOrderController;
