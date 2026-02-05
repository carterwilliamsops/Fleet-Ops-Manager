const db = require('../config/database');

class Ticket {
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        t.*,
        v.vin, v.make, v.model, v.year,
        u.name as submitted_by_name,
        wo.status as work_order_status,
        wo.assigned_technician_id,
        tech.name as technician_name
      FROM tickets t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN users u ON t.submitted_by = u.id
      LEFT JOIN work_orders wo ON t.id = wo.ticket_id
      LEFT JOIN users tech ON wo.assigned_technician_id = tech.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.vehicle_id) {
      query += ` AND t.vehicle_id = $${paramCount}`;
      params.push(filters.vehicle_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(`
      SELECT 
        t.*,
        v.vin, v.make, v.model, v.year,
        u.name as submitted_by_name, u.email as submitted_by_email,
        wo.id as work_order_id,
        wo.status as work_order_status,
        wo.started_at,
        wo.completed_at,
        wo.total_labor_hours,
        tech.name as technician_name
      FROM tickets t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN users u ON t.submitted_by = u.id
      LEFT JOIN work_orders wo ON t.id = wo.ticket_id
      LEFT JOIN users tech ON wo.assigned_technician_id = tech.id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create(ticketData) {
    const { vehicle_id, submitted_by, category, description, priority, photo_url } = ticketData;
    const result = await db.query(
      `INSERT INTO tickets (vehicle_id, submitted_by, category, description, priority, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vehicle_id, submitted_by, category, description, priority || 'Medium', photo_url]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE tickets 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  static async getStatistics(startDate, endDate) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'Critical' THEN 1 END) as critical_tickets
      FROM tickets
      WHERE created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);
    return result.rows[0];
  }
}

module.exports = Ticket;
