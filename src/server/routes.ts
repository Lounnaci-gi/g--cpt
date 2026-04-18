import express from 'express';
import { query, execute, getPool } from './db.js';
import sql from 'mssql';

const router = express.Router();

// Health check avec statut de la base de données
router.get('/health', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as connected');
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: process.env.DB_NAME || 'H2OStockDB',
        server: process.env.DB_SERVER || 'localhost'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        name: process.env.DB_NAME || 'H2OStockDB',
        server: process.env.DB_SERVER || 'localhost'
      }
    });
  }
});

// ==================== LOCATIONS ====================

// GET /api/locations - Récupérer toutes les localisations
router.get('/locations', async (req, res) => {
  try {
    const locations = await query(`
      SELECT 
        l.LocationId as id, 
        l.Name as name, 
        l.Type as type, 
        l.CreatedAt as createdAt,
        parent.Name as parentAgency
      FROM Locations l
      LEFT JOIN Locations parent ON l.ParentAgencyId = parent.LocationId
      ORDER BY 
        CASE WHEN l.Type = 'Agence' THEN 0 ELSE 1 END,
        l.Name
    `);
    
    res.json(locations);
  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch locations',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/locations - Créer une nouvelle localisation
router.post('/locations', async (req, res) => {
  try {
    const { name, type, parentAgency } = req.body;
    
    // Validation
    if (!name || !type) {
      return res.status(400).json({ 
        error: 'Name and type are required',
        details: 'Les champs name et type sont obligatoires'
      });
    }
    
    if (!['Agence', 'Antenne'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type',
        details: 'Le type doit être "Agence" ou "Antenne"'
      });
    }
    
    let parentAgencyId = null;
    if (type === 'Antenne' && parentAgency) {
      const parent = await query<any>(
        `SELECT LocationId FROM Locations WHERE Name = @name AND Type = 'Agence'`, 
        { name: parentAgency }
      );
      parentAgencyId = parent[0]?.LocationId || null;
      
      if (!parentAgencyId) {
        return res.status(400).json({ 
          error: 'Parent agency not found',
          details: `L'agence "${parentAgency}" n'existe pas`
        });
      }
    }

    await execute(
      `INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES (@name, @type, @parentAgencyId)`,
      { name, type, parentAgencyId }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Location created',
      data: { name, type, parentAgency }
    });
  } catch (error) {
    console.error('❌ Error creating location:', error);
    res.status(500).json({ 
      error: 'Failed to create location',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// PUT /api/locations/:oldName - Mettre à jour une localisation
router.put('/locations/:oldName', async (req, res) => {
  try {
    const { oldName } = req.params;
    const { name, type, parentAgency } = req.body;

    // Vérifier si la localisation existe
    const existing = await query<any>(
      `SELECT LocationId, Type FROM Locations WHERE Name = @name`,
      { name: oldName }
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        error: 'Location not found',
        details: `La localisation "${oldName}" n'existe pas`
      });
    }

    let parentAgencyId = null;
    if (type === 'Antenne' && parentAgency) {
      const parent = await query<any>(
        `SELECT LocationId FROM Locations WHERE Name = @name AND Type = 'Agence'`,
        { name: parentAgency }
      );
      parentAgencyId = parent[0]?.LocationId || null;
      
      if (!parentAgencyId) {
        return res.status(400).json({ 
          error: 'Parent agency not found',
          details: `L'agence "${parentAgency}" n'existe pas`
        });
      }
    }

    // Utiliser une transaction pour garantir la cohérence
    const pool = await getPool();
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update location
      await transaction.request()
        .input('newName', name)
        .input('type', type)
        .input('parentAgencyId', parentAgencyId)
        .input('oldName', oldName)
        .query(`
          UPDATE Locations 
          SET Name = @newName, Type = @type, ParentAgencyId = @parentAgencyId
          WHERE Name = @oldName
        `);

      // Update meters location if name changed
      if (name !== oldName) {
        await transaction.request()
          .input('newName', name)
          .input('oldName', oldName)
          .query(`
            UPDATE Meters 
            SET CurrentLocationId = (SELECT LocationId FROM Locations WHERE Name = @newName),
                LastUpdate = GETDATE()
            WHERE CurrentLocationId = (SELECT LocationId FROM Locations WHERE Name = @oldName)
          `);
      }

      await transaction.commit();
      res.json({ 
        success: true,
        message: 'Location updated',
        data: { oldName, name, type, parentAgency }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ 
      error: 'Failed to update location',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// DELETE /api/locations/:name - Supprimer une localisation
router.delete('/locations/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Vérifier si la localisation existe
    const existing = await query<any>(
      `SELECT LocationId, Type FROM Locations WHERE Name = @name`,
      { name }
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        error: 'Location not found',
        details: `La localisation "${name}" n'existe pas`
      });
    }

    // Vérifier s'il y a des compteurs dans cette localisation
    const meters = await query<any>(
      `SELECT COUNT(*) as count FROM Meters WHERE CurrentLocationId = (SELECT LocationId FROM Locations WHERE Name = @name)`,
      { name }
    );
    
    if (meters[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete location with meters',
        details: `Impossible de supprimer : ${meters[0].count} compteur(s) dans cette localisation`,
        meterCount: meters[0].count
      });
    }

    // Vérifier s'il y a des antennes rattachées (si c'est une agence)
    const antennas = await query<any>(
      `SELECT COUNT(*) as count FROM Locations WHERE ParentAgencyId = (SELECT LocationId FROM Locations WHERE Name = @name)`,
      { name }
    );
    
    if (antennas[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete agency with antennas',
        details: `Impossible de supprimer : ${antennas[0].count} antenne(s) rattachée(s)`,
        antennaCount: antennas[0].count
      });
    }

    await execute(
      `DELETE FROM Locations WHERE Name = @name`,
      { name }
    );

    res.json({ 
      success: true,
      message: 'Location deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting location:', error);
    res.status(500).json({ 
      error: 'Failed to delete location',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// ==================== METERS ====================

// GET /api/meters - Récupérer tous les compteurs
router.get('/meters', async (req, res) => {
  try {
    const { location, status, diameter } = req.query;
    
    let sql = `
      SELECT 
        m.Id as id, 
        m.SerialNumber as serialNumber, 
        m.Diameter as diameter,
        m.MeterType as type, 
        m.Brand as brand,
        m.Model as model,
        m.ManufacturingYear as year,
        m.Status as status,
        l.Name as location, 
        m.LastUpdate as lastUpdate
      FROM Meters m
      LEFT JOIN Locations l ON m.CurrentLocationId = l.LocationId
      WHERE 1=1
    `;
    
    const params: any = {};
    
    if (location) {
      sql += ` AND l.Name = @location`;
      params.location = location;
    }
    
    if (status) {
      sql += ` AND m.Status = @status`;
      params.status = status;
    }
    
    if (diameter) {
      sql += ` AND m.Diameter = @diameter`;
      params.diameter = diameter;
    }
    
    sql += ` ORDER BY m.LastUpdate DESC`;
    
    const meters = await query(sql, params);
    res.json(meters);
  } catch (error) {
    console.error('❌ Error fetching meters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meters',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/meters - Créer un nouveau compteur
router.post('/meters', async (req, res) => {
  try {
    const { serialNumber, diameter, type, brand, model, year, status, location } = req.body;
    

    // Validation
    if (!serialNumber || !diameter || !type || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Les champs serialNumber, diameter, type et status sont obligatoires'
      });
    }

    // Get location ID
    let locationId = null;
    if (location) {
      const locationResult = await query<any>(
        `SELECT LocationId FROM Locations WHERE Name = @name`, 
        { name: location }
      );
      locationId = locationResult[0]?.LocationId;
      
      if (!locationId) {
        return res.status(400).json({ 
          error: 'Location not found',
          details: `La localisation "${location}" n'existe pas`
        });
      }
    }

    await execute(
      `INSERT INTO Meters (SerialNumber, Diameter, MeterType, Brand, Model, ManufacturingYear, Status, CurrentLocationId) 
       VALUES (@serialNumber, @diameter, @type, @brand, @model, @year, @status, @locationId)`,
      { 
        serialNumber, 
        diameter, 
        type, 
        brand: brand || 'Itron', 
        model: model || 'Volumétrique', 
        year: year || new Date().getFullYear(),
        status, 
        locationId 
      }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Meter created',
      data: { serialNumber, diameter, type, status, location }
    });
  } catch (error: any) {
    console.error('❌ Error creating meter:', error);
    if (error.message?.includes('UNIQUE') || error.number === 2627) {
      return res.status(400).json({ 
        error: 'Serial number already exists',
        details: `Le numéro de série "${req.body.serialNumber}" existe déjà`
      });
    }
    res.status(500).json({ 
      error: 'Failed to create meter',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/meters/bulk - Création groupée HAUTE PERFORMANCE (Streaming)
router.post('/meters/bulk', async (req, res) => {
  const { meters } = req.body;
  
  if (!Array.isArray(meters) || meters.length === 0) {
    return res.status(400).json({ error: 'Meters array is required' });
  }

  try {
    const pool = await getPool();
    
    // 1. Mise en cache des IDs de localisation pour éviter les requêtes redondantes
    const locationNames = [...new Set(meters.map(m => m.location))].filter(Boolean);
    const locationMap: Record<string, number> = {};
    
    for (const name of locationNames) {
      const result = await pool.request()
        .input('name', name)
        .query('SELECT LocationId FROM Locations WHERE Name = @name');
      if (result.recordset[0]) {
        locationMap[name] = result.recordset[0].LocationId;
      }
    }

    // 2. Préparation du tableau Bulk (Native SQL Server Bulk)
    const table = new sql.Table('Meters');
    table.create = false; // La table existe déjà
    
    // Ajout des colonnes avec types SQL précis - L'ORDRE DOIT CORRESPONDRE À LA BDD
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

    // Ajout des lignes
    for (const m of meters) {
      table.rows.add(
        require('crypto').randomUUID(),
        m.serialNumber,
        m.diameter,
        m.type,
        m.brand || 'Itron',
        m.model || 'Aquadis+',
        m.year || new Date().getFullYear(),
        m.status || 'Neuf',
        locationMap[m.location] || null,
        m.lastUpdate ? new Date(m.lastUpdate) : new Date()
      );
    }

    // 3. Exécution de l'insertion en masse (très rapide)
    await pool.request().bulk(table);
    
    res.status(201).json({ success: true, count: meters.length });
  } catch (error: any) {
    console.error('❌ Error in NATIVE bulk meter creation:', error);
    
    if (error.message?.includes('UNIQUE') || error.number === 2627) {
      return res.status(400).json({ 
        error: 'Duplicate serial number in batch',
        details: 'Un ou plusieurs numéros de série existent déjà dans la base de données.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to create meters in bulk mode', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.put('/meters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields: string[] = [];
    const params: any = { id };

    if (updates.serialNumber !== undefined) {
      fields.push('SerialNumber = @serialNumber');
      params.serialNumber = updates.serialNumber;
    }
    if (updates.diameter !== undefined) {
      fields.push('Diameter = @diameter');
      params.diameter = updates.diameter;
    }
    if (updates.type !== undefined) {
      fields.push('MeterType = @type');
      params.type = updates.type;
    }
    if (updates.brand !== undefined) {
      fields.push('Brand = @brand');
      params.brand = updates.brand;
    }
    if (updates.model !== undefined) {
      fields.push('Model = @model');
      params.model = updates.model;
    }
    if (updates.year !== undefined) {
      fields.push('ManufacturingYear = @year');
      params.year = updates.year;
    }
    if (updates.status !== undefined) {
      fields.push('Status = @status');
      params.status = updates.status;
    }
    if (updates.location !== undefined) {
      const locationResult = await query<any>(`SELECT LocationId FROM Locations WHERE Name = @name`, { name: updates.location });
      fields.push('CurrentLocationId = @locationId');
      params.locationId = locationResult[0]?.LocationId;
    }
    fields.push('LastUpdate = GETDATE()');

    if (fields.length > 0) {
      await execute(`
        UPDATE Meters SET ${fields.join(', ')} WHERE Id = @id
      `, params);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update meter' });
  }
});

// ==================== MOVEMENTS ====================

// GET /api/movements - Récupérer tous les mouvements
router.get('/movements', async (req, res) => {
  try {
    const { type, location, startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        mv.MovementId as id, 
        mv.MeterId as meterId, 
        mv.Date as date,
        mv.Type as type, 
        mv.SourceLocation as source, 
        mv.DestinationLocation as destination,
        mv.SerialNumber as serialNumber, 
        mv.Diameter as diameter, 
        mv.Brand as brand,
        mv.Model as model,
        mv.Details as details,
        mv.ClientCode as clientCode, 
        mv.ClientName as clientName,
        mv.ClientAddress as clientAddress, 
        mv.ClientFileNumber as clientFileNumber,
        mv.RealizationDate as realizationDate,
        mv.OrderNumber as orderNumber, 
        mv.OrderDate as orderDate,
        mv.OrderIssuer as orderIssuer
      FROM Movements mv
      WHERE 1=1
    `;
    
    const params: any = {};
    
    if (type) {
      sql += ` AND mv.Type = @type`;
      params.type = type;
    }
    
    if (location) {
      sql += ` AND (mv.SourceLocation = @location OR mv.DestinationLocation = @location)`;
      params.location = location;
    }
    
    if (startDate) {
      sql += ` AND mv.Date >= @startDate`;
      params.startDate = startDate;
    }
    
    if (endDate) {
      sql += ` AND mv.Date <= @endDate`;
      params.endDate = endDate;
    }
    
    sql += ` ORDER BY mv.Date DESC`;
    
    const movements = await query(sql, params);

    // Transformer pour correspondre à la structure du frontend
    const transformed = movements.map((m: any) => ({
      ...m,
      clientInfo: m.clientCode ? {
        code: m.clientCode,
        name: m.clientName,
        address: m.clientAddress,
        realizationDate: m.realizationDate,
        fileNumber: m.clientFileNumber
      } : null,
      orderInfo: m.orderNumber ? {
        orderNumber: m.orderNumber,
        orderDate: m.orderDate,
        issuer: m.orderIssuer
      } : null
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('❌ Error fetching movements:', error);
    res.status(500).json({
      error: 'Failed to fetch movements',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/movements - Créer un nouveau mouvement
router.post('/movements', async (req, res) => {
  try {
    const movement = req.body;
    
    // Validation
    if (!movement.type || !movement.source || !movement.destination || !movement.serialNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Les champs type, source, destination et serialNumber sont obligatoires'
      });
    }

    await execute(
      `INSERT INTO Movements (
        MeterId, Date, Type, SourceLocation, DestinationLocation,
        SerialNumber, Diameter, Brand, Model, Details,
        ClientCode, ClientName, ClientAddress, ClientFileNumber, RealizationDate,
        OrderNumber, OrderDate, OrderIssuer
      ) VALUES (
        @meterId, @date, @type, @source, @destination,
        @serialNumber, @diameter, @brand, @model, @details,
        @clientCode, @clientName, @clientAddress, @clientFileNumber, @realizationDate,
        @orderNumber, @orderDate, @orderIssuer
      )`,
      {
        meterId: movement.meterId || null,
        date: movement.date || new Date(),
        type: movement.type,
        source: movement.source,
        destination: movement.destination,
        serialNumber: movement.serialNumber,
        diameter: movement.diameter || null,
        brand: movement.brand || null,
        model: movement.model || null,
        details: movement.details || null,
        clientCode: movement.clientInfo?.code || null,
        clientName: movement.clientInfo?.name || null,
        clientAddress: movement.clientInfo?.address || null,
        clientFileNumber: movement.clientInfo?.fileNumber || null,
        realizationDate: movement.clientInfo?.realizationDate || null,
        orderNumber: movement.orderInfo?.orderNumber || null,
        orderDate: movement.orderInfo?.orderDate || null,
        orderIssuer: movement.orderInfo?.issuer || null
      }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Movement created'
    });
  } catch (error) {
    console.error('❌ Error creating movement:', error);
    res.status(500).json({ 
      error: 'Failed to create movement',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.put('/movements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    await execute(`
      UPDATE Movements SET Type = @type WHERE MovementId = @id
    `, { type, id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movement' });
  }
});

// ==================== THRESHOLDS ====================

// GET /api/thresholds - Récupérer tous les seuils
router.get('/thresholds', async (req, res) => {
  try {
    const thresholds = await query(`
      SELECT 
        ThresholdId as id,
        Diameter as diameter, 
        MeterType as type, 
        MinQuantity as minQuantity
      FROM Thresholds
      ORDER BY Diameter, MeterType
    `);
    
    res.json(thresholds);
  } catch (error) {
    console.error('❌ Error fetching thresholds:', error);
    res.status(500).json({ 
      error: 'Failed to fetch thresholds',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// PUT /api/thresholds - Créer ou mettre à jour un seuil
router.put('/thresholds', async (req, res) => {
  try {
    const { diameter, type, minQuantity } = req.body;
    

    // Validation
    if (!diameter || !type || minQuantity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Les champs diameter, type et minQuantity sont obligatoires'
      });
    }

    await execute(
      `IF EXISTS (SELECT 1 FROM Thresholds WHERE Diameter = @diameter AND MeterType = @type)
      BEGIN
        UPDATE Thresholds SET MinQuantity = @minQuantity
        WHERE Diameter = @diameter AND MeterType = @type
      END
      ELSE
      BEGIN
        INSERT INTO Thresholds (Diameter, MeterType, MinQuantity)
        VALUES (@diameter, @type, @minQuantity)
      END`,
      { diameter, type, minQuantity }
    );

    res.json({ 
      success: true, 
      message: 'Threshold updated',
      data: { diameter, type, minQuantity }
    });
  } catch (error) {
    console.error('❌ Error updating threshold:', error);
    res.status(500).json({ 
      error: 'Failed to update threshold',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// DELETE /api/thresholds/:diameter/:type - Supprimer un seuil
router.delete('/thresholds/:diameter/:type', async (req, res) => {
  try {
    const { diameter, type } = req.params;
    
    const result = await execute(
      `DELETE FROM Thresholds WHERE Diameter = @diameter AND MeterType = @type`,
      { diameter, type }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        error: 'Threshold not found',
        details: `Le seuil pour ${diameter} - ${type} n'existe pas`
      });
    }

    res.json({ 
      success: true, 
      message: 'Threshold deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting threshold:', error);
    res.status(500).json({ 
      error: 'Failed to delete threshold',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// ==================== STATISTICS ====================

// GET /api/stats/dashboard - Statistiques pour le dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    // Total des compteurs par statut
    const metersByStatus = await query(`
      SELECT Status as status, COUNT(*) as count
      FROM Meters
      GROUP BY Status
    `);

    // Total des compteurs par localisation
    const metersByLocation = await query(`
      SELECT 
        l.Name as location,
        l.Type as type,
        COUNT(m.Id) as count
      FROM Locations l
      LEFT JOIN Meters m ON l.LocationId = m.CurrentLocationId
      GROUP BY l.Name, l.Type
      ORDER BY count DESC
    `);

    // Compteurs par diamètre et type
    const metersByDiameter = await query(`
      SELECT 
        Diameter as diameter,
        MeterType as type,
        COUNT(*) as count
      FROM Meters
      GROUP BY Diameter, MeterType
      ORDER BY Diameter, MeterType
    `);

    // Mouvements récents (7 derniers jours)
    const recentMovements = await query(`
      SELECT 
        Type as type,
        COUNT(*) as count
      FROM Movements
      WHERE Date >= DATEADD(day, -7, GETDATE())
      GROUP BY Type
    `);

    // Alertes de stock bas
    const lowStockAlerts = await query(`
      SELECT 
        m.Diameter as diameter,
        m.MeterType as type,
        COUNT(*) as currentStock,
        t.MinQuantity as minQuantity,
        (t.MinQuantity - COUNT(*)) as deficit
      FROM Meters m
      INNER JOIN Thresholds t ON m.Diameter = t.Diameter AND m.MeterType = t.MeterType
      WHERE m.Status = 'Neuf'
      GROUP BY m.Diameter, m.MeterType, t.MinQuantity
      HAVING COUNT(*) < t.MinQuantity
    `);

    res.json({
      totalMeters: metersByStatus.reduce((sum: number, s: any) => sum + s.count, 0),
      metersByStatus,
      metersByLocation,
      metersByDiameter,
      recentMovements,
      lowStockAlerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/stats/low-stock - Alertes de stock bas
router.get('/stats/low-stock', async (req, res) => {
  try {
    const alerts = await query(`
      SELECT 
        m.Diameter as diameter,
        m.MeterType as type,
        COUNT(*) as currentStock,
        t.MinQuantity as minQuantity,
        (t.MinQuantity - COUNT(*)) as deficit
      FROM Meters m
      INNER JOIN Thresholds t ON m.Diameter = t.Diameter AND m.MeterType = t.MeterType
      WHERE m.Status = 'Neuf'
      GROUP BY m.Diameter, m.MeterType, t.MinQuantity
      HAVING COUNT(*) < t.MinQuantity
      ORDER BY deficit DESC
    `);
    
    res.json(alerts);
  } catch (error) {
    console.error('❌ Error fetching low stock alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch low stock alerts',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// ==================== SYNC DATA (for initial sync) ====================

router.post('/sync', async (req, res) => {
  try {
    const { meters, movements, locations, thresholds } = req.body;

    // This is a simplified sync - in production, you'd want more robust conflict resolution
    res.json({ success: true, message: 'Sync endpoint ready' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

export default router;
