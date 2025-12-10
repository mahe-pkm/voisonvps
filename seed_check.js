const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    await client.connect();
    const hash = await bcrypt.hash('changeme', 10);
    
    // Insert Admin User
    await client.query(`
      INSERT INTO "User" (email, password, role, "createdAt")
      VALUES ('admin@example.com', $1, 'ADMIN', NOW())
      ON CONFLICT (email) DO UPDATE SET password = $1;
    `, [hash]);
    
    console.log('✅ Admin Created: admin@example.com');
    await client.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
