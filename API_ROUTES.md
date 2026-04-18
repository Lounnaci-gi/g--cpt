# API Documentation - H2O Stock Manager

## 📋 Vue d'ensemble

**Base URL**: `http://localhost:5001/api`

Toutes les réponses sont au format JSON avec gestion d'erreurs détaillée.

---

## 🏥 Health Check

### `GET /health`
Vérifier l'état de la connexion à la base de données.

**Réponse**:
```json
{
  "status": "ok",
  "timestamp": "2026-04-18T14:30:00.000Z",
  "database": {
    "connected": true,
    "name": "H2OStockDB",
    "server": "localhost"
  }
}
```

---

## 📍 Locations (Agences & Antennes)

### `GET /locations`
Récupérer toutes les localisations.

**Réponse**:
```json
[
  {
    "id": 1,
    "name": "Agence Commerciale",
    "type": "Agence",
    "parentAgency": null,
    "createdAt": "2026-04-18T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Antenne Nord",
    "type": "Antenne",
    "parentAgency": "Agence Commerciale",
    "createdAt": "2026-04-18T10:05:00.000Z"
  }
]
```

### `POST /locations`
Créer une nouvelle localisation.

**Body**:
```json
{
  "name": "Antenne Est",
  "type": "Antenne",
  "parentAgency": "Agence Commerciale"
}
```

**Validation**:
- `name` (required): Nom unique de la localisation
- `type` (required): "Agence" ou "Antenne"
- `parentAgency` (required pour Antenne): Nom de l'agence parente

**Réponse 201**:
```json
{
  "success": true,
  "message": "Location created",
  "data": {
    "name": "Antenne Est",
    "type": "Antenne",
    "parentAgency": "Agence Commerciale"
  }
}
```

### `PUT /locations/:oldName`
Mettre à jour une localisation.

**Exemple**: `PUT /api/locations/Antenne%20Nord`

**Body**:
```json
{
  "name": "Antenne Nord-Est",
  "type": "Antenne",
  "parentAgency": "Agence Commerciale"
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Location updated",
  "data": {
    "oldName": "Antenne Nord",
    "name": "Antenne Nord-Est",
    "type": "Antenne",
    "parentAgency": "Agence Commerciale"
  }
}
```

### `DELETE /locations/:name`
Supprimer une localisation.

**Validations**:
- ❌ Impossible si des compteurs sont dans cette localisation
- ❌ Impossible si une agence a des antennes rattachées

**Réponse 400** (si compteurs présents):
```json
{
  "error": "Cannot delete location with meters",
  "details": "Impossible de supprimer : 15 compteur(s) dans cette localisation",
  "meterCount": 15
}
```

---

## 🔧 Meters (Compteurs)

### `GET /meters`
Récupérer tous les compteurs (avec filtres optionnels).

