import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        pool = new Pool({
          connectionString,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
        
        pool.on('error', (err) => {
          console.error('[Postgres Pool Error]: Unexpected error on idle client', err);
        });
        
        console.log('[Ocean DB]: PostgreSQL connection pool successfully initialized.');
      } catch (e) {
        console.error('[Ocean DB Warning]: Failed to initialize PostgreSQL pool with DATABASE_URL.', e);
      }
    } else {
      console.warn('[Ocean DB Notice]: DATABASE_URL is not set. Falling back to structured memory store (JSON-NEXUS-DB) mode.');
    }
  }
  
  // Return a dummy pool or throw if caller forces postgres-only
  if (!pool) {
    // Return a proxy to gracefully prevent crash while logging access attempts
    return new Proxy({} as Pool, {
      get(_, prop) {
        return () => {
          throw new Error(`[Ocean DB Error]: Cannot call "${String(prop)}" - PostgreSQL is offline or DATABASE_URL is not configured.`);
        };
      }
    });
  }
  
  return pool;
}

/**
 * Execute query on PostgreSQL safely
 */
export async function executeQuery<T = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[Ocean DB]: Unable to execute query. Postgres adapter is offline.');
  }
  
  const dbPool = getDatabasePool();
  const start = Date.now();
  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_QUERIES === 'true') {
      console.log(`[Query Logger] Executed: ${text.substring(0, 80)}... | Duration: ${duration}ms | Rows: ${result.rowCount}`);
    }
    return result;
  } catch (err) {
    console.error(`[Query Error] Executed: ${text}`, err);
    throw err;
  }
}

/**
 * Execute fully wrapped transactional statement safely
 */
export async function executeTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const dbPool = getDatabasePool();
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[Transaction Aborted]: Rolling back operations', e);
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Validates if PostgreSQL is fully responsive and connected
 */
export async function checkDatabaseHealth(): Promise<{ status: string; latencyMs: number; error?: string }> {
  const start = Date.now();
  if (!process.env.DATABASE_URL) {
    return { status: 'offline', latencyMs: 0, error: 'DATABASE_URL environment variable is missing.' };
  }
  
  try {
    await executeQuery('SELECT 1');
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (e: any) {
    return { status: 'unhealthy', latencyMs: Date.now() - start, error: e.message };
  }
}
