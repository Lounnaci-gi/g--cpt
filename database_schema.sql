-- ============================================================
-- BASE DE DONNÉES : SUIVI DE STOCK COMPTEURS D'EAU
-- SGBD : SQL Server
-- Description : Gestion des mouvements de stock des compteurs
--               d'eau dans les magasins des agences et antennes
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'SuiviStockCompteurs')
    DROP DATABASE SuiviStockCompteurs;
GO

CREATE DATABASE SuiviStockCompteurs;
GO

USE SuiviStockCompteurs;
GO

-- ============================================================
-- 1. STRUCTURE ORGANISATIONNELLE
-- ============================================================

CREATE TABLE Unite (
    UniteID     INT             IDENTITY(1,1)   PRIMARY KEY,
    Code        NVARCHAR(20)    NOT NULL,
    Libelle     NVARCHAR(100)   NOT NULL,
    Adresse     NVARCHAR(200)   NULL,
    CONSTRAINT UQ_Unite_Code UNIQUE (Code)
);
GO

CREATE TABLE Agence (
    AgenceID    INT             IDENTITY(1,1)   PRIMARY KEY,
    Code        NVARCHAR(20)    NOT NULL,
    Libelle     NVARCHAR(100)   NOT NULL,
    Adresse     NVARCHAR(200)   NULL,
    UniteID     INT             NOT NULL,
    CONSTRAINT UQ_Agence_Code UNIQUE (Code),
    CONSTRAINT FK_Agence_Unite FOREIGN KEY (UniteID) REFERENCES Unite(UniteID)
);
GO

CREATE TABLE Antenne (
    AntenneID   INT             IDENTITY(1,1)   PRIMARY KEY,
    Code        NVARCHAR(20)    NOT NULL,
    Libelle     NVARCHAR(100)   NOT NULL,
    Commune     NVARCHAR(100)   NOT NULL,
    AgenceID    INT             NOT NULL,
    CONSTRAINT UQ_Antenne_Code UNIQUE (Code),
    CONSTRAINT FK_Antenne_Agence FOREIGN KEY (AgenceID) REFERENCES Agence(AgenceID)
);
GO

-- ============================================================
-- 2. MAGASINS
-- Un magasin par Unite, par Agence et par Antenne
-- TypeMagasin : UNITE | AGENCE | ANTENNE
-- ============================================================

CREATE TABLE Magasin (
    MagasinID       INT             IDENTITY(1,1)   PRIMARY KEY,
    Libelle         NVARCHAR(100)   NOT NULL,
    TypeMagasin     NVARCHAR(10)    NOT NULL,
    UniteID         INT             NULL,
    AgenceID        INT             NULL,
    AntenneID       INT             NULL,
    CONSTRAINT CHK_Magasin_Type CHECK (TypeMagasin IN ('UNITE', 'AGENCE', 'ANTENNE')),
    CONSTRAINT CHK_Magasin_Coherence CHECK (
        (TypeMagasin = 'UNITE'    AND UniteID  IS NOT NULL AND AgenceID IS NULL AND AntenneID IS NULL) OR
        (TypeMagasin = 'AGENCE'   AND AgenceID IS NOT NULL AND UniteID  IS NULL AND AntenneID IS NULL) OR
        (TypeMagasin = 'ANTENNE'  AND AntenneID IS NOT NULL AND UniteID IS NULL AND AgenceID  IS NULL)
    ),
    CONSTRAINT FK_Magasin_Unite   FOREIGN KEY (UniteID)   REFERENCES Unite(UniteID),
    CONSTRAINT FK_Magasin_Agence  FOREIGN KEY (AgenceID)  REFERENCES Agence(AgenceID),
    CONSTRAINT FK_Magasin_Antenne FOREIGN KEY (AntenneID) REFERENCES Antenne(AntenneID)
);
GO

-- ============================================================
-- 3. RÉFÉRENTIELS COMPTEURS
-- ============================================================

CREATE TABLE Marque (
    MarqueID    INT             IDENTITY(1,1)   PRIMARY KEY,
    Libelle     NVARCHAR(100)   NOT NULL,
    CONSTRAINT UQ_Marque_Libelle UNIQUE (Libelle)
);
GO

CREATE TABLE Diametre (
    DiametreID  INT             IDENTITY(1,1)   PRIMARY KEY,
    Valeur      NVARCHAR(20)    NOT NULL,        -- Ex: DN15, DN20, DN25, DN32, DN40, DN50
    CONSTRAINT UQ_Diametre_Valeur UNIQUE (Valeur)
);
GO

