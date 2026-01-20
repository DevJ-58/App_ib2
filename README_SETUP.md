# 🚀 Guide de démarrage - APP IB

## 📋 Configuration initiale

### 1️⃣ Créer la base de données

Exécutez le fichier SQL pour créer la base de données et toutes les tables :

**Option 1 : Avec phpMyAdmin**
1. Ouvrez phpMyAdmin
2. Allez dans l'onglet "Importer"
3. Sélectionnez le fichier `database/schema.sql`
4. Cliquez sur "Exécuter"

**Option 2 : Ligne de commande MySQL**
```bash
mysql -u root -p < database/schema.sql
```

**Option 3 : Avec PHP CLI**
```bash
php -r "include 'database/schema.sql';" | mysql -u root -p
```

> ✅ Après cette étape, la base de données `gestion_stock` est créée avec :
> - 10 tables (utilisateurs, produits, ventes, crédits, mouvements, etc.)
> - 3 utilisateurs de test
> - 8 produits d'exemple
> - Vues SQL pour les alertes stock
> - Triggers pour les mises à jour automatiques

---

### 2️⃣ Vérifier les identifiants MySQL

Ouvrez `backend/models/Database.php` et vérifiez :

```php
private $host = 'localhost';        // Votre serveur
private $dbName = 'gestion_stock';  // Base de données
private $username = 'root';         // Utilisateur
private $password = '';             // Mot de passe
```

> 💡 Si vos identifiants sont différents, adaptez ces valeurs.

---

### 3️⃣ Tester la connexion

Créez un fichier `test-db.php` à la racine et testez :

```php
<?php
require 'backend/models/Database.php';

use backend\models\Database;

try {
    $db = Database::getInstance();
    $result = $db->select("SELECT COUNT(*) as count FROM utilisateurs");
    echo "✅ Connexion réussie ! Nombre d'utilisateurs : " . $result[0]['count'];
} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage();
}
?>
```

Ouvrez dans le navigateur : `http://localhost/App_ib2/test-db.php`

---

## 👥 Utilisateurs de test

Après l'import du schema.sql, vous avez 3 utilisateurs :

| Téléphone | Mot de passe | Rôle |
|-----------|-------------|------|
| `0123456789` | `123456` | admin |
| `0987654321` | `123456` | vendeur |
| `0555555555` | `123456` | vendeur |

**Pour vous connecter** :
1. Ouvrez `http://localhost/App_ib2/frontend/HTML/connexion.html`
2. Téléphone : `0123456789`
3. Mot de passe : `123456`

---

## 📁 Structure du projet

```
APP_IB/
├── backend/
│   ├── models/          # Modèles (User, Database, etc.)
│   ├── controllers/     # Contrôleurs (AuthController)
│   ├── Api/             # Endpoints REST
│   │   └── Auth/        # login.php, register.php, logout.php, etc.
│   └── utils/           # Utilitaires (Security, Response, JWT)
│
├── frontend/
│   ├── HTML/            # Pages HTML
│   ├── CSS/             # Feuilles de style
│   ├── JS/
│   │   ├── api-client.js    # Client HTTP
│   │   ├── auth-api.js      # Fonctions d'authentification
│   │   ├── utils.js         # Utilitaires générales
│   │   └── main.js          # Logique métier
│   └── assets/          # Images, icônes, etc.
│
├── database/
│   └── schema.sql       # Schéma complet de la BD
│
├── ARCHITECTURE_API.md       # Documentation architecture
├── GUIDE_INTEGRATION_HTML.md # Guide HTML/formulaires
└── STRUCTURE_BASE_DONNEES.md # Documentation BD
```

---

## 🔌 API Endpoints

### Authentification

```
POST /Api/Auth/login.php           # Connexion
POST /Api/Auth/register.php        # Inscription
POST /Api/Auth/logout.php          # Déconnexion
GET  /Api/Auth/check.php           # Vérifier session
POST /Api/Auth/change-password.php # Changer mot de passe
```

---

## 📊 Tables principales

### `utilisateurs` - Gestion des comptes
- id, nom, prenom, telephone, email, mot_de_passe, role, photo, actif, created_at

### `categories` - Catégories de produits
- id, nom, actif

### `produits` - Catalogue
- id, code_barre, nom, categorie_id, prix_vente, stock, seuil_alerte, icone, photo, actif

