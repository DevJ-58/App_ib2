# Architecture API REST - Guide d'implémentation

## 📋 Résumé de l'architecture

Votre application utilise une **architecture API REST avec sessions PHP classiques**.

### Structure :
```
backend/
├── controllers/
│   └── AuthController.php (Orchestration de l'authentification)
├── models/
│   ├── User.php (Modèle utilisateur avec interactions BD)
│   └── Database.php (Connexion PDO singleton)
├── Api/Auth/
│   ├── login.php (Endpoint POST de connexion)
│   ├── register.php (Endpoint POST d'inscription)
│   ├── logout.php (Endpoint POST de déconnexion)
│   ├── check.php (Endpoint GET de vérification de session)
│   └── change-password.php (Endpoint POST de changement de mot de passe)
└── utils/
    ├── Security.php (Hachage, validation, sanitization)
    ├── Response.php (Réponses JSON standardisées)
    └── JWT.php (Pour future implémentation de JWT si nécessaire)

frontend/
├── JS/
│   ├── api-client.js (Client HTTP pour les appels API)
│   ├── auth-api.js (Fonctions d'authentification API)
│   └── main.js (Logique métier générale)
└── HTML/
    ├── connexion.html
    ├── inscription.html
    └── dashbord.html
```

---

## 🚀 Configuration requise


### 1. Database.php est déjà configuré

Le fichier `backend/models/Database.php` est configuré pour utiliser la base de données **`gestion_stock`** :

```php
private $host = 'localhost';              // Serveur MySQL (local)
private $dbName = 'gestion_stock';       // Base de données
private $username = 'root';               // Utilisateur MySQL
private $password = '';                   // Mot de passe (vide par défaut)
```

> ℹ️ **Note** : Si vos identifiants MySQL sont différents, adaptez ces valeurs.

### 2. Table `utilisateurs` déjà créée

La base de données utilise la table **`utilisateurs`** (pas `users`) avec la structure suivante :

```sql
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin','vendeur') DEFAULT 'vendeur',
    photo TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    
    INDEX idx_telephone (telephone),
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

> 💡 Le fichier complet `database/schema.sql` contient toutes les tables et les données de test.

### 3. Ajouter les scripts dans vos fichiers HTML

Dans `connexion.html` et `inscription.html`, ajoutez avant `</body>` :

```html
<!-- Charger les scripts dans l'ordre -->
<script src="../../JS/utils.js"></script>
<script src="../../JS/api-client.js"></script>
<script src="../../JS/auth-api.js"></script>
<script src="../../JS/main.js"></script>
```

---

## 🔗 Endpoints API disponibles

### Login (Connexion)
- **URL** : `/Api/Auth/login.php`
- **Méthode** : `POST`
- **Corps** :
```json
{
    "telephone": "0123456789",
    "mot_de_passe": "password123"
}
```
- **Réponse succès** :
```json
{
    "success": true,
    "code": 200,
    "message": "Connexion réussie",
    "data": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "telephone": "0123456789",
        "email": "jean@example.com",
        "role": "admin"
    }
}
```

### Register (Inscription)
- **URL** : `/Api/Auth/register.php`
- **Méthode** : `POST`
- **Corps** :
```json
{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0123456789",
    "email": "jean@example.com",
    "mot_de_passe": "Password123",
    "confirm_mot_de_passe": "Password123"
}
```

### Logout (Déconnexion)
- **URL** : `/Api/Auth/logout.php`
- **Méthode** : `POST`
- **Corps** : `{}`

### Check Session
- **URL** : `/Api/Auth/check.php`
- **Méthode** : `GET`
- **Réponse** : Données de l'utilisateur connecté ou erreur 401

### Change Password
- **URL** : `/Api/Auth/change-password.php`
- **Méthode** : `POST`
- **Corps** :
```json
{
    "old_password": "oldPassword123",
    "new_password": "newPassword123",
    "confirm_password": "newPassword123"
}
```

---

## 🎯 Utiliser l'API depuis JavaScript

### Exemple 1 : Connexion

```javascript
// Dans votre formulaire de connexion
const telephone = document.getElementById('telephone').value;
const motDePasse = document.getElementById('password').value;

const result = await seConnecter(telephone, motDePasse);
if (result.success) {
    console.log('Connecté !', utilisateurConnecte);
}
```

### Exemple 2 : Inscription

```javascript
const result = await sInscrire(
    'Dupont',
    'Jean',
    '0123456789',
    'jean@example.com',
    'Password123',
    'Password123'
);
```

### Exemple 3 : Appels API personnalisés

```javascript
// Utiliser le client API directement
const response = await api.request('/Api/Categories/list.php', {
    method: 'GET'
});

// Ou avec POST
const response = await api.request('/Api/Products/create.php', {
    method: 'POST',
    body: JSON.stringify({
        name: 'Produit',
        price: 5000
    })
});
```

---

## ✅ Avantages de cette architecture

1. **Sessions PHP côté serveur** : Plus sécurisé (le mot de passe n'est jamais envoyé au client)
2. **API REST** : Séparation frontend/backend, facilite la maintenance
3. **PDO avec prepared statements** : Protection contre les injections SQL
4. **Password hashing BCRYPT** : Sécurité des mots de passe
5. **Sanitization** : Protection contre les attaques XSS
6. **Réponses JSON standardisées** : Facilite le traitement côté client

---

## ⚠️ Prochaines étapes

1. **Vérifier que votre BD est bien configurée** et table `users` créée
2. **Adapter les chemins des fichiers** selon votre environnement
3. **Tester les endpoints** avec Postman ou votre client API
4. **Implémenter les autres modules** (Catégories, Produits, Ventes) avec la même approche
5. **Ajouter la validation côté serveur** plus robuste si nécessaire

---

## 🛠️ Fichiers créés/modifiés

✅ `backend/models/User.php` - Créé  
✅ `backend/models/Database.php` - Créé  
✅ `backend/utils/Security.php` - Créé  
✅ `backend/utils/Response.php` - Créé  
✅ `backend/controllers/AuthController.php` - Remplacé (Yii2 → API REST)  
✅ `backend/Api/Auth/login.php` - Rempli  
✅ `backend/Api/Auth/register.php` - Rempli  
✅ `backend/Api/Auth/logout.php` - Rempli  
✅ `backend/Api/Auth/check.php` - Créé  
✅ `backend/Api/Auth/change-password.php` - Créé  
✅ `frontend/JS/api-client.js` - Créé  
✅ `frontend/JS/auth-api.js` - Créé  

---

## 📚 Ressources

- [PDO PHP Documentation](https://www.php.net/manual/fr/book.pdo.php)
- [Password Hashing PHP](https://www.php.net/manual/fr/function.password-hash.php)
- [Fetch API JavaScript](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