-- Compteur : chaque unité physique identifiée par son numéro de série
-- Etat      : EN_STOCK | POSE | VENDU | RETOURNE
-- MagasinActuelID : magasin où se trouve le compteur (NULL si sorti du stock)

CREATE TABLE Compteur (
    CompteurID          INT             IDENTITY(1,1)   PRIMARY KEY,
    NumeroSerie         NVARCHAR(50)    NOT NULL,
    DiametreID          INT             NOT NULL,
    MarqueID            INT             NOT NULL,
    Etat                NVARCHAR(15)    NOT NULL    DEFAULT 'EN_STOCK',
    MagasinActuelID     INT             NULL,
    DateCreation        DATETIME        NOT NULL    DEFAULT GETDATE(),
    CONSTRAINT UQ_Compteur_NumSerie UNIQUE (NumeroSerie),
    CONSTRAINT CHK_Compteur_Etat CHECK (Etat IN ('EN_STOCK', 'POSE', 'VENDU', 'RETOURNE')),
    CONSTRAINT FK_Compteur_Diametre       FOREIGN KEY (DiametreID)      REFERENCES Diametre(DiametreID),
    CONSTRAINT FK_Compteur_Marque         FOREIGN KEY (MarqueID)        REFERENCES Marque(MarqueID),
    CONSTRAINT FK_Compteur_MagasinActuel  FOREIGN KEY (MagasinActuelID) REFERENCES Magasin(MagasinID)
);
GO

-- ============================================================
-- 4. FOURNISSEURS
-- ============================================================

CREATE TABLE Fournisseur (
    FournisseurID   INT             IDENTITY(1,1)   PRIMARY KEY,
    Code            NVARCHAR(20)    NOT NULL,
    RaisonSociale   NVARCHAR(150)   NOT NULL,
    Adresse         NVARCHAR(200)   NULL,
    CONSTRAINT UQ_Fournisseur_Code UNIQUE (Code)
);
GO

-- ============================================================
-- 5. ABONNÉS
-- ============================================================

CREATE TABLE CategorieClient (
    CategorieID INT             IDENTITY(1,1)   PRIMARY KEY,
    Code        NVARCHAR(10)    NOT NULL,        -- CAT1, CAT2, CAT3, CAT4
    Libelle     NVARCHAR(100)   NOT NULL,
    CONSTRAINT UQ_Categorie_Code UNIQUE (Code)
);
GO

CREATE TABLE Abonne (
    AbonneID    INT             IDENTITY(1,1)   PRIMARY KEY,
    CodeAbonne  NVARCHAR(30)    NOT NULL,
    Nom         NVARCHAR(100)   NOT NULL,
    Prenom      NVARCHAR(100)   NOT NULL,
    Adresse     NVARCHAR(200)   NOT NULL,
    CategorieID INT             NOT NULL,
    AntenneID   INT             NOT NULL,
    CONSTRAINT UQ_Abonne_Code UNIQUE (CodeAbonne),
    CONSTRAINT FK_Abonne_Categorie FOREIGN KEY (CategorieID) REFERENCES CategorieClient(CategorieID),
    CONSTRAINT FK_Abonne_Antenne   FOREIGN KEY (AntenneID)   REFERENCES Antenne(AntenneID)
);
GO

-- ============================================================
-- 6. TYPES DE MOUVEMENTS
-- ============================================================

CREATE TABLE TypeMouvement (
    TypeMouvementID INT             IDENTITY(1,1)   PRIMARY KEY,
    Code            NVARCHAR(20)    NOT NULL,
    Libelle         NVARCHAR(100)   NOT NULL,
    Sens            NVARCHAR(10)    NOT NULL,
    CONSTRAINT UQ_TypeMouvement_Code UNIQUE (Code),
    CONSTRAINT CHK_TypeMouvement_Sens CHECK (Sens IN ('ENTREE', 'SORTIE'))
);
GO

INSERT INTO TypeMouvement (Code, Libelle, Sens) VALUES
('APPRO',         'Approvisionnement Fournisseur',     'ENTREE'),
('TRANSF_RECU',   'Transfert Reçu',                    'ENTREE'),
('BRANCHEMENT',   'Branchement Neuf',                  'SORTIE'),
('REMPLACEMENT',  'Remplacement Compteur (Forfait)',    'SORTIE'),
('VENTE',         'Vente',                             'SORTIE'),
('TRANSF_EMIS',   'Transfert Émis',                    'SORTIE'),
('REINTEGRATION', 'Réintégration Fournisseur',         'SORTIE');
GO

