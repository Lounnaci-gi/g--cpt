# 📊 Base de Données - H2OStockDB

## 🗄️ Structure de la Base de Données

### Tables Principales

#### 1. **Locations** (Localisations)
Gère les agences et antennes avec une hiérarchie parent-enfant.

```sql
LocationId        INT              - Identifiant unique (Auto-incrément)
Name              NVARCHAR(100)    - Nom de la localisation (Unique)
Type              NVARCHAR(20)     - 'Agence' ou 'Antenne'
ParentAgencyId    INT              - FK vers l'agence parente (NULL pour les agences)
CreatedAt         DATETIME         - Date de création
```

**Relations :**
- Une **Agence** n'a pas de parent (`ParentAgencyId = NULL`)
- Une **Antenne** appartient à une Agence (`ParentAgencyId` référence une Agence)

---

#### 2. **Meters** (Compteurs d'eau)
Stocke tous les compteurs d'eau avec leur état actuel.

```sql
Id                UNIQUEIDENTIFIER - Identifiant unique (GUID)
SerialNumber      NVARCHAR(50)     - Numéro de série (Unique)
Diameter          NVARCHAR(50)     - Diamètre (ex: '15/21 (DN15)')
MeterType         NVARCHAR(50)     - Type (ex: 'Volumétrique', 'Vitesse')
Status            NVARCHAR(20)     - État: 'Neuf', 'Installé', 'À l'arrêt', 'Vendu'
CurrentLocationId INT              - FK vers la localisation actuelle
LastUpdate        DATETIME         - Dernière mise à jour
```

**Statuts possibles :**
- `Neuf` - Compteur en stock, jamais utilisé
- `Installé` - Compteur posé chez un client
- `À l'arrêt` - Compteur déposé/remplacé
- `Vendu` - Compteur vendu à un tiers

---

#### 3. **Movements** (Historique des mouvements)
Trace tous les mouvements de stock pour un audit complet.

```sql
MovementId        UNIQUEIDENTIFIER - Identifiant unique (GUID)
MeterId           UNIQUEIDENTIFIER - FK vers le compteur (NULL pour les lots)
Date              DATETIME         - Date du mouvement
Type              NVARCHAR(50)     - Type de mouvement
SourceLocation    NVARCHAR(100)    - Provenance
DestinationLocation NVARCHAR(100)  - Destination
SerialNumber      NVARCHAR(50)     - N° série au moment du mouvement
Diameter          NVARCHAR(50)     - Diamètre
Details           NVARCHAR(MAX)    - Détails supplémentaires

-- Informations Client (Pose/Remplacement/Vente)
ClientCode        NVARCHAR(20)     - Code client
ClientName        NVARCHAR(100)    - Nom du client
ClientAddress     NVARCHAR(MAX)    - Adresse
ClientFileNumber  NVARCHAR(50)     - N° dossier
RealizationDate   DATETIME         - Date de réalisation

-- Informations Commande (Réception)
OrderNumber       NVARCHAR(50)     - N° de bon de commande
OrderDate         DATETIME         - Date du bon
OrderIssuer       NVARCHAR(100)    - Émetteur
```

**Types de mouvements :**
- `Transfert` - Mouvement entre localisations
- `Pose` - Installation chez un client
- `Remplacement` - Remplacement d'un ancien compteur
- `Vente` - Vente à un tiers
- `Réintégration` - Retour d'un compteur
- `Réception` - Réception de stock fournisseur

---

#### 4. **Thresholds** (Seuils d'alerte)
Définit les niveaux minimum de stock pour les alertes.

```sql
ThresholdId       INT              - Identifiant unique (Auto-incrément)
Diameter          NVARCHAR(50)     - Diamètre concerné
MeterType         NVARCHAR(50)     - Type concerné
MinQuantity       INT              - Quantité minimum (défaut: 0)
```

**Contraintes :**
- Unique sur `(Diameter, MeterType)` - Un seul seuil par combinaison

---

## 🔌 Indicateur de Connexion

L'application dispose d'un **indicateur visuel de connexion** à la base de données affiché en temps réel dans l'interface.

### 📍 Emplacement

- **Desktop** : En bas de la barre latérale gauche
- **Mobile** : Dans la barre de navigation supérieure

### 🎨 Apparence

#### ✅ Connecté
```
┌─────────────────────────────┐
│ 📶 🗄️  Connecté             │ ← Fond vert
│    H2OStockDB @ localhost   │
└─────────────────────────────┘
```

#### ❌ Déconnecté
```
┌─────────────────────────────┐
│ 📴 🗄️  Déconnecté           │ ← Fond rouge
│    H2OStockDB @ localhost   │
└─────────────────────────────┘
```

### 🔄 Fonctionnalités

1. **Vérification automatique** toutes les 30 secondes
2. **Bouton de refresh** manuel pour vérifier immédiatement
3. **Horodatage** de la dernière vérification
4. **Fallback** sur localStorage si la base est inaccessible

### 🔧 API Endpoint

```http
GET /api/health
```

