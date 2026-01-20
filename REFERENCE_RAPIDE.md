# ⚡ RÉFÉRENCE RAPIDE - AUTHENTIFICATION APP_IB

## 🚀 5 Commandes Essentielles

```bash
# 1. Tester le backend
http://localhost/APP_IB/backend/test-auth.php

# 2. Tester le frontend
http://localhost/APP_IB/frontend/HTML/test-authentification.html

# 3. Tester inscription
http://localhost/APP_IB/frontend/HTML/inscription.html

# 4. Tester connexion
http://localhost/APP_IB/frontend/HTML/connexion.html

# 5. Voir le dashboard
http://localhost/APP_IB/frontend/HTML/dashbord.html
```

---

## 📋 5 Configurations Essentielles

**Fichier:** `backend/bootstrap.php`

```php
define('DB_HOST', 'localhost');      # Serveur MySQL
define('DB_PORT', 3306);             # Port MySQL
define('DB_NAME', 'app_ib');         # Nom base
define('DB_USER', 'root');           # User MySQL
define('DB_PASSWORD', '');           # Pass MySQL
```

---

## 🔐 5 Endpoints Clés

```bash
POST /Api/Auth/register.php          # Inscription
POST /Api/Auth/login.php             # Connexion
GET  /Api/Auth/check.php             # Vérifier session
POST /Api/Auth/logout.php            # Déconnexion
POST /Api/Auth/change-password.php   # Changer mot de passe
```

---

## 📁 5 Fichiers à Connaître

```
backend/bootstrap.php                # ⭐ CONFIG CENTRALE
frontend/JS/api-client.js            # Client API
frontend/JS/auth-api.js              # Fonctions auth
backend/Api/Auth/login.php           # Endpoint login
backend/models/Database.php          # Classe DB
```

---

## 🧪 5 Tests À Lancer

```
1. http://localhost/APP_IB/backend/test-auth.php
2. http://localhost/APP_IB/frontend/HTML/test-authentification.html
3. Inscription avec données fictives
4. Connexion avec mêmes données
5. Vérifier dashboard accessible
```

---

## 📚 5 Docs À Consulter

```
1. LISEZ_MOI.md                    # Démarrage
2. DEMARRAGE_RAPIDE.md             # Tests rapides
3. GUIDE_AUTHENTIFICATION.md       # Complet
4. INTEGRATION_FRONTEND_BACKEND.md # Architecture
5. INDEX_DOCUMENTATION.md          # Navigation
```

---

## ⚙️ Configuration Rapide

```
1. Adapter bootstrap.php
2. Créer base de données 'app_ib'
3. Importer schema.sql
4. Lancer test-auth.php
5. Vérifier tous tests OK
```

---

## 🔗 Intégration Rapide

```html
<!-- Ordre scripts CORRECT -->
<script src="../JS/utils.js"></script>
<script src="../JS/api-client.js"></script>
<script src="../JS/auth-api.js"></script>
<script src="../JS/main.js"></script>
```

---

## 🛡️ Sécurité Rapide

```php
# Backend utilise:
- BCRYPT hash (cost 12)
- Validation stricte
- Sanitization htmlspecialchars
- Sessions PHP sécurisées
- CORS configuré
- Logging d'événements
```

---

## 🐛 Erreurs Courantes

| Erreur | Solution |
|--------|----------|
| CORS error | Vérifier cors.php + headers |
| API undefined | Ordre scripts: api-client avant auth-api |
| Session lost | Vérifier credentials: 'include' |
| DB error | Vérifier bootstrap.php + MySQL running |
| Script failed | Vérifier console navigateur (F12) |

---

## 📊 Architecture Rapide

```
Frontend HTML
    ↓ (scripts)
utils.js → api-client.js → auth-api.js → main.js
    ↓
Utilisateur soumet formulaire
    ↓
seConnecter() appelle api.login()
    ↓
POST /Api/Auth/login.php
    ↓
PHP valide → crée session → retourne JSON
    ↓
Frontend reçoit réponse
    ↓
Redirection dashboard.html
```

---

## ✅ Checklist Minimal

- [ ] MySQL running
- [ ] bootstrap.php configuré
- [ ] Base 'app_ib' créée
- [ ] test-auth.php passe ✅
- [ ] test-authentification.html passe ✅
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible
- [ ] Déconnexion fonctionne

---

## 🎯 Ordre Lecture Doc

```
1. LISEZ_MOI.md (2 min)
2. DEMARRAGE_RAPIDE.md (3 min)
3. Tests (5 min)
4. GUIDE_AUTHENTIFICATION.md (20 min)
5. CODE + INTÉGRATION (30 min)
─────────────────────────────
Total: 60 min pour maîtriser
```

---

## 🔑 Mots-Clés Importants

```
bootstrap.php        ← CONFIG CENTRALE
api-client.js        ← INSTANCE GLOBALE: const api
auth-api.js          ← UTILISE: api.login(), api.register()
Session PHP          ← $_SESSION['user_id']
CORS                 ← Access-Control-Allow-Origin
BCRYPT              ← password_hash(pwd, PASSWORD_BCRYPT)
```

---

## 📞 Support Rapide

```
Q: CORS error?
A: Vérifier INTEGRATION_FRONTEND_BACKEND.md section 8

Q: Comment tester?
A: Lancer http://localhost/APP_IB/backend/test-auth.php

Q: Configuration BD?
A: Éditer backend/bootstrap.php lignes 8-14

Q: Comment ça marche?
A: Lire GUIDE_AUTHENTIFICATION.md section Flux

Q: Points critiques?
A: Consulter INTEGRATION_FRONTEND_BACKEND.md
```

---

## 🚀 En 15 Minutes

```
5 min: Lire DEMARRAGE_RAPIDE.md
2 min: Adapter bootstrap.php
5 min: Lancer tests
3 min: Tester inscription/connexion
───────────────────────
15 min: Système opérationnel! ✅
```

---

## 💡 Astuce Rapide

```
1. Gardez bootstrap.php à jour
2. Testez après chaque changement
3. Lisez les logs en cas d'erreur
4. Utilisez INDEX_DOCUMENTATION.md pour naviguer
5. Consultez la doc avant de demander
```

---

## 🎊 Prêt?

```
✅ Architecture cohérente
✅ Sécurité implémentée
✅ Tests fournis
✅ Documentation complète
✅ Démarrage rapide possible

→ Commencez par LISEZ_MOI.md
```

---

**Version:** 1.0  
**État:** ✅ Production-Ready  
**Dernier update:** 20 janvier 2026
