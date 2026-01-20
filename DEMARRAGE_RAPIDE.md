# ⚡ DÉMARRAGE RAPIDE - Tests d'Authentification

## 🚀 En 5 Minutes

### 1. Vérifier le Backend (1 min)
```
URL: http://localhost/APP_IB/backend/test-auth.php
```
Vérifiez que tous les tests passent ✅

### 2. Vérifier le Frontend (2 min)
```
URL: http://localhost/APP_IB/frontend/HTML/test-authentification.html
```
Testez les endpoints API

### 3. Tester l'Inscription (1 min)
```
URL: http://localhost/APP_IB/frontend/HTML/inscription.html

Données de test:
- Nom: TestUser
- Prénom: Jean
- Téléphone: 0123456789
- Email: test@test.com
- Mot de passe: Test1234
```
Vous devez être redirigé au dashboard ✅

### 4. Tester la Connexion (1 min)
```
URL: http://localhost/APP_IB/frontend/HTML/connexion.html

Données:
- Téléphone: 0123456789
- Mot de passe: Test1234
```
Vous devez être redirigé au dashboard ✅

---

## ⚙️ Configuration Essentielle

**Fichier:** `backend/bootstrap.php`

Vérifiez ces 5 lignes:
```php
define('DB_HOST', 'localhost');      // ← Votre serveur MySQL
define('DB_PORT', 3306);             // ← Port MySQL
define('DB_NAME', 'app_ib');         // ← Nom BD
define('DB_USER', 'root');           // ← User MySQL
define('DB_PASSWORD', '');           // ← Pass MySQL
```

---

## 🐛 Troubleshooting Rapide

### "CORS error"
**Solution:**
```php
Vérifier: backend/configs/cors.php
Exécuter: http://localhost/APP_IB/backend/Api/Auth/check.php
```

### "Erreur base de données"
**Solution:**
```
1. MySQL est-il running?
2. Constantes DB correctes?
3. Base 'app_ib' créée?
4. Lancer test-auth.php
```

### "API client non défini"
**Solution:**
```html
Vérifier ordre scripts:
1. utils.js
2. api-client.js ← AVANT auth-api.js
3. auth-api.js
4. main.js
```

### "Session non active"
**Solution:**
```
Vérifier: api-client.js contient credentials: 'include'
Cookies activés dans navigateur
```

---

## ✅ Checklist Rapide

- [ ] MySQL running
- [ ] Bootstrap.php: DB_HOST/DB_NAME/DB_USER/DB_PASSWORD
- [ ] Base de données créée (app_ib)
- [ ] test-auth.php: ✅ Tous tests verts
- [ ] test-authentification.html: ✅ API répond
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible
- [ ] Déconnexion fonctionne

---

## 📚 Documentation

Lire dans cet ordre:

1. **STATUS_AUTHENTIFICATION.md** (2 min)
   → Aperçu général

2. **GUIDE_AUTHENTIFICATION.md** (10 min)
   → Guide complet avec toutes les infos

3. **INTEGRATION_FRONTEND_BACKEND.md** (5 min)
   → Points critiques à retenir

4. **VERIFICATION_AUTHENTIFICATION_RESUME.md** (10 min)
   → Détails des modifications

---

## 🎯 Prochain Pas

Une fois les tests passés:

1. Créer BD et tables avec `database/schema.sql`
2. Ajouter d'autres endpoints API (produits, ventes, etc.)
3. Implémenter JWT pour scalabilité
4. Ajouter validation email
5. Passer en HTTPS

---

**✅ C'est tout! L'authentification est prête.**

Pour questions: Consulter la documentation fournie.