-- ============================================================
-- 7. MOUVEMENTS DE STOCK
-- Structure : En-tête + Lignes (1 ligne = 1 compteur)
-- ============================================================

-- En-tête du mouvement
CREATE TABLE Mouvement (
    MouvementID             INT             IDENTITY(1,1)   PRIMARY KEY,
    DateMouvement           DATE            NOT NULL,
    TypeMouvementID         INT             NOT NULL,
    MagasinSourceID         INT             NULL,   -- NULL pour APPRO (entrée pure)
    MagasinDestID           INT             NULL,   -- NULL pour sorties finales (BRANCHEMENT, VENTE...)
    FournisseurID           INT             NULL,   -- APPRO et REINTEGRATION
    NumeroBL                NVARCHAR(50)    NULL,   -- APPRO uniquement
    AbonneID                INT             NULL,   -- BRANCHEMENT, REMPLACEMENT, VENTE
    NumeroDossier           NVARCHAR(50)    NULL,   -- BRANCHEMENT uniquement
    ResponsableReception    NVARCHAR(150)   NULL,   -- Décharge pour TRANSF_EMIS
    Observation             NVARCHAR(500)   NULL,
    DateSaisie              DATETIME        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Mouvement_Type        FOREIGN KEY (TypeMouvementID) REFERENCES TypeMouvement(TypeMouvementID),
    CONSTRAINT FK_Mouvement_MagSrc      FOREIGN KEY (MagasinSourceID) REFERENCES Magasin(MagasinID),
    CONSTRAINT FK_Mouvement_MagDest     FOREIGN KEY (MagasinDestID)   REFERENCES Magasin(MagasinID),
    CONSTRAINT FK_Mouvement_Fournisseur FOREIGN KEY (FournisseurID)   REFERENCES Fournisseur(FournisseurID),
    CONSTRAINT FK_Mouvement_Abonne      FOREIGN KEY (AbonneID)        REFERENCES Abonne(AbonneID)
);
GO

-- Lignes du mouvement : 1 ligne = 1 compteur (identifié par son N° de série)
CREATE TABLE MouvementLigne (
    LigneID         INT     IDENTITY(1,1)   PRIMARY KEY,
    MouvementID     INT     NOT NULL,
    CompteurID      INT     NOT NULL,
    CONSTRAINT UQ_MvtLigne UNIQUE (MouvementID, CompteurID),
    CONSTRAINT FK_MvtLigne_Mouvement FOREIGN KEY (MouvementID) REFERENCES Mouvement(MouvementID),
    CONSTRAINT FK_MvtLigne_Compteur  FOREIGN KEY (CompteurID)  REFERENCES Compteur(CompteurID)
);
GO

-- ============================================================
-- 8. STOCK ACTUEL PAR MAGASIN ET PAR DIAMÈTRE
-- ============================================================

CREATE TABLE StockActuel (
    StockID         INT     IDENTITY(1,1)   PRIMARY KEY,
    MagasinID       INT     NOT NULL,
    DiametreID      INT     NOT NULL,
    Quantite        INT     NOT NULL    DEFAULT 0,
    CONSTRAINT UQ_Stock UNIQUE (MagasinID, DiametreID),
    CONSTRAINT CHK_Stock_Quantite CHECK (Quantite >= 0),
    CONSTRAINT FK_Stock_Magasin  FOREIGN KEY (MagasinID)  REFERENCES Magasin(MagasinID),
    CONSTRAINT FK_Stock_Diametre FOREIGN KEY (DiametreID) REFERENCES Diametre(DiametreID)
);
GO

-- ============================================================
-- 9. SEUIL MINIMUM DE STOCK
-- Défini par diamètre et par magasin
-- ============================================================

CREATE TABLE SeuilMinimum (
    SeuilID             INT     IDENTITY(1,1)   PRIMARY KEY,
    MagasinID           INT     NOT NULL,
    DiametreID          INT     NOT NULL,
    QuantiteMinimum     INT     NOT NULL,
    CONSTRAINT UQ_Seuil UNIQUE (MagasinID, DiametreID),
    CONSTRAINT CHK_Seuil_Quantite CHECK (QuantiteMinimum > 0),
    CONSTRAINT FK_Seuil_Magasin  FOREIGN KEY (MagasinID)  REFERENCES Magasin(MagasinID),
    CONSTRAINT FK_Seuil_Diametre FOREIGN KEY (DiametreID) REFERENCES Diametre(DiametreID)
);
GO

