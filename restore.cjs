const sql = require('mssql');
async function run() {
  try {
    const pool = await sql.connect({
      server: 'localhost',
      database: 'H2OStockDB',
      user: 'lounnaci',
      password: 'hyhwarez',
      options: { trustServerCertificate: true }
    });

    const mQuery = `INSERT INTO Movements (Date, Type, SourceLocation, DestinationLocation, SerialNumber, Diameter, Details, OrderDate, OrderIssuer) 
                    VALUES ('2025-01-11T00:00:00.000Z', 'Réception', 'Fournisseur', 'berrouaghia', 'LOT DE 500 (15/21 (DN15))', '15/21 (DN15)', 'Réception de 500 compteurs Volumétrique (restauré manuellement)', '2025-01-11T00:00:00.000Z', 'magasin medea')`;
    
    await pool.request().query(mQuery);
    
    let insertQuery = 'INSERT INTO Meters (Id, SerialNumber, Diameter, MeterType, Status, CurrentLocationId) VALUES ';
    const values = [];
    for(let i = 0; i < 500; i++) {
      const id = require('crypto').randomUUID();
      const sn = 'SANS-SN-REST-' + i;
      values.push(`('${id}', '${sn}', '15/21 (DN15)', 'Volumétrique', 'Neuf', 1)`);
    }
    
    insertQuery += values.join(', ');
    await pool.request().query(insertQuery);
    
    console.log('Successfully restored 500 meters');
    process.exit();
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
run();
