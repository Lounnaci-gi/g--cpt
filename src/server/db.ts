import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'H2OStockDB',
  user: process.env.DB_USER || 'lounnaci',
  password: process.env.DB_PASSWORD || 'hyhwarez',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false, // Set to true if using Azure SQL or TLS
    trustServerCertificate: true, // Change to false for production with valid certs
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server Database');
  }
  return pool;
}

export async function query<T>(sqlQuery: string, params?: any): Promise<T[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }

    const result = await request.query(sqlQuery);
    return result.recordset || [];
  } catch (error) {
    console.error('❌ Database Query Error:', error);
    throw error;
  }
}

export async function execute(sqlQuery: string, params?: any): Promise<any> {
  try {
    const pool = await getPool();
    const request = pool.request();

    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }

    const result = await request.query(sqlQuery);
    return result;
  } catch (error) {
    console.error('❌ Database Execute Error:', error);
    throw error;
  }
}

// Test connection on startup
getPool()
  .then(() => console.log('✅ Database connection pool initialized'))
  .catch(err => console.error('❌ Database connection failed:', err));
