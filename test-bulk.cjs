const sql = require('mssql');
const crypto = require('crypto');

const config = {
  server: 'localhost',
  database: 'H2OStockDB',
  user: 'lounnaci',
  password: 'hyhwarez',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

async function test() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected');

    const table = new sql.Table('Meters');
    table.create = false;
    
    // Exact mapping to DB columns
    table.columns.add('Id', sql.UniqueIdentifier, { nullable: false });
    table.columns.add('SerialNumber', sql.NVarChar(50), { nullable: false });
    table.columns.add('Diameter', sql.NVarChar(50), { nullable: false });
    table.columns.add('MeterType', sql.NVarChar(50), { nullable: false });
    table.columns.add('Brand', sql.NVarChar(50), { nullable: true });
    table.columns.add('Model', sql.NVarChar(50), { nullable: true });
    table.columns.add('ManufacturingYear', sql.Int, { nullable: true });
    table.columns.add('Status', sql.NVarChar(20), { nullable: false });
    table.columns.add('CurrentLocationId', sql.Int, { nullable: true });
    table.columns.add('LastUpdate', sql.DateTime, { nullable: true });

    table.rows.add(
      crypto.randomUUID(),
      'TEST-BULK-' + Date.now(),
      '15/21 (DN15)',
      'Volumétrique',
      'Itron',
      'Test',
      2024,
      'Neuf',
      1,
      new Date()
    );

    console.log('🚀 Sending bulk...');
    const result = await pool.request().bulk(table);
    console.log('✅ Bulk result:', result);

    const count = await pool.request().query('SELECT COUNT(*) as c FROM Meters WHERE SerialNumber LIKE "TEST-BULK-%"');
    console.log('📊 Meters found:', count.recordset[0].c);

    process.exit(0);
  } catch (err) {
    console.error('❌ BULK FAILED:', err);
    process.exit(1);
  }
}

test();
