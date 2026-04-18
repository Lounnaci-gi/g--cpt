-- ==========================================================
-- SCRIPT DE MIGRATION - Mise à jour de la table Movements
-- Exécuter ce script pour corriger la structure de la table
-- ==========================================================

USE H2OStockDB;
GO

PRINT '🔄 Mise à jour de la table Movements...';
GO

-- Vérifier si la table existe
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Movements]') AND type in (N'U'))
BEGIN
    PRINT '📋 Table Movements existante détectée';
    
    -- Vérifier les colonnes manquantes et les ajouter
    
    -- SourceLocation
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'SourceLocation')
    BEGIN
        ALTER TABLE Movements ADD SourceLocation NVARCHAR(100);
        PRINT '✅ Colonne SourceLocation ajoutée';
    END
    
    -- DestinationLocation
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'DestinationLocation')
    BEGIN
        ALTER TABLE Movements ADD DestinationLocation NVARCHAR(100);
        PRINT '✅ Colonne DestinationLocation ajoutée';
    END
    
    -- Diameter
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'Diameter')
    BEGIN
        ALTER TABLE Movements ADD Diameter NVARCHAR(50);
        PRINT '✅ Colonne Diameter ajoutée';
    END
    
    -- ClientAddress
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'ClientAddress')
    BEGIN
        ALTER TABLE Movements ADD ClientAddress NVARCHAR(MAX);
        PRINT '✅ Colonne ClientAddress ajoutée';
    END
    
    -- RealizationDate
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'RealizationDate')
    BEGIN
        ALTER TABLE Movements ADD RealizationDate DATETIME;
        PRINT '✅ Colonne RealizationDate ajoutée';
    END
    
    -- OrderDate
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'OrderDate')
    BEGIN
        ALTER TABLE Movements ADD OrderDate DATETIME;
        PRINT '✅ Colonne OrderDate ajoutée';
    END
    
    -- OrderIssuer
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Movements') AND name = 'OrderIssuer')
    BEGIN
        ALTER TABLE Movements ADD OrderIssuer NVARCHAR(100);
        PRINT '✅ Colonne OrderIssuer ajoutée';
    END
    
    PRINT '✅ Mise à jour de la table Movements terminée';
END
ELSE
BEGIN
    PRINT '❌ Table Movements non trouvée. Exécutez database_schema.sql d''abord.';
END
GO

-- Vérifier la structure finale
PRINT '📊 Structure actuelle de la table Movements:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Movements'
ORDER BY ORDINAL_POSITION;
GO

PRINT '✅ Migration terminée !';
GO
