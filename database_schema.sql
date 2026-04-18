-- ==========================================================
-- SCRIPT UNIQUE - H2O STOCK MANAGER (PRO VERSION)
-- Crée la base de données et les tables avec structure optimisée
-- ==========================================================

USE H2OStockDB;
GO

-- Nettoyage pour repartir à zéro (Ordre inverse des dépendances)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Thresholds]') AND type in (N'U')) DROP TABLE Thresholds;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Movements]') AND type in (N'U')) DROP TABLE Movements;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Meters]') AND type in (N'U')) DROP TABLE Meters;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Locations]') AND type in (N'U')) DROP TABLE Locations;
GO

-- 2. Table des Localisations (Agences et Antennes)
CREATE TABLE Locations (
    LocationId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Type NVARCHAR(20) NOT NULL CHECK (Type IN ('Agence', 'Antenne')),
    ParentAgencyId INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Location_Parent FOREIGN KEY (ParentAgencyId) REFERENCES Locations(LocationId)
);
GO

-- 3. Table des Compteurs (Meters)
CREATE TABLE Meters (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SerialNumber NVARCHAR(50) NOT NULL UNIQUE,
    Diameter NVARCHAR(50) NOT NULL,
    MeterType NVARCHAR(50) NOT NULL,
    Brand NVARCHAR(50) DEFAULT 'Itron',
    Model NVARCHAR(50) DEFAULT 'Volumétrique',
    ManufacturingYear INT DEFAULT YEAR(GETDATE()),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Neuf', 'Installé', 'À l''arrêt', 'Vendu')),
    CurrentLocationId INT NULL,
    LastUpdate DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Meters_Location FOREIGN KEY (CurrentLocationId) REFERENCES Locations(LocationId)
);
GO

-- Index de performance
CREATE INDEX IX_Meters_SerialNumber ON Meters(SerialNumber);
CREATE INDEX IX_Meters_Location ON Meters(CurrentLocationId);
CREATE INDEX IX_Meters_Status ON Meters(Status);
GO

-- 4. Table des Mouvements de Stock
CREATE TABLE Movements (
    MovementId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeterId UNIQUEIDENTIFIER NULL,
    Date DATETIME NOT NULL DEFAULT GETDATE(),
    Type NVARCHAR(50) NOT NULL,
    SourceLocation NVARCHAR(100),
    DestinationLocation NVARCHAR(100),
    SerialNumber NVARCHAR(50),
    Diameter NVARCHAR(50),
    Brand NVARCHAR(50),
    Model NVARCHAR(50),
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
GO

CREATE INDEX IX_Movements_Date ON Movements(Date DESC);
CREATE INDEX IX_Movements_SN ON Movements(SerialNumber);
GO

-- 5. Table des Seuils d'Alerte (Thresholds)
CREATE TABLE Thresholds (
    ThresholdId INT PRIMARY KEY IDENTITY(1,1),
    Diameter NVARCHAR(50) NOT NULL,
    MeterType NVARCHAR(50) NOT NULL,
    MinQuantity INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_Threshold UNIQUE (Diameter, MeterType)
);
GO

PRINT '✅ Base de données H2OStockDB reconstruite avec succès (Structure PRO).';
GO