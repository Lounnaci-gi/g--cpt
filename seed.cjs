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

async function seed() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');

    // 1. Clear existing data
    await pool.request().query('DELETE FROM Thresholds');
    await pool.request().query('DELETE FROM Movements');
    await pool.request().query('DELETE FROM Meters');
    await pool.request().query('DELETE FROM Locations');
    await pool.request().query('DBCC CHECKIDENT (Locations, RESEED, 0)');
    console.log('🗑️ Database cleared');

    // 2. Insert Locations
    const agencyResult = await pool.request().query(`
      INSERT INTO Locations (Name, Type, ParentAgencyId) 
      VALUES ('Berrouaghia', 'Agence', NULL);
      SELECT SCOPE_IDENTITY() AS id;
    `);
    const agencyId = agencyResult.recordset[0].id;

    const antennas = [
      'Ouled Dhied', 'Robea', 'Seghouane', 'Zoubiria', 'Tlathet Douairs', 'Oued Chorfa'
    ];

    for (const name of antennas) {
      await pool.request()
        .input('name', name)
        .input('parentId', agencyId)
        .query("INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES (@name, 'Antenne', @parentId)");
    }
    console.log('📍 Locations created (1 Agence, 6 Antennes)');

    // 3. Insert 500 Meters
    console.log('📦 Generating 500 meters...');
    const now = new Date().toISOString();
    
    // Batch inserts for performance
    const batchSize = 100;
    for (let i = 0; i < 500; i += batchSize) {
      const table = new sql.Table('Meters');
      table.create = false;
      
      // MUST match DB order: Id, SN, Diameter, Type, Brand, Model, Year, Status, Location, Update
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

      for (let j = 0; j < batchSize; j++) {
        const index = i + j;
        table.rows.add(
          crypto.randomUUID(),
          `SANS-SN-REST-${1000 + index}`,
          '15/21 (DN15)',
          'Volumétrique',
          'Itron',
          'Aquadis+',
          2024,
          'Neuf',
          agencyId,
          now
        );
      }
      await pool.request().bulk(table);
    }
    console.log('✅ 500 meters inserted');

    // 4. Insert Reception Movement
    await pool.request().query(`
      INSERT INTO Movements (Date, Type, SourceLocation, DestinationLocation, SerialNumber, Diameter, Brand, Model, Details)
      VALUES (
        '${now}', 
        'Réception', 
        'Fournisseur', 
        'Berrouaghia', 
        'LOT INITIAL 500', 
        '15/21 (DN15)', 
        'Itron', 
        'Aquadis+', 
        'Initialisation du stock (Restauré)'
      )
    `);
    console.log('📝 Initial movement recorded');

    console.log('🚀 SEEDING COMPLETED SUCCESSFULLY');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
  }
}

seed();
