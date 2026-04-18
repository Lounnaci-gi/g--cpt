# 🎯 Guide Rapide - Indicateur de Connexion BDD

## 📍 Où trouver l'indicateur ?

### 💻 Sur Desktop
Regardez en **bas de la barre latérale gauche**, sous le copyright :

```
┌─────────────────────────┐
│  📊 Tableau de Bord     │
│  📦 Inventaire          │
│  📥 Réception Stock     │
│  🔄 Transferts          │
│  👷 Terrain             │
│  📈 Reporting           │
│  ⚙️  Paramètres          │
│                         │
│  © 2024 Gestion Stock   │
│                         │
│  ┌───────────────────┐  │ ← ICI !
│  │ 📶🗄️ Connecté     │  │
│  │ H2OStockDB@local  │  │
│  └───────────────────┘  │
│  🔄  14:30:25           │
└─────────────────────────┘
```

### 📱 Sur Mobile
Regardez en **haut à droite** dans la barre de navigation :

```
┌─────────────────────────────────┐
│ 💧 H2O Stock  [📶🗄️] [☰]      │ ← ICI !
└─────────────────────────────────┘
```

---

## 🎨 Signification des Couleurs

### 🟢 VERT = Connecté ✅
```
┌─────────────────────────────┐
│ 📶 🗄️  Connecté             │
│    H2OStockDB @ localhost   │
└─────────────────────────────┘
```
**Signification :**
- ✅ SQL Server est accessible
- ✅ La base H2OStockDB est ouverte
- ✅ Les données sont synchronisées
- ✅ Toutes les opérations sont sauvegardées

### 🔴 ROUGE = Déconnecté ❌
```
┌─────────────────────────────┐
│ 📴 🗄️  Déconnecté           │
│    H2OStockDB @ localhost   │
└─────────────────────────────┘
```
**Signification :**
- ❌ SQL Server est inaccessible
- ⚠️ L'application utilise le fallback localStorage
- ⚠️ Les nouvelles données ne sont pas dans la BDD
- 🔧 Vérifiez que le serveur backend tourne

### 🟡 JAUNE/GRIS = En cours de chargement ⏳
```
┌─────────────────────────────┐
│ 🔄 Connexion...             │
└─────────────────────────────┘
```
**Signification :**
- ⏳ Vérification en cours
- 🔄 Actualisation automatique
- ⏱️ Patientez quelques secondes

---

## 🔄 Bouton de Refresh

À côté de l'indicateur, il y a un **bouton circulaire avec une flèche** 🔄

**Cliquer dessus pour :**
- 🔍 Vérifier immédiatement la connexion
- 🔄 Forcer une actualisation
- ⚡ Obtenir le statut en temps réel

**L'heure sous l'indicateur** montre quand la dernière vérification a eu lieu.

---

## ⚙️ Comment ça marche ?

### Vérification Automatique
- ⏰ Toutes les **30 secondes**, l'application vérifie la connexion
- 📡 Appelle l'endpoint `/api/health`
- 🎨 Met à jour l'indicateur visuel

### Vérification Manuelle
- 🖱️ Cliquez sur le bouton 🔄
- ⚡ Résultat immédiat
- 🔄 Mise à jour de l'horodatage

### Fallback Intelligent
Si la BDD est inaccessible :
1. ⚠️ L'indicateur passe au rouge
2. 💾 L'application utilise localStorage
3. 🔄 Elle réessaie automatiquement
4. ✅ Quand la BDD revient, elle resynchronise

---

## 🐛 Résolution de Problèmes

### L'indicateur est ROUGE 🔴

**Étape 1 : Vérifier le serveur backend**
```bash
# Le serveur doit tourner sur le port 5000
# Dans un terminal, vous devriez voir :
# 🚀 Server running on http://localhost:5000
# ✅ Connected to SQL Server Database
```

**Étape 2 : Tester l'API**
```bash
# Ouvrez dans votre navigateur :
http://localhost:5000/api/health

# Vous devriez voir :
# {"status":"ok","database":{"connected":true,...}}
```

**Étape 3 : Vérifier SQL Server**
```powershell
# PowerShell - Vérifier que SQL Server tourne
Get-Service -Name "MSSQL*"

# Le statut doit être "Running"
```

**Étape 4 : Redémarrer le serveur**
```bash
# Arrêter (Ctrl+C) puis relancer :
npm run dev:server
```

### L'indicateur ne s'affiche pas

**Vérifier la console du navigateur (F12) :**
- Erreurs JavaScript ?
- Erreurs CORS ?
- Erreurs réseau ?

**Solutions :**
1. Refresh la page (F5)
2. Vider le cache du navigateur
3. Vérifier que les deux serveurs tournent

### L'indicateur clignote

C'est normal pendant le chargement initial. Après quelques secondes, il devrait se stabiliser.

---

## 📊 Exemple de Scénarios

### ✅ Scénario Normal
```
1. Vous lancez l'app
2. L'indicateur montre "Connexion..." (jaune)
3. Après 2-3 secondes → "Connecté" (vert)
4. Toutes les 30s, il vérifie (silencieusement)
5. Tout fonctionne parfaitement ✨
```

### ⚠️ Perte de Connexion
```
1. L'indicateur est vert ✅
2. SQL Server s'arrête
3. Après max 30s → l'indicateur passe rouge ❌
4. L'app continue avec localStorage
5. Vous redémarrez SQL Server
6. Après max 30s → l'indicate redevient vert ✅
```

### 🔄 Reconnexion Manuelle
```
1. L'indicateur est rouge ❌
2. Vous corrigez le problème
3. Vous cliquez sur 🔄
4. L'indicateur passe vert ✅ immédiatement
```

---

## 💡 Astuces

1. **Surveiller la BDD** : Gardez un œil sur l'indicateur pendant que vous travaillez
2. **Refresh avant action importante** : Cliquez sur 🔄 avant de faire un transfert important
3. **Heure de vérification** : Si l'heure ne change pas, la vérification est bloquée
4. **Tooltip** : Survolez l'indicateur pour plus de détails

---

## 🎯 En Résumé

| État | Couleur | Action |
|------|---------|--------|
| ✅ Connecté | 🟢 Vert | Continuez à travailler normalement |
| ❌ Déconnecté | 🔴 Rouge | Vérifiez le serveur backend |
| ⏳ Chargement | 🟡 Jaune | Patientez quelques secondes |
| 🔄 Refresh | Bouton 🔄 | Cliquez pour vérifier maintenant |

---

**L'indicateur de connexion vous donne une visibilité totale sur l'état de votre base de données en temps réel !** 🎉
