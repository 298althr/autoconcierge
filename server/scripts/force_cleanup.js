const { Pool } = require('pg');
const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

async function cleanup() {
    console.log('🧹 Forcefully cleaning up test data and locks...');
    try {
        await pool.query("DELETE FROM auction_escrow");
        console.log('  -> Escrows cleared');
        await pool.query("DELETE FROM bids");
        console.log('  -> Bids cleared');
        await pool.query("DELETE FROM auctions");
        console.log('  -> Auctions cleared');
        console.log('✨ Cleanup complete.');
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        await pool.end();
    }
}
cleanup();