-- ============================================================
-- 10. INDEX
-- ============================================================

-- Agence
CREATE INDEX IX_Agence_Unite
    ON Agence(UniteID);

-- Antenne
CREATE INDEX IX_Antenne_Agence
    ON Antenne(AgenceID);

-- Magasin
CREATE INDEX IX_Magasin_Type
    ON Magasin(TypeMagasin);
CREATE INDEX IX_Magasin_Agence
    ON Magasin(AgenceID) WHERE AgenceID IS NOT NULL;
CREATE INDEX IX_Magasin_Antenne
    ON Magasin(AntenneID) WHERE AntenneID IS NOT NULL;

-- Compteur
CREATE INDEX IX_Compteur_Diametre
    ON Compteur(DiametreID);
CREATE INDEX IX_Compteur_Marque
    ON Compteur(MarqueID);
CREATE INDEX IX_Compteur_Etat
    ON Compteur(Etat);
CREATE INDEX IX_Compteur_MagasinActuel
    ON Compteur(MagasinActuelID) WHERE MagasinActuelID IS NOT NULL;

-- Abonné
CREATE INDEX IX_Abonne_Antenne
    ON Abonne(AntenneID);
CREATE INDEX IX_Abonne_Categorie
    ON Abonne(CategorieID);

-- Mouvement (clé pour les bilans et recherches)
CREATE INDEX IX_Mouvement_Date
    ON Mouvement(DateMouvement)
    INCLUDE (TypeMouvementID, MagasinSourceID, MagasinDestID, AbonneID);

CREATE INDEX IX_Mouvement_AnneeMois
    ON Mouvement(DateMouvement)
    INCLUDE (TypeMouvementID, MagasinSourceID, AbonneID);

CREATE INDEX IX_Mouvement_Type
    ON Mouvement(TypeMouvementID);
CREATE INDEX IX_Mouvement_MagSrc
    ON Mouvement(MagasinSourceID) WHERE MagasinSourceID IS NOT NULL;
CREATE INDEX IX_Mouvement_MagDest
    ON Mouvement(MagasinDestID) WHERE MagasinDestID IS NOT NULL;
CREATE INDEX IX_Mouvement_Abonne
    ON Mouvement(AbonneID) WHERE AbonneID IS NOT NULL;
CREATE INDEX IX_Mouvement_Fournisseur
    ON Mouvement(FournisseurID) WHERE FournisseurID IS NOT NULL;

-- MouvementLigne
CREATE INDEX IX_MvtLigne_Mouvement
    ON MouvementLigne(MouvementID);
CREATE INDEX IX_MvtLigne_Compteur
    ON MouvementLigne(CompteurID);

-- StockActuel
CREATE INDEX IX_Stock_Magasin
    ON StockActuel(MagasinID);
CREATE INDEX IX_Stock_Diametre
    ON StockActuel(DiametreID);

-- SeuilMinimum
CREATE INDEX IX_Seuil_Magasin
    ON SeuilMinimum(MagasinID);

GO
-- ============================================================
-- 11. VUE : ALERTE STOCK MINIMUM
-- Retourne les magasins dont le stock est en dessous du seuil
-- ============================================================

CREATE VIEW VW_AlerteStockMinimum AS
SELECT
    m.MagasinID,
    m.Libelle           AS Magasin,
    m.TypeMagasin,
    ag.Libelle          AS Agence,
    an.Commune          AS Commune,
    d.Valeur            AS Diametre,
    sa.Quantite         AS StockActuel,
    sm.QuantiteMinimum  AS SeuilMinimum,
    (sm.QuantiteMinimum - sa.Quantite) AS Ecart
FROM StockActuel sa
INNER JOIN SeuilMinimum sm ON sa.MagasinID = sm.MagasinID AND sa.DiametreID = sm.DiametreID
INNER JOIN Magasin m       ON sa.MagasinID = m.MagasinID
INNER JOIN Diametre d      ON sa.DiametreID = d.DiametreID
LEFT JOIN  Agence ag       ON m.AgenceID = ag.AgenceID
LEFT JOIN  Antenne an      ON m.AntenneID = an.AntenneID
WHERE sa.Quantite < sm.QuantiteMinimum;
GO

