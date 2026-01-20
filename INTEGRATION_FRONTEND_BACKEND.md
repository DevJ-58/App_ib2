# 🔗 Points Critiques d'Intégration Frontend-Backend

## 1. 🌐 URL de Base de l'API

**Fichier:** `frontend/JS/api-client.js` (ligne ~5)

```javascript
constructor(baseURL = 'http://localhost/APP_IB/backend')
```

**À adapter selon votre environnement:**
- WAMP sur disque C: → `http://localhost/APP_IB/backend`
- Serveur local différent → Adapter l'URL
- Production → Utiliser domaine réel + HTTPS

---

## 2. 🗄️ Constantes Base de Données

**Fichier:** `backend/bootstrap.php` (lignes ~8-14)

```php
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'app_ib');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
```

**À vérifier:**
- Host correct (localhost/127.0.0.1/IP serveur)
- Port correct (3306 par défaut)
- Nom base de données correct
- Utilisateur MySQL correct
- Mot de passe MySQL correct

---

## 3. 📝 Ordre d'Inclusion des Scripts

**Dans tous les fichiers HTML** (connexion.html, inscription.html, dashbord.html):

```html
<!-- ✅ BON ORDRE -->
<script src="../JS/utils.js"></script>
<script src="../JS/api-client.js"></script>
<script src="../JS/auth-api.js"></script>
<script src="../JS/main.js"></script>

<!-- ❌ MAUVAIS ORDRE -->
<!-- Ne pas faire: <script src="../JS/main.js"></script> en premier -->
```

**Pourquoi cet ordre:**
1. `utils.js` → Fonctions utilitaires basiques
2. `api-client.js` → Définit classe `APIClient` et instance `api`
3. `auth-api.js` → Utilise `api` pour l'authentification
4. `main.js` → Utilise `auth-api.js` pour les formulaires

---

## 4. 📋 Flux de Données Frontend → Backend

### Inscription
```
HTML Form
    ↓
formInscription.addEventListener('submit')
    ↓
seConnecter(nom, prenom, tel, email, pwd, confirm)
    ↓
api.register(...)
    ↓
POST /Api/Auth/register.php
    ↓
JSON Request:
{
  "nom": "...",
  "prenom": "...",
  "telephone": "...",
  "email": "...",
  "mot_de_passe": "...",
  "confirm_mot_de_passe": "..."
}
```

### Connexion
```
HTML Form
    ↓
formConnexion.addEventListener('submit')
    ↓
seConnecter(telephone, motDePasse)
    ↓
api.login(telephone, motDePasse)
    ↓
POST /Api/Auth/login.php
    ↓
JSON Request:
{
  "telephone": "...",
  "mot_de_passe": "..."
}
```

---

## 5. 🔐 Gestion des Sessions

### Backend (PHP)
```php
// Création de session après login/register
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_role'] = $user['role'];
$_SESSION['user_telephone'] = $user['telephone'];
$_SESSION['logged_in_at'] = time();
```

### Frontend (JavaScript)
```javascript
// Récupération de l'utilisateur
async function initialiserAuthentification() {
    const response = await api.checkSession();
    if (response.success) {
        utilisateurConnecte = response.data;
    }
}
```

### Cookies & Credentials
- Frontend inclut: `credentials: 'include'` dans fetch
- Backend envoie: `Set-Cookie: PHPSESSID=...`
- Browser gère automatiquement les cookies

---

## 6. 🔄 Gestion des Erreurs

### Backend → Frontend

