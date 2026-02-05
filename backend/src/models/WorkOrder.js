const db = require('../config/database');

class WorkOrder {
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        wo.*,
        t.category as ticket_category,
        t.description as ticket_description,
        v.vin, v.make, v.model,
        u.name as technician_name
      FROM work_orders wo
      JOIN tickets t ON wo.ticket_id = t.id
      JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON wo.assigned_technician_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND wo.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.technician_id) {
      query += ` AND wo.assigned_technician_id = $${paramCount}`;
      params.push(filters.technician_id);
      paramCount++;
    }

    query += ' ORDER BY wo.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(`
      SELECT 
        wo.*,
        t.id as ticket_id, t.category, t.description as ticket_description,
        v.id as vehicle_id, v.vin, v.make, v.model, v.year,
        u.name as technician_name, u.email as technician_email
      FROM work_orders wo
      JOIN tickets t ON wo.ticket_id = t.id
      JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON wo.assigned_technician_id = u.id
      WHERE wo.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create(workOrderData) {
    const { ticket_id, assigned_technician_id, notes } = workOrderData;
    const result = await db.query(
      `INSERT INTO work_orders (ticket_id, assigned_technician_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticket_id, assigned_technician_id, notes]
    );
    return result.rows[0];
  }

  static async start(id) {
    const result = await db.query(
      `UPDATE work_orders 
       SET status = 'In Progress', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async complete(id, laborHours) {
    const result = await db.query(
      `UPDATE work_orders 
       SET status = 'Completed', 
           completed_at = CURRENT_TIMESTAMP, 
           total_labor_hours = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, laborHours]
    );
    return result.rows[0];
  }

  static async addRepairItem(workOrderId, repairData) {
    const { category, part_name, part_number, parts_cost, quantity, notes } = repairData;
    const result = await db.query(
      `INSERT INTO repair_items (work_order_id, category, part_name, part_number, parts_cost, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [workOrderId, category, part_name, part_number, parts_cost, quantity || 1, notes]
    );
    return result.rows[0];
  }

  static async getRepairItems(workOrderId) {
    const result = await db.query(
      'SELECT * FROM repair_items WHERE work_order_id = $1 ORDER BY created_at',
      [workOrderId]
    );
    return result.rows;
  }
}

module.exports = WorkOrder;
