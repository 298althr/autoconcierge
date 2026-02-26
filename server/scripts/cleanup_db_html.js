const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function cleanTags() {
    const connectionString = process.env.DATABASE_URL.replace('postgres:5432', 'localhost:5432');
    console.log('Connecting to:', connectionString);

    const pool = new Pool({ connectionString });

    try {
        console.log('Cleaning HTML tags from description and press_release...');

        // Use regexp_replace to strip HTML tags
        const query = `
            UPDATE automobiles 
            SET 
                description = regexp_replace(description, '<[^>]*>', '', 'g'),
                press_release = regexp_replace(press_release, '<[^>]*>', '', 'g'),
                name = regexp_replace(name, '&amp;', '&', 'g')
            WHERE description LIKE '%<%';
        `;

        const res = await pool.query(query);
        console.log(`Successfully cleaned ${res.rowCount} rows.`);

        // Also clean common entities
        const entitiesQuery = `
            UPDATE automobiles
            SET
                description = replace(replace(replace(description, '&amp;', '&'), '&nbsp;', ' '), '&quot;', '"'),
                press_release = replace(replace(replace(press_release, '&amp;', '&'), '&nbsp;', ' '), '&quot;', '"')
            WHERE description LIKE '%&%' OR press_release LIKE '%&%';
        `;
        const resEntities = await pool.query(entitiesQuery);
        console.log(`Successfully cleaned entities in ${resEntities.rowCount} rows.`);

    } catch (err) {
        console.error('Error cleaning database:', err);
    } finally {
        await pool.end();
    }
}

cleanTags();