**Réponse succès:**
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
    "role": "vendeur"
  }
}
```

**Réponse erreur validation:**
```json
{
  "success": false,
  "code": 422,
  "message": "Erreur de validation",
  "errors": {
    "telephone": "Le téléphone est requis",
    "email": "L'email n'est pas valide"
  }
}
```

**Réponse erreur authentification:**
```json
{
  "success": false,
  "code": 401,
  "message": "Utilisateur non trouvé"
}
```

---

## 7. 🛡️ Validations Critiques

### Frontend (utils.js)
```javascript
validerEmail(email)      // Regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
validerTelephone(tel)    // Regex /^[0-9]{10}$/
validerMotDePasse(pwd)   // Longueur >= 6
```

### Backend (Security.php)
```php
validateEmail()          // filter_var + FILTER_VALIDATE_EMAIL
validatePhone()          // Regex /^[0-9]{10}$/
validatePassword()       // Minima + chiffres + lettres
sanitize()              // htmlspecialchars pour XSS
```

---

## 8. 🔑 Points Importants à Vérifier

### ✅ Avant de tester:

- [ ] **MySQL running**
  ```powershell
  # Windows - Vérifier dans Services ou:
  netstat -an | findstr :3306
  ```

- [ ] **Base de données créée**
  ```sql
  CREATE DATABASE app_ib;
  USE app_ib;
  -- Importer schema.sql et seeds.sql
  ```

- [ ] **URL API correcte**
  ```javascript
  // Test: ouvrir dans navigateur
  http://localhost/APP_IB/backend/Api/Auth/check.php
  // Doit retourner JSON (même si erreur)
  ```

- [ ] **CORS configuré**
  ```javascript
  // Vérifier réponse headers
  Access-Control-Allow-Origin: *
  ```

- [ ] **Sessions activées**
  ```php
  // Dans bootstrap.php
  session_start(); // ✅ Présent
  ```

---

## 9. 🐛 Erreurs Courants et Solutions

### Erreur: "CORS error"
```
❌ Cause: Headers CORS manquants
✅ Solution: Vérifier backend/configs/cors.php
✅ Solution: Vérifier que CORS::configurer() est appelé
```

### Erreur: "TypeError: api is undefined"
```
❌ Cause: api-client.js chargé après auth-api.js
✅ Solution: Vérifier ordre: api-client → auth-api → main
```

### Erreur: "Session non trouvée"
```
❌ Cause: credentials: 'include' manquant
✅ Solution: Vérifier api-client.js line ~15
```

### Erreur: "Base de données non trouvée"
```
❌ Cause: Constantes DB incorrectes
✅ Solution: Vérifier bootstrap.php lignes 8-14
```

### Erreur: "Mot de passe incorrect"
```
❌ Cause: Hash BCRYPT non reconnu
✅ Solution: Utiliser password_hash() et password_verify()
```

---

## 10. 📊 Architecture Globale

```
┌─────────────────┐
│  connexion.html │
│  inscription.html│
│  dashbord.html  │
└────────┬────────┘
         │ (scripts)
         ↓
    ┌─────────────┐
    │ utils.js    │
    └─────────────┘
         │ (utilités)
         ↓
┌─────────────────────┐
│  api-client.js      │ → Instance 'api'
│  (APIClient class)  │
└─────────────────────┘
         │ (requêtes API)
         ↓
┌─────────────────────┐
│  auth-api.js        │
│  (auth functions)   │
└─────────────────────┘
         │ (authentification)
         ↓
┌─────────────────────┐
│  main.js            │
│  (event handlers)   │
└─────────────────────┘
         │ (POST/GET)
         ↓
┌────────────────────────────────┐
│  Backend PHP                    │
├────────────────────────────────┤
│  Api/Auth/                     │
│  ├─ login.php                  │
│  ├─ register.php               │
│  ├─ check.php                  │
│  ├─ logout.php                 │
│  ├─ change-password.php        │
│  └─ reset-password.php         │
└────────────────────────────────┘
         │ (SQL)
         ↓
┌────────────────────────────────┐
│  MySQL Database (app_ib)        │
│  ├─ utilisateurs table         │
│  └─ autres tables              │
└────────────────────────────────┘
```

---

## 📞 Checklist d'Intégration

**Avant le déploiement en production:**

- [ ] URL API adaptée au domaine
- [ ] Constantes DB correctes
- [ ] HTTPS activé
- [ ] Sécurité CORS restreinte
- [ ] Logs d'erreur activés
- [ ] Password requirements fort
- [ ] Rate limiting implémenté
- [ ] JWT implémenté (optionnel)
- [ ] Email verification (optionnel)
- [ ] 2FA implémenté (optionnel)

---

**✅ Ce document sert de référence rapide pour l'intégration Frontend-Backend.**
