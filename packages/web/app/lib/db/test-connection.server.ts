import pg from 'pg';

export async function testPostgresConnection(config: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}) {
  const pool = new pg.Pool(config);
  try {
    const client = await pool.connect();
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    throw error;
  }
}