**Réponse succès :**
```json
{
  "status": "ok",
  "timestamp": "2026-04-18T12:00:00.000Z",
  "database": {
    "connected": true,
    "name": "H2OStockDB",
    "server": "localhost"
  }
}
```

**Réponse erreur :**
```json
{
  "status": "error",
  "timestamp": "2026-04-18T12:00:00.000Z",
  "database": {
    "connected": false,
    "name": "H2OStockDB",
    "server": "localhost"
  }
}
```

---

## 🛠️ Scripts SQL

### Script de création
📄 `database_schema.sql` - Crée la base et les tables

### Script de diagnostic
📄 `database_diagnostic.sql` - Vérifie l'état complet de la BDD

**Exécution du diagnostic :**
```sql
-- Dans SQL Server Management Studio
USE H2OStockDB;
GO
-- Copier et exécuter le contenu de database_diagnostic.sql
```

**Le diagnostic vérifie :**
- ✓ Existence des 4 tables
- ✓ Nombre d'enregistrements
- ✓ Répartition des compteurs par statut
- ✓ Répartition par diamètre
- ✓ 5 derniers mouvements
- ✓ Seuils configurés
- ⚠ Alertes de stock bas
- ✓ Intégrité des données
- ✓ Résumé complet

---

## 📊 Requêtes Utiles

### Voir tous les compteurs par localisation
```sql
SELECT 
    l.Name as 'Localisation',
    m.Status as 'Statut',
    m.Diameter as 'Diamètre',
    m.MeterType as 'Type',
    m.SerialNumber as 'N° Série'
FROM Meters m
LEFT JOIN Locations l ON m.CurrentLocationId = l.LocationId
ORDER BY l.Name, m.Status, m.Diameter;
```

### Historique d'un compteur
```sql
SELECT 
    Date,
    Type,
    SourceLocation as 'De',
    DestinationLocation as 'Vers',
    ClientCode,
    Details
FROM Movements
WHERE SerialNumber = 'SN001'
ORDER BY Date DESC;
```

### Stock actuel par localisation et diamètre
```sql
SELECT 
    l.Name as 'Localisation',
    m.Diameter as 'Diamètre',
    m.MeterType as 'Type',
    COUNT(*) as 'Quantité'
FROM Meters m
LEFT JOIN Locations l ON m.CurrentLocationId = l.LocationId
WHERE m.Status = 'Neuf'
GROUP BY l.Name, m.Diameter, m.MeterType
ORDER BY l.Name, m.Diameter;
```

### Compteurs installés ce mois-ci
```sql
SELECT 
    m.SerialNumber,
    m.Diameter,
    m.MeterType,
    mv.ClientCode,
    mv.ClientName,
    mv.RealizationDate
FROM Movements mv
JOIN Meters m ON mv.MeterId = m.Id
WHERE mv.Type = 'Pose'
    AND MONTH(mv.Date) = MONTH(GETDATE())
    AND YEAR(mv.Date) = YEAR(GETDATE())
ORDER BY mv.RealizationDate DESC;
```

---

## 🔐 Sécurité

### Bonnes pratiques

1. **Ne jamais commiter `.env`** avec les credentials
2. Utiliser l'authentification Windows en production si possible
3. Activer le chiffrement TLS pour les connexions distantes
4. Restreindre les permissions de l'utilisateur `lounnaci`
5. Faire des backups réguliers

### Permissions recommandées
```sql
-- Créer un utilisateur dédié avec permissions minimales
USE H2OStockDB;
CREATE USER [h2o_app_user] FOR LOGIN [h2o_app_login];
EXEC sp_addrolemember 'db_datareader', 'h2o_app_user';
EXEC sp_addrolemember 'db_datawriter', 'h2o_app_user';
```

---

## 🐛 Dépannage

### Le serveur ne se connecte pas

1. **Vérifier que SQL Server est en cours d'exécution**
   ```powershell
   Get-Service -Name "MSSQL*"
   ```

2. **Vérifier la connectivité**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 1433
   ```

3. **Vérifier le fichier `.env`**
   ```env
   DB_SERVER=localhost
   DB_NAME=H2OStockDB
   DB_USER=lounnaci
   DB_PASSWORD=hyhwarez
   ```

4. **Si SQL Server Express**
   ```env
   DB_SERVER=localhost\SQLEXPRESS
   ```

5. **Vérifier les logs du serveur**
   - Terminal où `npm run dev:server` est exécuté
   - Messages `✅ Connected to SQL Server Database`

### L'indicateur montre "Déconnecté"

1. Vérifier que le backend tourne sur `http://localhost:5000`
2. Tester l'API : `http://localhost:5000/api/health`
3. Vérifier la console du navigateur (F12) pour les erreurs CORS
4. Redémarrer le serveur : `npm run dev:server`

---

## 📞 Support

Pour toute question ou problème :
1. Exécuter le script de diagnostic `database_diagnostic.sql`
2. Vérifier les logs du serveur backend
3. Consulter la console du navigateur
4. Tester l'endpoint `/api/health`

---

**Documentation créée le 18 avril 2026**  
**Version 1.0 - H2O Stock Manager**