**Query Parameters** (optionnels):
- `location`: Filtrer par localisation
- `status`: Filtrer par statut (Neuf, Installé, À l'arrêt, Vendu)
- `diameter`: Filtrer par diamètre

**Exemple**: `GET /api/meters?status=Neuf&location=Agence%20Commerciale`

**Réponse**:
```json
[
  {
    "id": "uuid",
    "serialNumber": "SN123456",
    "diameter": "15/21 (DN15)",
    "type": "Volumétrique",
    "status": "Neuf",
    "location": "Agence Commerciale",
    "lastUpdate": "2026-04-18T10:00:00.000Z"
  }
]
```

### `POST /meters`
Créer un nouveau compteur.

**Body**:
```json
{
  "serialNumber": "SN789012",
  "diameter": "15/21 (DN15)",
  "type": "Volumétrique",
  "status": "Neuf",
  "location": "Agence Commerciale"
}
```

**Validation**:
- `serialNumber` (required): Doit être unique
- `diameter` (required)
- `type` (required)
- `status` (required)
- `location` (optionnel)

**Réponse 400** (si doublon):
```json
{
  "error": "Serial number already exists",
  "details": "Le numéro de série \"SN789012\" existe déjà"
}
```

---

## 🔄 Movements (Mouvements)

### `GET /movements`
Récupérer l'historique des mouvements (avec filtres).

**Query Parameters** (optionnels):
- `type`: Type de mouvement (Transfert, Pose, Vente, etc.)
- `location`: Source ou destination
- `startDate`: Date de début (ISO format)
- `endDate`: Date de fin (ISO format)

**Exemple**: `GET /api/movements?type=Transfert&startDate=2026-04-01`

**Réponse**:
```json
[
  {
    "id": "uuid",
    "meterId": "uuid",
    "date": "2026-04-18T10:00:00.000Z",
    "type": "Transfert",
    "source": "Agence Commerciale",
    "destination": "Antenne Nord",
    "serialNumber": "SN123456",
    "diameter": "15/21 (DN15)",
    "details": "Transfert de stock",
    "clientInfo": null,
    "orderInfo": null
  }
]
```

### `POST /movements`
Créer un nouveau mouvement.

**Body** (Transfert):
```json
{
  "type": "Transfert",
  "source": "Agence Commerciale",
  "destination": "Antenne Nord",
  "serialNumber": "SN123456",
  "diameter": "15/21 (DN15)",
  "details": "Transfert de stock mensuel"
}
```

**Body** (Pose avec infos client):
```json
{
  "type": "Pose",
  "source": "Agence Commerciale",
  "destination": "Client",
  "serialNumber": "SN123456",
  "diameter": "15/21 (DN15)",
  "clientInfo": {
    "code": "CLI001",
    "name": "Jean Dupont",
    "address": "123 Rue de Paris",
    "fileNumber": "DOS-2026-001",
    "realizationDate": "2026-04-18"
  }
}
```

**Body** (Réception avec infos commande):
```json
{
  "type": "Réception",
  "source": "Fournisseur",
  "destination": "Agence Commerciale",
  "serialNumber": "SN789012",
  "diameter": "15/21 (DN15)",
  "orderInfo": {
    "orderNumber": "CMD-2026-001",
    "orderDate": "2026-04-15",
    "issuer": "Directeur des Achats"
  }
}
```

---

## ⚠️ Thresholds (Seuils d'alerte)

### `GET /thresholds`
Récupérer tous les seuils d'alerte.

**Réponse**:
```json
[
  {
    "id": 1,
    "diameter": "15/21 (DN15)",
    "type": "Volumétrique",
    "minQuantity": 10
  }
]
```

### `PUT /thresholds`
Créer ou mettre à jour un seuil.

**Body**:
```json
{
  "diameter": "15/21 (DN15)",
  "type": "Volumétrique",
  "minQuantity": 15
}
```

### `DELETE /thresholds/:diameter/:type`
Supprimer un seuil.

**Exemple**: `DELETE /api/thresholds/15%2F21%20(DN15)/Volum%C3%A9trique`

---

## 📊 Statistics

### `GET /stats/dashboard`
Statistiques complètes pour le dashboard.

**Réponse**:
```json
{
  "totalMeters": 150,
  "metersByStatus": [
    { "status": "Neuf", "count": 100 },
    { "status": "Installé", "count": 35 },
    { "status": "À l'arrêt", "count": 10 },
    { "status": "Vendu", "count": 5 }
  ],
  "metersByLocation": [
    { "location": "Agence Commerciale", "type": "Agence", "count": 80 },
    { "location": "Antenne Nord", "type": "Antenne", "count": 40 }
  ],
  "metersByDiameter": [
    { "diameter": "15/21 (DN15)", "type": "Volumétrique", "count": 60 }
  ],
  "recentMovements": [
    { "type": "Transfert", "count": 12 },
    { "type": "Pose", "count": 8 }
  ],
  "lowStockAlerts": [
    {
      "diameter": "15/21 (DN15)",
      "type": "Volumétrique",
      "currentStock": 5,
      "minQuantity": 10,
      "deficit": 5
    }
  ],
  "timestamp": "2026-04-18T14:30:00.000Z"
}
```

### `GET /stats/low-stock`
Alertes de stock bas uniquement.

**Réponse**:
```json
[
  {
    "diameter": "15/21 (DN15)",
    "type": "Volumétrique",
    "currentStock": 5,
    "minQuantity": 10,
    "deficit": 5
  }
]
```

---

## 🚨 Gestion d'Erreurs

Toutes les erreurs retournent un format standard :

```json
{
  "error": "Error type",
  "details": "Description détaillée de l'erreur en français"
}
```

**Codes HTTP**:
- `200`: Succès
- `201`: Créé avec succès
- `400`: Erreur de validation
- `404`: Ressource non trouvée
- `500`: Erreur serveur

---

## 📝 Notes Importantes

### Transactions
Les opérations critiques (comme la modification du nom d'une localisation) utilisent des **transactions SQL** pour garantir la cohérence des données.

### Logs Serveur
Le serveur affiche des logs détaillés pour faciliter le debugging :
- 📍 Locations
- 📊 Meters
- 🔄 Movements
- ⚠️ Thresholds
- ✅ Succès
- ❌ Erreurs

### Encodage URL
N'oubliez pas d'encoder les paramètres URL :
- Espaces → `%20` ou `+`
- `/` → `%2F`
- É → `%C3%89`

**Exemple**: 
```
GET /api/locations/Antenne%20Nord
DELETE /api/thresholds/15%2F21%20(DN15)/Volum%C3%A9trique
```