### `ventes` - Historique des ventes
- id, numero_vente, client_nom, date_vente, total, type_paiement, utilisateur_id

### `credits` - Gestion des crédits clients
- id, reference, vente_id, client_nom, montant_total, montant_paye, montant_restant, statut

### `mouvements_stock` - Historique des mouvements
- id, produit_id, type (entree/sortie/ajustement), quantite, date_mouvement, utilisateur_id

---

## 🧪 Exemple d'utilisation

### Depuis JavaScript

```javascript
// 1. Initialiser
await initialiserAuthentification();

// 2. Se connecter
const result = await seConnecter('0123456789', '123456');

// 3. Vérifier l'authentification
if (estAuthentifie()) {
    console.log('Connecté !', getUtilisateurConnecte());
}

// 4. Se déconnecter
await deconnecterUtilisateur();
```

### Depuis PHP/Backend

```php
<?php
require 'backend/models/User.php';
use backend\models\User;

$userModel = new User();

// Vérifier les identifiants
$result = $userModel->verifierIdentifiants('0123456789', '123456');
if ($result['success']) {
    echo "Utilisateur : " . $result['user']['prenom'] . " " . $result['user']['nom'];
}

// Créer un nouvel utilisateur
$newUser = $userModel->create([
    'nom' => 'Dupont',
    'prenom' => 'Jean',
    'telephone' => '0111111111',
    'email' => 'jean@example.com',
    'mot_de_passe' => 'SecurePass123',
    'role' => 'vendeur'
]);

// Récupérer un utilisateur
$user = $userModel->getById(1);
?>
```

---

## ⚡ Fonctionnalités implémentées

✅ **Authentification**
- Connexion avec session PHP
- Inscription avec validation
- Déconnexion
- Vérification de session

✅ **Sécurité**
- Mots de passe hachés BCRYPT
- Protection SQL injection (prepared statements)
- Protection XSS (sanitization)
- Logging des événements de sécurité

✅ **API REST**
- Endpoints JSON standardisés
- Gestion d'erreurs cohérente
- Support de la pagination
- CORS activé

✅ **Base de données**
- 10 tables avec relations
- Triggers pour la gestion automatique
- Vues SQL pour les alertes
- Index pour les performances

---

## 🔧 Dépannage

### Erreur : "Base de données non trouvée"
```
Solution : Exécutez le schema.sql pour créer la BD
```

### Erreur : "SQLSTATE[HY000]: General error: 1030"
```
Solution : Vérifiez les identifiants MySQL dans Database.php
```

### Erreur : "Undefined variable: utilisateurConnecte"
```
Solution : Assurez-vous que auth-api.js est chargé avant main.js
```

### Impossible de se connecter
```
Solutions possibles :
1. Vérifier que schema.sql a été exécuté
2. Tester avec le téléphone "0123456789" et mot de passe "123456"
3. Vérifier la configuration de Database.php
4. Activer les logs PHP pour voir les erreurs
```

---

## 📚 Documentation supplémentaire

Consultez aussi :
- [ARCHITECTURE_API.md](ARCHITECTURE_API.md) - Guide complet de l'architecture
- [GUIDE_INTEGRATION_HTML.md](GUIDE_INTEGRATION_HTML.md) - Intégration des formulaires
- [STRUCTURE_BASE_DONNEES.md](STRUCTURE_BASE_DONNEES.md) - Détails des tables

---

## ✅ Checklist de configuration

- [ ] Exécuter schema.sql pour créer la BD
- [ ] Vérifier Database.php avec les identifiants MySQL
- [ ] Tester la connexion avec le fichier test-db.php
- [ ] Ouvrir connexion.html et tester la login
- [ ] Tester l'inscription
- [ ] Vérifier que le dashboard se charge après la connexion
- [ ] Tester la déconnexion

---

## 🚀 Prochaines étapes

Après cette configuration initiale, vous pouvez :

1. **Adapter les modules de gestion** (Catégories, Produits, etc.) avec la même approche API REST
2. **Créer des endpoints supplémentaires** pour les ventes, crédits, etc.
3. **Implémenter la logique métier** du dashboard
4. **Ajouter les filtres et la recherche**
5. **Déployer en production**

Bon développement ! 🎉
