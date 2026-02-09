const { neon } = require('@neondatabase/serverless');

let sql;

function getDB() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}

// Helper pour exécuter des requêtes
async function query(text, params = []) {
  const sql = getDB();
  try {
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { query, getDB };
