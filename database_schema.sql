-- ==========================================================
-- SCRIPT UNIQUE - H2O STOCK MANAGER (STRUCTURE VIDE)
-- Crée la base de données et les tables avec la structure finale
-- ==========================================================

-- 1. Création de la Base de Données
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'H2OStockDB')
BEGIN
    CREATE DATABASE H2OStockDB;
END
GO

USE H2OStockDB;
GO

-- 2. Table des Localisations (Agences et Antennes)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Locations]') AND type in (N'U'))
BEGIN
    CREATE TABLE Locations (
        LocationId INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Type NVARCHAR(20) NOT NULL CHECK (Type IN ('Agence', 'Antenne')),
        ParentAgencyId INT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Location_Parent FOREIGN KEY (ParentAgencyId) REFERENCES Locations(LocationId)
    );
END
GO

-- 3. Table des Compteurs (Meters)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Meters]') AND type in (N'U'))
BEGIN
    CREATE TABLE Meters (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SerialNumber NVARCHAR(50) NOT NULL UNIQUE,
        Diameter NVARCHAR(50) NOT NULL,
        MeterType NVARCHAR(50) NOT NULL,
        Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Neuf', 'Installé', 'à l''arrêt', 'Vendu')),
        CurrentLocationId INT NULL,
        LastUpdate DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Meters_Location FOREIGN KEY (CurrentLocationId) REFERENCES Locations(LocationId)
    );
END
GO

-- 4. Table des Mouvements de Stock
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Movements]') AND type in (N'U'))
BEGIN
    CREATE TABLE Movements (
        MovementId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MeterId UNIQUEIDENTIFIER NULL,
        Date DATETIME NOT NULL DEFAULT GETDATE(),
        Type NVARCHAR(50) NOT NULL,
        SourceLocation NVARCHAR(100),
        DestinationLocation NVARCHAR(100),
        SerialNumber NVARCHAR(50),
        Diameter NVARCHAR(50),
        Details NVARCHAR(MAX),
        
        -- Informations Client
        ClientCode NVARCHAR(20),
        ClientName NVARCHAR(100),
        ClientAddress NVARCHAR(MAX),
        ClientFileNumber NVARCHAR(50),
        RealizationDate DATETIME,
        
        -- Informations Commande
        OrderNumber NVARCHAR(50),
        OrderDate DATETIME,
        OrderIssuer NVARCHAR(100),

        CONSTRAINT FK_Movements_Meter FOREIGN KEY (MeterId) REFERENCES Meters(Id)
    );
END
GO

-- 5. Table des Seuils d'Alerte (Thresholds)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Thresholds]') AND type in (N'U'))
BEGIN
    CREATE TABLE Thresholds (
        ThresholdId INT PRIMARY KEY IDENTITY(1,1),
        Diameter NVARCHAR(50) NOT NULL,
        MeterType NVARCHAR(50) NOT NULL,
        MinQuantity INT NOT NULL DEFAULT 0,
        CONSTRAINT UQ_Threshold UNIQUE (Diameter, MeterType)
    );
END
GO

PRINT '✅ Base de données H2OStockDB créée avec succès (structure vide).';
GO