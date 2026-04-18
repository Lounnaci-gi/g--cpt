# 🚀 Guide de Configuration - H2O Stock avec SQL Server

## 📋 Prérequis

1. **SQL Server** installé et en cours d'exécution
2. **Node.js** (v18+)
3. Base de données **H2OStockDB** créée avec le script `database_schema.sql`

## 🔧 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Le fichier `.env` est déjà créé avec vos paramètres :

```env
PORT=5000
DB_SERVER=localhost
DB_NAME=H2OStockDB
DB_USER=lounnaci
DB_PASSWORD=hyhwarez
DB_PORT=1433
```

**⚠️ Important :** Modifiez `DB_SERVER` si votre SQL Server n'est pas sur localhost.

### 3. Démarrer l'application

#### Option 1: Démarrer le serveur backend uniquement

```bash
npm run dev:server
```

Le serveur API sera disponible sur `http://localhost:5000/api`

#### Option 2: Démarrer le frontend uniquement

```bash
npm run dev
```

L'application React sera disponible sur `http://localhost:3000`

#### Option 3: Démarrer les deux simultanément (Recommandé)

```bash
npm run dev:all
```

Cela démarrera :
- Frontend : `http://localhost:3000`
- Backend API : `http://localhost:5000/api`

## 🗄️ Structure de la Base de Données

### Tables créées :

1. **Locations** - Agences et Antennes
2. **Meters** - Compteurs d'eau
3. **Movements** - Historique des mouvements
4. **Thresholds** - Seuils d'alerte de stock

## 🔄 Fonctionnement

### Au démarrage de l'application :

1. ✅ Le serveur backend se connecte à SQL Server
2. ✅ Le frontend charge toutes les données depuis la base via l'API
3. ✅ Les données sont affichées dans l'interface
4. ✅ Toutes les opérations (ajout, modification, transfert) sont sauvegardées en temps réel dans SQL Server

### Endpoints API disponibles :

```
GET    /api/locations          - Liste des localisations
POST   /api/locations          - Créer une localisation
PUT    /api/locations/:oldName - Modifier une localisation

GET    /api/meters             - Liste des compteurs
POST   /api/meters             - Créer un compteur
PUT    /api/meters/:id         - Modifier un compteur

GET    /api/movements          - Liste des mouvements
POST   /api/movements          - Créer un mouvement
PUT    /api/movements/:id      - Modifier un mouvement

GET    /api/thresholds         - Liste des seuils
PUT    /api/thresholds         - Créer/Mettre à jour un seuil

GET    /api/health             - Vérification de santé du serveur
```

## 🐛 Résolution de Problèmes

### Le serveur ne peut pas se connecter à SQL Server

1. Vérifiez que SQL Server est en cours d'exécution
2. Vérifiez les informations de connexion dans `.env`
3. Vérifiez que la base `H2OStockDB` existe
4. Si vous utilisez SQL Server Express, utilisez : `DB_SERVER=localhost\\SQLEXPRESS`

### Erreur de module 'mssql'

```bash
npm install mssql
```

### Le frontend ne charge pas les données

1. Vérifiez que le serveur backend est en cours d'exécution (`http://localhost:5000/api/health`)
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que `VITE_API_URL` est correctement configuré

## 📝 Notes Importantes

- ✅ Les données sont maintenant stockées dans SQL Server (plus de localStorage)
- ✅ Toutes les opérations sont synchronisées en temps réel
- ✅ Fallback sur localStorage si l'API n'est pas disponible
- ✅ Support complet de toutes les fonctionnalités existantes

## 🔐 Sécurité

**Pour la production :**

1. Ne commitez JAMAIS le fichier `.env`
2. Utilisez des variables d'environnement sécurisées
3. Changez `trustServerCertificate` à `false` avec des certificats valides
4. Implémentez l'authentification et l'autorisation
5. Utilisez HTTPS

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur terminal
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que SQL Server est accessible
4. Testez l'API : `http://localhost:5000/api/health`

---

**Développé avec ❤️ pour la gestion de stock de compteurs d'eau**
