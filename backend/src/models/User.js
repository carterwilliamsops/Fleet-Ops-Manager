const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findAll() {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY name'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role]
    );
    return result.rows[0];
  }

  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getTechnicians() {
    const result = await db.query(
      `SELECT id, name, email FROM users WHERE role = 'Technician' ORDER BY name`
    );
    return result.rows;
  }

  static async getDrivers() {
    const result = await db.query(
      `SELECT id, name, email FROM users WHERE role = 'Driver' ORDER BY name`
    );
    return result.rows;
  }
}

module.exports = User;
