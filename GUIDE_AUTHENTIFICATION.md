# 🔐 Guide de Configuration de l'Authentification

## 📋 Vérification et Corrections Effectuées

### ✅ Backend (PHP)

1. **Configuration CORS** (`backend/configs/cors.php`)
   - Gestion des headers CORS
   - Support des requêtes cross-origin
   - Gestion des requêtes OPTIONS (preflight)

2. **Configuration Base de Données** (`backend/configs/database.php`)
   - Connexion PDO
   - Constantes de configuration

3. **Bootstrap** (`backend/bootstrap.php`)
   - Initialisation des configurations
   - Configuration CORS
   - Gestion des sessions

4. **Endpoints d'Authentification** (`backend/Api/Auth/`)
   - `login.php` ✓ - Connexion avec vérification des identifiants
   - `register.php` ✓ - Inscription avec validation
   - `check.php` ✓ - Vérification de session active
   - `logout.php` ✓ - Déconnexion et destruction de session
   - `change-password.php` ✓ - Changement de mot de passe
   - `reset-password.php` ✓ - Réinitialisation de mot de passe

### ✅ Frontend (JavaScript)

1. **API Client** (`frontend/JS/api-client.js`)
   - Classe `APIClient` pour les appels REST
   - Gestion centralisée des requêtes HTTP
   - Support des credentials (cookies de session)

2. **Authentification** (`frontend/JS/auth-api.js`)
   - Fonctions d'authentification via API REST
   - Gestion de l'utilisateur connecté
   - Notifications utilisateur

3. **Main.js** (`frontend/JS/main.js`)
   - Initialisation du système
   - Gestion des formulaires
   - Redirection sécurisée

4. **Pages HTML**
   - `connexion.html` - Formulaire de connexion
   - `inscription.html` - Formulaire d'inscription
   - `dashbord.html` - Dashboard protégé
   - **Ordre des scripts** : utils → api-client → auth-api → main

## 🚀 Configuration

### 1. Base de Données

Modifiez les constantes dans `backend/bootstrap.php` :

```php
define('DB_HOST', 'localhost');     // Votre serveur MySQL
define('DB_PORT', 3306);             // Port MySQL
define('DB_NAME', 'app_ib');         // Nom de la base
define('DB_USER', 'root');           // Utilisateur MySQL
define('DB_PASSWORD', '');           // Mot de passe
```

### 2. URL de l'API

Vérifiez que le chemin dans `frontend/JS/api-client.js` correspond à votre installation :

```javascript
constructor(baseURL = 'http://localhost/APP_IB/backend')
```

Adaptez selon votre URL locale :
- `http://localhost/APP_IB/backend` (si dans WAMP root)
- `http://127.0.0.1:8000/backend` (si serveur local différent)
- Etc.

### 3. Sessions PHP

Assurez-vous que les sessions sont bien configurées dans `backend/bootstrap.php`.

## 🧪 Tests

### Test 1 : Vérifier la connexion à la base de données

Créez un fichier test dans `backend/test-db.php` (déjà présent).

### Test 2 : Vérifier CORS

Testez une requête preflight OPTIONS vers `/Api/Auth/login.php`.

### Test 3 : Inscription et Connexion

1. Accédez à `http://localhost/APP_IB/frontend/HTML/inscription.html`
2. Complétez le formulaire
3. Vous devez être redirigé vers le dashboard

### Test 4 : Vérification de Session

Visitez `/Api/Auth/check.php` pour vérifier votre session active.

## 📝 Flux d'Authentification

### Inscription
```
1. User remplit le formulaire (inscription.html)
2. formInscription → seConnecter() (async)
3. seConnecter() → api.register() → POST /Api/Auth/register.php
4. Backend valide → crée utilisateur → crée session
5. Frontend reçoit user.data → localStorage
6. Redirection vers dashboard
```

### Connexion
```
1. User remplit le formulaire (connexion.html)
2. formConnexion → seConnecter() (async)
3. seConnecter() → api.login() → POST /Api/Auth/login.php
4. Backend valide identifiants → crée session
5. Frontend reçoit user.data → localStorage
6. Redirection vers dashboard
```

### Vérification d'Authentification
```
1. Dashboard charge
2. verifierAuthentification() check session
3. Si pas connecté → redirection vers connexion.html
```

### Déconnexion
```
1. User clique "Déconnexion"
2. deconnecterUtilisateur() → api.logout()
3. POST /Api/Auth/logout.php
4. Backend détruit session
5. Frontend nettoie localStorage
6. Redirection vers connexion.html
```

## 🔒 Sécurité

✅ **Implémenté :**
- Hash BCRYPT pour les mots de passe
- Validation côté serveur
- Sessions PHP sécurisées
- CORS configuré
- Sanitization des entrées

⚠️ **À améliorer :**
- Ajouter HTTPS en production
- Implémenter tokens JWT pour API stateless
- Rate limiting sur les endpoints
- Validation CSRF tokens
- Email verification pour inscription
- Logs de sécurité complets

## 🐛 Dépannage

### "Erreur de connexion à la base de données"
- Vérifiez que MySQL est running
- Vérifiez les constantes DB_*
- Vérifiez les permissions utilisateur

### "CORS error"
- Assurez que CORS::configurer() est appelé
- Vérifiez l'URL de base de l'API
- Testez avec un tool comme Postman

### "Session non active"
- Vérifiez que session_start() est dans bootstrap.php
- Vérifiez que credentials: 'include' est dans api-client.js
- Vérifiez que les cookies sont activés

### Formulaires non soumis
- Vérifiez l'ordre des scripts (utils → api-client → auth-api → main)
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que le formulaire a l'id correct

## 📁 Structure

```
APP_IB/
├── backend/
│   ├── Api/Auth/
│   │   ├── login.php ✓
│   │   ├── register.php ✓
│   │   ├── check.php ✓
│   │   ├── logout.php ✓
│   │   ├── change-password.php ✓
│   │   └── reset-password.php ✓
│   ├── configs/
│   │   ├── cors.php ✓
│   │   └── database.php ✓
│   ├── models/
│   │   ├── User.php ✓
│   │   └── Database.php ✓
│   ├── utils/
│   │   ├── Response.php ✓
│   │   ├── Security.php ✓
│   │   └── JWT.php (optionnel)
│   └── bootstrap.php ✓
└── frontend/
    ├── HTML/
    │   ├── connexion.html ✓
    │   ├── inscription.html ✓
    │   └── dashbord.html ✓
    └── JS/
        ├── utils.js ✓
        ├── api-client.js ✓
        ├── auth-api.js ✓
        └── main.js ✓
```

## ✨ Prochaines Étapes

1. Adapter les constantes DB à votre environnement
2. Créer la base de données et tables avec `database/schema.sql`
3. Tester chaque endpoint
4. Ajouter validation email
5. Implémenter JWT pour API stateless
6. Ajouter logging avancé

---

**Dernière mise à jour :** 20 janvier 2026
