const db = require('../config/database');

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Technician', 'Driver')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create vehicles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vin VARCHAR(17) UNIQUE NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Active' 
          CHECK (status IN ('Active', 'Maintenance', 'Retired')),
        current_mileage INTEGER DEFAULT 0,
        license_plate VARCHAR(20),
        assigned_driver_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Vehicles table created');

    // Create tickets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        submitted_by INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'Open' 
          CHECK (status IN ('Open', 'In Progress', 'Closed')),
        priority VARCHAR(50) DEFAULT 'Medium' 
          CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tickets table created');

    // Create work_orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS work_orders (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id),
        assigned_technician_id INTEGER REFERENCES users(id),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        total_labor_hours DECIMAL(10, 2),
        status VARCHAR(50) NOT NULL DEFAULT 'Pending'
          CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Work orders table created');

    // Create repair_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS repair_items (
        id SERIAL PRIMARY KEY,
        work_order_id INTEGER NOT NULL REFERENCES work_orders(id),
        category VARCHAR(100) NOT NULL,
        part_name VARCHAR(255),
        part_number VARCHAR(100),
        parts_cost DECIMAL(10, 2) DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Repair items table created');

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_vehicle ON tickets(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_work_orders_ticket ON work_orders(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_work_orders_technician ON work_orders(assigned_technician_id);
      CREATE INDEX IF NOT EXISTS idx_repair_items_category ON repair_items(category);
    `);
    console.log('✓ Indexes created');

    // Insert sample admin user (password: admin123)
    await db.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('Admin User', 'admin@fleetmanager.com', 
         '$2b$10$rBV2kYf3EMKxJzYhYqVvVekxZsY9wZ3QmLhM7GXEKp4nRyZjC9xXK', 
         'Admin'),
        ('John Tech', 'tech@fleetmanager.com', 
         '$2b$10$rBV2kYf3EMKxJzYhYqVvVekxZsY9wZ3QmLhM7GXEKp4nRyZjC9xXK', 
         'Technician'),
        ('Jane Driver', 'driver@fleetmanager.com', 
         '$2b$10$rBV2kYf3EMKxJzYhYqVvVekxZsY9wZ3QmLhM7GXEKp4nRyZjC9xXK', 
         'Driver')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✓ Sample users created');

    console.log('\n✅ Database migration completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@fleetmanager.com / admin123');
    console.log('Tech: tech@fleetmanager.com / admin123');
    console.log('Driver: driver@fleetmanager.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

createTables();
