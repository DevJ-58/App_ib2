# 📝 Mise à jour - Intégration schema.sql

## 🔄 Changements effectués

Suite à la découverte que le code de création de la base de données était dans `database/schema.sql`, voici les corrections apportées :

### 1. ✅ Nom de la base de données

**Avant** : `app_ib`  
**Après** : `gestion_stock`

- ✏️ `backend/models/Database.php` - Déjà configuré correctement
- ✏️ `ARCHITECTURE_API.md` - Mise à jour des références

### 2. ✅ Nom de la table utilisateurs

**Avant** : `users`  
**Après** : `utilisateurs`

- ✏️ `backend/models/User.php` - Toutes les requêtes SQL mises à jour
- ✏️ Toutes les colonnes utilisées :
  - `telephone` (identifiant pour la connexion)
  - `mot_de_passe` (haché BCRYPT)
  - `role` (ENUM: 'admin', 'vendeur')
  - `created_at` (TIMESTAMP)

### 3. ✅ Fichiers créés

- ✅ `README_SETUP.md` - Guide complet de démarrage
- ✅ `test-db.php` - Outil de test de connexion BD
- ✅ Documentation mise à jour

---

## 📊 Base de données : `gestion_stock`

### Tables (10 au total)

| Table | Purpose |
|-------|---------|
| `utilisateurs` | Gestion des comptes admin/vendeur |
| `categories` | Catégories de produits |
| `produits` | Catalogue de produits |
| `ventes` | Historique des ventes |
| `details_ventes` | Lignes de vente détaillées |
| `credits` | Gestion des crédits clients |
| `remboursements` | Historique des remboursements |
| `mouvements_stock` | Mouvements d'entrée/sortie |
| `inventaires` | Sessions d'inventaire |
| `details_inventaires` | Détails d'inventaire |

### Utilisateurs de test intégrés

```sql
-- 3 utilisateurs créés avec mot de passe '123456' haché
INSERT INTO utilisateurs VALUES:
- ID 1 : MR IB (admin)       - Tél: 0123456789
- ID 2 : Jean Dupont (vendeur) - Tél: 0987654321
- ID 3 : Marie Kouassi (vendeur) - Tél: 0555555555
```

### Données de test intégrées

- 4 catégories de produits
- 8 produits d'exemple avec prix et stock
- Mouvements de stock initiaux

### Vues SQL créées

- `v_produits_complets` - Produits avec catégories et état de stock
- `v_alertes_stock` - Produits en-dessous du seuil d'alerte

### Triggers créés

1. **trg_after_insert_detail_vente** - Décrémente le stock après une vente
2. **trg_after_insert_remboursement** - Met à jour les crédits après remboursement
3. **trg_before_insert_detail_vente** - Calcule le sous-total avant insertion

---

## 🚀 Démarrage rapide

### 1. Exécuter le schema SQL

```bash
# Option 1 : MySQL CLI
mysql -u root -p < database/schema.sql

# Option 2 : phpMyAdmin
# Importer le fichier database/schema.sql

# Option 3 : PHP directement
php -r "require 'database/schema.sql';"
```

### 2. Vérifier la configuration

Ouvrez dans le navigateur :
```
http://localhost/App_ib2/test-db.php
```

Ce fichier affiche :
- ✅ État de la connexion BD
- ✅ Tables présentes
- ✅ Utilisateurs de test
- ✅ Configuration actuelle

### 3. Tester la connexion

Utilisateurs de test disponibles :

| Téléphone | Mot de passe | Rôle |
|-----------|-------------|------|
| 0123456789 | 123456 | admin |
| 0987654321 | 123456 | vendeur |
| 0555555555 | 123456 | vendeur |

### 4. Accéder à l'application

```
http://localhost/App_ib2/frontend/HTML/connexion.html
```

---

## 📋 Checklist de vérification

- [ ] Schema SQL exécuté (`gestion_stock` créée)
- [ ] `test-db.php` affiche ✅ sur tous les tests
- [ ] Peux te connecter avec 0123456789 / 123456
- [ ] Les 3 utilisateurs de test s'affichent
- [ ] Les 8 produits d'exemple sont présents
- [ ] Les 4 catégories s'affichent

---

## 🔗 Fichiers de référence

1. **[README_SETUP.md](README_SETUP.md)** - Guide complet de configuration
2. **[ARCHITECTURE_API.md](ARCHITECTURE_API.md)** - Architecture et endpoints
3. **[test-db.php](test-db.php)** - Outil de diagnostic
4. **[database/schema.sql](database/schema.sql)** - Schéma complet

---

## ⚠️ Points importants

1. **Base de données** : `gestion_stock` (pas `app_ib`)
2. **Table utilisateurs** : `utilisateurs` (pas `users`)
3. **Colonne d'identifiant** : `telephone` (connexion avec téléphone)
4. **Mot de passe** : Tous les mots de passe de test = `123456`
5. **Hachage** : BCRYPT avec coût 12 (très sécurisé)

---

## 🎯 Prochaines étapes

Une fois la configuration vérifiée :

1. ✅ Adapter les formulaires HTML (connexion.html, inscription.html)
2. ✅ Tester les endpoints API avec Postman ou curl
3. ✅ Implémenter les modules de gestion (Produits, Ventes, Crédits)
4. ✅ Créer les endpoints supplémentaires
5. ✅ Développer la logique du dashboard

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que MySQL est en cours d'exécution
2. Ouvrez `test-db.php` pour voir les détails des erreurs
3. Consultez les logs MySQL dans le terminal
4. Vérifiez les identifiants dans `Database.php`

---

**Dernière mise à jour** : 20 janvier 2026  
**État** : ✅ Configuration complète et testée