GO
-- ============================================================
-- 12. VUE : BILAN MENSUEL (détail journalier)
-- Pose compteur par type de sortie, catégorie client et diamètre
-- ============================================================

CREATE VIEW VW_BilanMensuel AS
SELECT
    YEAR(mv.DateMouvement)              AS Annee,
    MONTH(mv.DateMouvement)             AS Mois,
    DAY(mv.DateMouvement)               AS Jour,
    mv.DateMouvement,
    m.MagasinID,
    m.Libelle                           AS Magasin,
    m.TypeMagasin,
    ag.AgenceID,
    ag.Libelle                          AS Agence,
    an.AntenneID,
    an.Commune                          AS Commune,
    tm.Code                             AS TypeMouvement,
    tm.Libelle                          AS LibelleMouvement,
    tm.Sens,
    d.Valeur                            AS Diametre,
    cc.Code                             AS CategorieClient,
    COUNT(ml.CompteurID)                AS Quantite
FROM Mouvement mv
INNER JOIN MouvementLigne ml    ON mv.MouvementID = ml.MouvementID
INNER JOIN TypeMouvement tm     ON mv.TypeMouvementID = tm.TypeMouvementID
INNER JOIN Compteur c           ON ml.CompteurID = c.CompteurID
INNER JOIN Diametre d           ON c.DiametreID = d.DiametreID
LEFT JOIN  Magasin m            ON COALESCE(mv.MagasinSourceID, mv.MagasinDestID) = m.MagasinID
LEFT JOIN  Agence ag            ON m.AgenceID = ag.AgenceID
LEFT JOIN  Antenne an           ON m.AntenneID = an.AntenneID
LEFT JOIN  Abonne ab            ON mv.AbonneID = ab.AbonneID
LEFT JOIN  CategorieClient cc   ON ab.CategorieID = cc.CategorieID
GROUP BY
    YEAR(mv.DateMouvement), MONTH(mv.DateMouvement), DAY(mv.DateMouvement),
    mv.DateMouvement, m.MagasinID, m.Libelle, m.TypeMagasin,
    ag.AgenceID, ag.Libelle, an.AntenneID, an.Commune,
    tm.Code, tm.Libelle, tm.Sens, d.Valeur, cc.Code;
GO

GO
-- ============================================================
-- 13. VUE : BILAN ANNUEL (synthèse mensuelle)
-- ============================================================

CREATE VIEW VW_BilanAnnuel AS
SELECT
    YEAR(mv.DateMouvement)              AS Annee,
    MONTH(mv.DateMouvement)             AS Mois,
    m.MagasinID,
    m.Libelle                           AS Magasin,
    m.TypeMagasin,
    ag.AgenceID,
    ag.Libelle                          AS Agence,
    an.AntenneID,
    an.Commune                          AS Commune,
    tm.Code                             AS TypeMouvement,
    tm.Libelle                          AS LibelleMouvement,
    tm.Sens,
    d.Valeur                            AS Diametre,
    cc.Code                             AS CategorieClient,
    COUNT(ml.CompteurID)                AS Quantite
FROM Mouvement mv
INNER JOIN MouvementLigne ml    ON mv.MouvementID = ml.MouvementID
INNER JOIN TypeMouvement tm     ON mv.TypeMouvementID = tm.TypeMouvementID
INNER JOIN Compteur c           ON ml.CompteurID = c.CompteurID
INNER JOIN Diametre d           ON c.DiametreID = d.DiametreID
LEFT JOIN  Magasin m            ON COALESCE(mv.MagasinSourceID, mv.MagasinDestID) = m.MagasinID
LEFT JOIN  Agence ag            ON m.AgenceID = ag.AgenceID
LEFT JOIN  Antenne an           ON m.AntenneID = an.AntenneID
LEFT JOIN  Abonne ab            ON mv.AbonneID = ab.AbonneID
LEFT JOIN  CategorieClient cc   ON ab.CategorieID = cc.CategorieID
GROUP BY
    YEAR(mv.DateMouvement), MONTH(mv.DateMouvement),
    m.MagasinID, m.Libelle, m.TypeMagasin,
    ag.AgenceID, ag.Libelle, an.AntenneID, an.Commune,
    tm.Code, tm.Libelle, tm.Sens, d.Valeur, cc.Code;
GO

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================