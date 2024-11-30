import pkg from 'pg';
const { Pool } = pkg;

export async function testPostgresConnection(config: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}) {
  const pool = new Pool(config);
  try {
    const client = await pool.connect();
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    throw error;
  }
}
