const db = require('../config/database');

class Vehicle {
  static async findAll() {
    const result = await db.query(`
      SELECT v.*, u.name as driver_name 
      FROM vehicles v
      LEFT JOIN users u ON v.assigned_driver_id = u.id
      ORDER BY v.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByVIN(vin) {
    const result = await db.query(
      'SELECT * FROM vehicles WHERE vin = $1',
      [vin]
    );
    return result.rows[0];
  }

  static async create(vehicleData) {
    const { vin, make, model, year, license_plate, assigned_driver_id } = vehicleData;
    const result = await db.query(
      `INSERT INTO vehicles (vin, make, model, year, license_plate, assigned_driver_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vin, make, model, year, license_plate, assigned_driver_id]
    );
    return result.rows[0];
  }

  static async update(id, vehicleData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(vehicleData).forEach(key => {
      if (vehicleData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(vehicleData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await db.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async getMaintenanceHistory(vehicleId) {
    const result = await db.query(`
      SELECT 
        t.id as ticket_id,
        t.category,
        t.description,
        t.created_at as reported_at,
        wo.started_at,
        wo.completed_at,
        wo.total_labor_hours,
        u.name as technician_name,
        COALESCE(SUM(ri.parts_cost * ri.quantity), 0) as total_parts_cost
      FROM tickets t
      LEFT JOIN work_orders wo ON t.id = wo.ticket_id
      LEFT JOIN users u ON wo.assigned_technician_id = u.id
      LEFT JOIN repair_items ri ON wo.id = ri.work_order_id
      WHERE t.vehicle_id = $1
      GROUP BY t.id, t.category, t.description, t.created_at, 
               wo.started_at, wo.completed_at, wo.total_labor_hours, u.name
      ORDER BY t.created_at DESC
    `, [vehicleId]);
    return result.rows;
  }
}

module.exports = Vehicle;
