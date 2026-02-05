const db = require('../config/database');

class AnalyticsService {
  /**
   * Get most common repairs within a date range
   */
  static async getCommonRepairs(startDate, endDate, limit = 10) {
    const result = await db.query(`
      SELECT 
        ri.category,
        COUNT(*) as occurrence_count,
        SUM(ri.parts_cost * ri.quantity) as total_cost,
        AVG(ri.parts_cost * ri.quantity) as avg_cost_per_repair,
        COUNT(DISTINCT wo.ticket_id) as unique_tickets
      FROM repair_items ri
      JOIN work_orders wo ON ri.work_order_id = wo.id
      JOIN tickets t ON wo.ticket_id = t.id
      WHERE t.created_at BETWEEN $1 AND $2
      GROUP BY ri.category
      ORDER BY occurrence_count DESC
      LIMIT $3
    `, [startDate, endDate, limit]);
    
    return result.rows;
  }

  /**
   * Calculate time spent on repairs by vehicle
   */
  static async getRepairTimeByVehicle(startDate, endDate) {
    const result = await db.query(`
      SELECT 
        v.id as vehicle_id,
        v.vin,
        v.make,
        v.model,
        v.year,
        COUNT(wo.id) as total_work_orders,
        SUM(wo.total_labor_hours) as total_hours,
        AVG(wo.total_labor_hours) as avg_hours_per_repair,
        SUM(ri.parts_cost * ri.quantity) as total_parts_cost
      FROM vehicles v
      JOIN tickets t ON v.id = t.vehicle_id
      JOIN work_orders wo ON t.id = wo.ticket_id
      LEFT JOIN repair_items ri ON wo.id = ri.work_order_id
      WHERE wo.completed_at BETWEEN $1 AND $2
      GROUP BY v.id, v.vin, v.make, v.model, v.year
      ORDER BY total_hours DESC
    `, [startDate, endDate]);
    
    return result.rows;
  }

  /**
   * Calculate time spent on repairs by technician
   */
  static async getRepairTimeByTechnician(startDate, endDate) {
    const result = await db.query(`
      SELECT 
        u.id as technician_id,
        u.name as technician_name,
        COUNT(wo.id) as total_work_orders,
        SUM(wo.total_labor_hours) as total_hours,
        AVG(wo.total_labor_hours) as avg_hours_per_repair,
        COUNT(CASE WHEN wo.status = 'Completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN wo.status = 'In Progress' THEN 1 END) as in_progress_orders
      FROM users u
      JOIN work_orders wo ON u.id = wo.assigned_technician_id
      WHERE wo.created_at BETWEEN $1 AND $2
      GROUP BY u.id, u.name
      ORDER BY total_hours DESC
    `, [startDate, endDate]);
    
    return result.rows;
  }

  /**
   * Get vehicle status distribution
   */
  static async getVehicleStatusDistribution() {
    const result = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM vehicles
      GROUP BY status
      ORDER BY count DESC
    `);
    
    return result.rows;
  }

  /**
   * Get ticket status trends over time
   */
  static async getTicketTrends(startDate, endDate, interval = 'day') {
    const dateFormat = interval === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';
    
    const result = await db.query(`
      SELECT 
        TO_CHAR(created_at, '${dateFormat}') as period,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'Critical' THEN 1 END) as critical_tickets
      FROM tickets
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY period
      ORDER BY period
    `, [startDate, endDate]);
    
    return result.rows;
  }

  /**
   * Get cost analysis
   */
  static async getCostAnalysis(startDate, endDate) {
    const result = await db.query(`
      SELECT 
        ri.category,
        COUNT(DISTINCT wo.id) as repair_count,
        SUM(ri.parts_cost * ri.quantity) as total_parts_cost,
        AVG(ri.parts_cost * ri.quantity) as avg_parts_cost,
        SUM(wo.total_labor_hours) as total_labor_hours,
        SUM(wo.total_labor_hours * 75) as estimated_labor_cost
      FROM repair_items ri
      JOIN work_orders wo ON ri.work_order_id = wo.id
      JOIN tickets t ON wo.ticket_id = t.id
      WHERE t.created_at BETWEEN $1 AND $2
      GROUP BY ri.category
      ORDER BY total_parts_cost DESC
    `, [startDate, endDate]);
    
    return result.rows;
  }

  /**
   * Get fleet health score
   */
  static async getFleetHealthScore() {
    const result = await db.query(`
      WITH fleet_metrics AS (
        SELECT 
          COUNT(*) as total_vehicles,
          COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_vehicles,
          COUNT(CASE WHEN status = 'Maintenance' THEN 1 END) as maintenance_vehicles
        FROM vehicles
      ),
      recent_tickets AS (
        SELECT COUNT(*) as open_tickets
        FROM tickets
        WHERE status IN ('Open', 'In Progress')
          AND created_at > NOW() - INTERVAL '30 days'
      )
      SELECT 
        fm.*,
        rt.open_tickets,
        ROUND(
          (fm.active_vehicles::DECIMAL / NULLIF(fm.total_vehicles, 0) * 50) +
          (1 - (LEAST(rt.open_tickets, 20)::DECIMAL / 20) * 50),
          2
        ) as health_score
      FROM fleet_metrics fm, recent_tickets rt
    `);
    
    return result.rows[0];
  }

  /**
   * Get dashboard summary
   */
  static async getDashboardSummary() {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM vehicles WHERE status = 'Active') as active_vehicles,
        (SELECT COUNT(*) FROM tickets WHERE status = 'Open') as open_tickets,
        (SELECT COUNT(*) FROM work_orders WHERE status = 'In Progress') as active_repairs,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'Maintenance') as vehicles_in_maintenance,
        (SELECT COUNT(*) FROM tickets WHERE priority = 'Critical' AND status != 'Closed') as critical_issues,
        (SELECT COALESCE(SUM(total_labor_hours), 0) FROM work_orders WHERE completed_at > NOW() - INTERVAL '30 days') as total_hours_last_month,
        (SELECT COALESCE(SUM(parts_cost * quantity), 0) FROM repair_items ri 
         JOIN work_orders wo ON ri.work_order_id = wo.id 
         WHERE wo.completed_at > NOW() - INTERVAL '30 days') as total_parts_cost_last_month
    `);
    
    return result.rows[0];
  }
}

module.exports = AnalyticsService;
