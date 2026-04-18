# 🌊 H2O Stock - Gestion Intelligente de Stock

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06b6d4.svg)

**Solution moderne de gestion de stock pour compteurs d'eau**

[ Fonctionnalités ] • [ Installation ] • [ Configuration ] • [ Utilisation ] • [ Documentation ]

</div>

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Architecture](#-architecture)
- [Design & Thème](#-design--thème)
- [Responsive Design](#-responsive-design)
- [Base de Données](#-base-de-données)
- [API Endpoints](#-api-endpoints)
- [Structure du Projet](#-structure-du-projet)
- [Dépannage](#-dépannage)
- [Licence](#-licence)

---

## 🎯 Vue d'ensemble

**H2O Stock** est une application web moderne et complète pour la gestion de stock de compteurs d'eau. Elle offre une interface utilisateur élégante, une base de données SQL Server robuste et des fonctionnalités avancées de suivi en temps réel.

### Points Forts
- ✅ **Interface moderne** avec police Poppins et effets visuels avancés
- ✅ **100% Responsive** - Mobile, Tablet, Desktop
- ✅ **Base de données SQL Server** avec connexion temps réel
- ✅ **8 palettes de couleurs** vibrantes et harmonieuses
- ✅ **Animations fluides** et effets glassmorphism
- ✅ **Footer professionnel** avec newsletter

---

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Statistiques en temps réel
- Graphiques interactifs (Recharts)
- Alertes de stock bas
- Configuration des seuils d'alerte

### 📦 Gestion d'Inventaire
- Liste complète des compteurs
- Filtrage et recherche
- Suivi par diamètre et type
- Statuts : Neuf, Installé, À l'arrêt, Vendu

### 📥 Réception de Stock
- Ajout de nouveaux compteurs
- Numéros de série
- Bons de commande
- Validation avec confirmation

### 🔄 Transferts
- Transferts entre localisations
- Historique des mouvements
- Traçabilité complète

### 🏗️ Terrain
- Pose de compteurs
- Remplacement
- Ventes
- Informations clients

### 📈 Reporting
- Rapports détaillés
- Export de données
- Analyses par période

### ⚙️ Paramètres
- Gestion des agences/antennes
- Configuration des seuils
- Confirmation avec SweetAlert2
- Mise à jour en temps réel

---

## 🛠️ Technologies Utilisées

### Frontend
- **React 19.0** - Bibliothèque UI
- **TypeScript 5.8** - Typage statique
- **Vite 6.2** - Build tool ultra-rapide
- **Tailwind CSS 4.1** - Framework CSS
- **Recharts 3.8** - Graphiques
- **Lucide React** - Icônes modernes
- **Motion 12.23** - Animations
- **SweetAlert2** - Alertes professionnelles
- **Date-fns** - Manipulation de dates

### Backend
- **Express 4.21** - Serveur Node.js
- **MSSQL 12.3** - Driver SQL Server
- **CORS** - Gestion des requêtes cross-origin
- **Dotenv** - Variables d'environnement

### Police & Design
- **Poppins** - Police principale (Google Fonts)
- **JetBrains Mono** - Police monospace
- **Glassmorphism** - Effets de verre
- **Gradients** - Dégradés modernes

---

## 📦 Installation

### Prérequis
- **Node.js** >= 20.x
- **SQL Server** (localhost ou distant)
- **npm** ou **yarn**

### Étapes

```bash
# 1. Cloner le repository
git clone <repository-url>
cd g--cpt

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos informations
```

---

## ⚙️ Configuration

### Fichier `.env`

```env
# Base de données
DB_SERVER=localhost
DB_NAME=H2OStockDB
DB_USER=lounnaci
DB_PASSWORD=hyhwarez
DB_PORT=1433

# Serveur
PORT=5001

# API Keys (optionnel)
GEMINI_API_KEY=votre_cle_api
APP_URL=http://localhost:3000
```

### Configuration SQL Server

1. **Créer la base de données** :
```bash
sqlcmd -S localhost -U lounnaci -P hyhwarez -i database_schema.sql
```

2. **Vérifier la connexion** :
```bash
# Tester l'API
curl http://localhost:5001/api/health
```

---

## 🚀 Démarrage

### Option 1: Frontend + Backend simultanément (Recommandé)
```bash
npm run dev:all
```

### Option 2: Séparément
```bash
# Terminal 1 - Backend (Port 5001)
npm run dev:server

# Terminal 2 - Frontend (Port 3000)
npm run dev
```

### Accès
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001/api
- **Health Check** : http://localhost:5001/api/health

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         APPLICATION REACT               │
│   (http://localhost:3000)               │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Layout (Navigation + Footer) │     │
│  └───────────────────────────────┘     │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Pages:                       │     │
│  │  - Dashboard                  │     │
│  │  - Inventory                  │     │
│  │  - Reception                  │     │
│  │  - Transfer                   │     │
│  │  - Field                      │     │
│  │  - Reporting                  │     │
│  │  - Settings                   │     │
│  └───────────────────────────────┘     │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  StockContext (State Mgmt)    │     │
│  └───────────────────────────────┘     │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/Fetch
               │
               ▼
┌─────────────────────────────────────────┐
│         API EXPRESS                     │
│   (http://localhost:5001/api)           │
│                                         │
│  Routes:                                │
│  - /api/locations                       │
│  - /api/meters                          │
│  - /api/movements                       │
│  - /api/thresholds                      │
│  - /api/health                          │
└──────────────┬──────────────────────────┘
               │
               │ mssql (TDS Protocol)
               │
               ▼
┌─────────────────────────────────────────┐
│      SQL SERVER                         │
│   Server: localhost                     │
│   Database: H2OStockDB                  │
│   User: lounnaci                        │
│                                         │
│   Tables:                               │
│   - Locations                           │
│   - Meters                              │
│   - Movements                           │
│   - Thresholds                          │
└─────────────────────────────────────────┘
```

---

## 🎨 Design & Thème

### Palette de Couleurs

Le projet dispose de **8 palettes vibrantes** :

| Couleur | Usage | Exemple |
|---------|-------|---------|
| 💙 **Primary** (Indigo) | Navigation, actions principales | `#6366f1` |
| 💜 **Secondary** (Purple) | Éléments secondaires | `#a855f7` |
| 💚 **Accent** (Teal) | Compléments, highlights | `#14b8a6` |
| 🌺 **Coral** | Alertes chaudes, CTA | `#f43f5e` |
| 🌤️ **Sky** (Bleu) | Informations, liens | `#0ea5e9` |
| 🌟 **Amber** (Or) | Avertissements, premium | `#f59e0b` |
| 🌿 **Emerald** (Vert) | Succès, validation | `#10b981` |
| 🌹 **Rose** | Favoris, accents doux | `#f43f5e` |

### Dégradés Disponibles

```tsx
primary-gradient    // Indigo vibrant
secondary-gradient  // Purple élégant
accent-gradient     // Teal frais
coral-gradient      // Rose chaleureux
sky-gradient        // Bleu ciel
amber-gradient      // Or lumineux
emerald-gradient    // Vert naturel
rose-gradient       // Rose doux
rainbow-gradient    // 🌈 Arc-en-ciel
```

### Effets Visuels

- ✨ **Glassmorphism** - Effet de verre dépoli
- 🌟 **Shimmer** - Animation de brillance
- 💫 **Float** - Flottement fluide
- ✨ **Glow** - Pulsation lumineuse
- 🎭 **Hover Effects** - Animations au survol
- 🌈 **Gradients** - Dégradés multicouches

### Composants de Style

```tsx
// Cartes
<div className="modern-card p-6 rounded-2xl">...</div>
<div className="elevated-card p-6 rounded-2xl">...</div>
<div className="glass-effect p-6 rounded-2xl">...</div>

// Boutons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-accent">Accent</button>

// Inputs
<input className="input-modern" />

// Badges
<span className="badge-primary">Primary</span>
<span className="badge-success">Succès</span>
<span className="badge-warning">Attention</span>
<span className="badge-error">Erreur</span>
```

---

## 📱 Responsive Design

### Breakpoints

| Préfixe | Largeur | Périphérique |
|---------|---------|--------------|
| (aucun) | < 640px | 📱 Mobile portrait |
| `sm:` | ≥ 640px | 📱 Mobile paysage |
| `md:` | ≥ 768px | 📱 Tablette |
| `lg:` | ≥ 1024px | 💻 Laptop |
| `xl:` | ≥ 1280px | 🖥️ Desktop |

### Exemples d'Utilisation

```tsx
// Grille responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {cards}
</div>

// Texte adaptatif
<h2 className="text-2xl sm:text-3xl lg:text-4xl">Titre</h2>

// Espacement progressif
<div className="space-y-6 sm:space-y-8 lg:space-y-10">
  {sections}
</div>
```

### Navigation Responsive

- **Desktop** : Sidebar fixe à gauche
- **Mobile** : Barre en haut + menu hamburger

---

## 🗄️ Base de Données

### Schéma

```sql
Locations
├── LocationId (PK)
├── Name
├── Type (Agence/Antenne)
└── ParentAgencyId (FK)

Meters
├── MeterId (PK)
├── SerialNumber
├── Diameter
├── Type
├── Status
├── LocationId (FK)
└── ClientInfo (JSON)

Movements
├── MovementId (PK)
├── MeterId (FK)
├── Type
├── Source
├── Destination
├── Quantity
└── Date

Thresholds
├── ThresholdId (PK)
├── Diameter
├── Type
└── MinQuantity
```

### Connexion

L'indicateur de connexion en temps réel affiche :
- 🟢 **Vert** : Connecté à SQL Server
- 🔴 **Rouge** : Déconnecté
- Vérification automatique toutes les 30s

---

## 🔌 API Endpoints

### Locations
```
GET    /api/locations          # Récupérer toutes les localisations
POST   /api/locations          # Créer une localisation
PUT    /api/locations/:name    # Modifier une localisation
```

### Meters
```
GET    /api/meters             # Récupérer tous les compteurs
POST   /api/meters             # Créer un compteur
PUT    /api/meters/:id         # Modifier un compteur
```

### Movements
```
GET    /api/movements          # Récupérer les mouvements
POST   /api/movements          # Enregistrer un mouvement
```

### Thresholds
```
GET    /api/thresholds         # Récupérer les seuils
PUT    /api/thresholds         # Mettre à jour un seuil
```

### Health
```
GET    /api/health             # Vérifier la connexion BDD
```

---

## 📁 Structure du Projet

```
g--cpt/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx         # Tableau de bord
│   │   ├── Inventory.tsx         # Inventaire
│   │   ├── Reception.tsx         # Réception stock
│   │   ├── Transfer.tsx          # Transferts
│   │   ├── Field.tsx             # Terrain
│   │   ├── Reporting.tsx         # Reporting
│   │   ├── Settings.tsx          # Paramètres
│   │   ├── Layout.tsx            # Layout principal
│   │   ├── Footer.tsx            # Footer
│   │   └── DatabaseIndicator.tsx # Indicateur BDD
│   ├── context/
│   │   └── StockContext.tsx      # State management
│   ├── server/
│   │   ├── db.ts                 # Connexion SQL Server
│   │   ├── routes.ts             # API routes
│   │   └── server.ts             # Serveur Express
│   ├── lib/
│   │   └── utils.ts              # Utilitaires
│   ├── App.tsx                   # Component principal
│   ├── types.ts                  # Types TypeScript
│   ├── constants.ts              # Constantes
│   ├── index.css                 # Styles globaux
│   └── main.tsx                  # Point d'entrée
├── .env                          # Variables d'environnement
├── tailwind.config.js            # Configuration Tailwind
├── vite.config.ts                # Configuration Vite
├── tsconfig.json                 # Configuration TypeScript
├── package.json                  # Dépendances
└── database_schema.sql           # Schéma BDD
```

---

## 🐛 Dépannage

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| Indicateur BDD rouge | Vérifier que `npm run dev:server` tourne |
| Erreur CORS | Vérifier le port dans `.env` (5001) |
| Données non chargées | Tester `http://localhost:5001/api/health` |
| SQL Server inaccessible | Vérifier le service SQL Server |
| Port occupé | Changer `PORT` dans `.env` |
| Erreur de build | Supprimer `node_modules` et réinstaller |

### Commandes Utiles

```bash
# Vérifier la santé de l'API
curl http://localhost:5001/api/health

# Tester la connexion BDD
npm run dev:server

# Voir les logs
npm run dev:all

# Clean et reinstall
rm -rf node_modules
npm install
```

---

## 📚 Scripts npm

```bash
npm run dev          # Frontend uniquement (port 3000)
npm run dev:server   # Backend uniquement (port 5001)
npm run dev:all      # Frontend + Backend simultanément
npm run build        # Build de production
npm run preview      # Preview du build
npm run start:server # Démarrer le serveur en production
npm run lint         # Vérification TypeScript
npm run clean        # Supprimer le dossier dist
```

---

## 🔒 Sécurité

### Bonnes Pratiques
- ✅ Ne jamais commiter `.env`
- ✅ Utiliser des variables d'environnement
- ✅ Valider les inputs côté serveur
- ✅ Utiliser des requêtes paramétrées (SQL injection prevention)

### Production
- Changer `trustServerCertificate` à `false`
- Utiliser HTTPS
- Implémenter l'authentification
- Activer les logs d'audit

---

## 🚀 Prochaines Étapes

- [ ] Authentification utilisateur (JWT)
- [ ] Export Excel/PDF des rapports
- [ ] Notifications temps réel
- [ ] Application mobile (React Native)
- [ ] Backup automatique BDD
- [ ] Dashboard admin avancé
- [ ] Multi-tenancy

---

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

## 👥 Support

Pour toute question ou problème :
- 📧 Email : contact@h2ostock.com
- 📱 Téléphone : +33 1 23 45 67 89
- 🌐 Site : https://h2ostock.com

---

<div align="center">

**Fait avec ❤️ par l'équipe H2O Stock**

© 2024 H2O Stock - Tous droits réservés

</div>
