-- ==========================================================
-- SCRIPT DE BASE DE DONNÉES SQL SERVER - H2O STOCK MANAGER
-- Soutient l'architecture de gestion de stock de compteurs
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
-- Gère la hiérarchie : une Antenne appartient à une Agence Commerciale
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Locations]') AND type in (N'U'))
BEGIN
    CREATE TABLE Locations (
        LocationId INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Type NVARCHAR(20) NOT NULL CHECK (Type IN ('Agence', 'Antenne')),
        ParentAgencyId INT NULL, -- Clé étrangère vers cette même table pour la hiérarchie
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
        Diameter NVARCHAR(50) NOT NULL, -- Ex: '15/21 (DN15)'
        MeterType NVARCHAR(50) NOT NULL, -- Ex: 'Volumétrique', 'Vitesse'
        Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Neuf', 'Installé', 'À l''arrêt', 'Vendu')),
        CurrentLocationId INT NULL,
        LastUpdate DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Meters_Location FOREIGN KEY (CurrentLocationId) REFERENCES Locations(LocationId)
    );
END
GO

-- 4. Table des Mouvements de Stock (Historique)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Movements]') AND type in (N'U'))
BEGIN
    CREATE TABLE Movements (
        MovementId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MeterId UNIQUEIDENTIFIER NULL,
        Date DATETIME NOT NULL DEFAULT GETDATE(),
        Type NVARCHAR(50) NOT NULL, -- 'Transfert', 'Pose', 'Vente', etc.
        SourceLocation NVARCHAR(100), -- Nom de la loc ou 'Fournisseur' / 'Client'
        DestinationLocation NVARCHAR(100), -- Nom de la loc ou 'Client' / 'Client Tiers'
        SerialNumber NVARCHAR(50), -- Capture du S/N au moment du mouvement
        Diameter NVARCHAR(50),
        Details NVARCHAR(MAX),
        
        -- Informations Client (pour Pose/Remplacement/Vente)
        ClientCode NVARCHAR(20),
        ClientName NVARCHAR(100),
        ClientAddress NVARCHAR(MAX),
        ClientFileNumber NVARCHAR(50), -- N° Dossier client
        RealizationDate DATETIME,
        
        -- Informations Commande (pour Réception)
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

-- ==========================================================
-- DONNÉES INITIALES (EXEMPLES)
-- ==========================================================

-- Insertion de l'agence principale
IF NOT EXISTS (SELECT 1 FROM Locations WHERE Name = 'Agence Commerciale')
BEGIN
    INSERT INTO Locations (Name, Type, ParentAgencyId) 
    VALUES ('Agence Commerciale', 'Agence', NULL);
    
    DECLARE @AgencyId INT = SCOPE_IDENTITY();

    -- Insertion des antennes rattachées
    INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES ('Antenne Nord', 'Antenne', @AgencyId);
    INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES ('Antenne Sud', 'Antenne', @AgencyId);
    INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES ('Antenne Est', 'Antenne', @AgencyId);
    INSERT INTO Locations (Name, Type, ParentAgencyId) VALUES ('Antenne Ouest', 'Antenne', @AgencyId);
END

-- Insertion des seuils par défaut
IF NOT EXISTS (SELECT 1 FROM Thresholds)
BEGIN
    INSERT INTO Thresholds (Diameter, MeterType, MinQuantity) VALUES ('15/21 (DN15)', 'Volumétrique', 10);
    INSERT INTO Thresholds (Diameter, MeterType, MinQuantity) VALUES ('20/27 (DN20)', 'Vitesse', 5);
END
GO

PRINT 'Base de données H2OStockDB et tables créées avec succès.';
GO
