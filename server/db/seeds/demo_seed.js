const bcrypt = require('bcryptjs');
const { pool } = require('../../config/database');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding demo data...');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, display_name, role, wallet_balance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET role = 'admin'
      RETURNING id
    `, ['admin@autoconcierge.com', adminPassword, 'Super Admin', 'admin', 1000000]);

    const adminId = adminResult.rows[0].id;

    // 2. Create Sample User
    const userPassword = await bcrypt.hash('user123', 10);
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, display_name, role, wallet_balance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['demo@user.com', userPassword, 'Demo User', 'user', 5000000]);

    if (userResult.rows.length > 0) {
      const demoUserId = userResult.rows[0].id;
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, balance_after, status, description)
        VALUES ($1, 'funding', 5000000, 5000000, 'completed', 'Initial Seed Deposit')
      `, [demoUserId]);
    }

    // 3. Create Sample Vehicle (Toyota Corolla 2012)
    const catalogResult = await client.query("SELECT id FROM vehicle_catalog WHERE model = 'Corolla' LIMIT 1");
    if (catalogResult.rows.length > 0) {
      const catalogId = catalogResult.rows[0].id;

      const vehicleResult = await client.query(`
        INSERT INTO vehicles (
          catalog_id, make, model, year, condition, mileage_km, 
          price, status, featured, location, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        catalogId, 'Toyota', 'Corolla', 2012, 'foreign_used', 85000,
        4200000, 'in_auction', true, 'Lagos, Nigeria',
        JSON.stringify(['/images/vehicles/placeholder.webp'])
      ]);

      const vehicleId = vehicleResult.rows[0].id;

      // 4. Create Auction
      await client.query(`
        INSERT INTO auctions (
          vehicle_id, created_by, status, start_price, 
          current_price, start_time, end_time
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '2 days')
      `, [vehicleId, adminId, 'live', 3500000, 3500000]);
    }

    await client.query('COMMIT');
    console.log('✅ Demo seeding completed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
