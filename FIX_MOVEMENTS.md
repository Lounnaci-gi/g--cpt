# 🔧 Correction de la Table Movements

## ❌ Problème

La table `Movements` dans votre base de données H2OStockDB n'a pas toutes les colonnes requises. Les colonnes suivantes sont manquantes :
- `SourceLocation`
- `DestinationLocation`
- `Diameter`
- `ClientAddress`
- `RealizationDate`
- `OrderDate`
- `OrderIssuer`

## ✅ Solution

### Option 1 : Exécuter le script de migration (RECOMMANDÉ)

1. **Ouvrez SQL Server Management Studio (SSMS)**
2. **Connectez-vous** à votre serveur SQL Server
3. **Ouvrez le fichier** `fix_movements_table.sql`
4. **Exécutez le script** (F5 ou bouton Execute)

Le script va :
- ✅ Vérifier quelles colonnes manquent
- ✅ Ajouter uniquement les colonnes manquantes
- ✅ Afficher la structure finale de la table
- ✅ **Préserver vos données existantes**

### Option 2 : Recréer la table complète (si pas de données importantes)

Si vous n'avez pas de données importantes dans la table Movements :

1. **Ouvrez SSMS**
2. **Exécutez** :
```sql
USE H2OStockDB;
GO

DROP TABLE IF EXISTS Movements;
GO
```

3. **Puis exécutez** le fichier `database_schema.sql` pour recréer la table

## 📋 Vérification

Après avoir exécuté le script, vérifiez que la table a toutes les colonnes :

```sql
USE H2OStockDB;
GO

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Movements'
ORDER BY ORDINAL_POSITION;
```

Vous devvoir voir **17 colonnes** :
1. MovementId
2. MeterId
3. Date
4. Type
5. SourceLocation ✅
6. DestinationLocation ✅
7. SerialNumber
8. Diameter ✅
9. Details
10. ClientCode
11. ClientName
12. ClientAddress ✅
13. ClientFileNumber
14. RealizationDate ✅
15. OrderNumber
16. OrderDate ✅
17. OrderIssuer ✅

## 🚀 Redémarrer l'Application

Après avoir corrigé la table :

1. **Le serveur backend** devrait recharger automatiquement (tsx watch)
2. **Actualisez votre navigateur** (F5)
3. **Vérifiez la console** - vous devriez voir :
   ```
   ✅ Data loaded from SQL Server successfully
     - Locations: X
     - Meters: X
     - Movements: X
     - Thresholds: X
   ```

## 🐛 Si le problème persiste

Vérifiez les logs du serveur backend :

```powershell
# Voir les logs du terminal où npm run dev:server est exécuté
```

Vous devriez voir :
```
🔄 Fetched X movements
✅ Data loaded from SQL Server successfully
```

Si vous voyez toujours des erreurs SQL, contactez-moi avec le message d'erreur complet.
