# Guide d'intégration - Formulaires HTML

## 📝 Integration dans connexion.html

Votre formulaire de connexion doit ressembler à ceci :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - App IB</title>
    <link rel="stylesheet" href="../CSS/auth.css">
</head>
<body>
    <div class="container">
        <h1>Se Connecter</h1>
        
        <form id="formConnexion">
            <div class="form-group">
                <label for="telephone">Téléphone :</label>
                <input 
                    type="tel" 
                    id="telephone" 
                    name="telephone" 
                    placeholder="Ex: 0123456789" 
                    required
                >
                <small>10 chiffres</small>
            </div>

            <div class="form-group">
                <label for="password">Mot de passe :</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Votre mot de passe" 
                    required
                >
            </div>

            <button type="submit" class="btn-submit">Se Connecter</button>
        </form>

        <p class="link-signup">
            Pas de compte ? <a href="inscription.html">S'inscrire</a>
        </p>
    </div>

    <!-- Scripts -->
    <script src="../JS/utils.js"></script>
    <script src="../JS/api-client.js"></script>
    <script src="../JS/auth-api.js"></script>
    
    <script>
        // Initialiser l'authentification au chargement
        document.addEventListener('DOMContentLoaded', function() {
            initialiserAuthentification();

            // Gérer la soumission du formulaire
            document.getElementById('formConnexion').addEventListener('submit', async function(e) {
                e.preventDefault();

                const telephone = document.getElementById('telephone').value;
                const motDePasse = document.getElementById('password').value;

                // Appeler la fonction de connexion
                await seConnecter(telephone, motDePasse);
            });

            // Rediriger si déjà connecté
            if (estAuthentifie()) {
                window.location.href = 'dashbord.html';
            }
        });
    </script>
</body>
</html>
```

---

## 📝 Intégration dans inscription.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription - App IB</title>
    <link rel="stylesheet" href="../CSS/auth.css">
</head>
<body>
    <div class="container">
        <h1>S'Inscrire</h1>
        
        <form id="formInscription">
            <div class="form-group">
                <label for="nom">Nom :</label>
                <input 
                    type="text" 
                    id="nom" 
                    name="nom" 
                    placeholder="Votre nom" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="prenom">Prénom :</label>
                <input 
                    type="text" 
                    id="prenom" 
                    name="prenom" 
                    placeholder="Votre prénom" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="telephone">Téléphone :</label>
                <input 
                    type="tel" 
                    id="telephone" 
                    name="telephone" 
                    placeholder="Ex: 0123456789" 
                    required
                >
                <small>10 chiffres</small>
            </div>

            <div class="form-group">
                <label for="email">Email :</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="votreemail@exemple.com" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="password">Mot de passe :</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Min 6 caractères" 
                    required
                >
                <small>Au moins 6 caractères, 1 chiffre et 1 lettre</small>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe :</label>
                <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Confirmer le mot de passe" 
                    required
                >
            </div>

            <button type="submit" class="btn-submit">S'Inscrire</button>
        </form>

        <p class="link-login">
            Vous avez un compte ? <a href="connexion.html">Se Connecter</a>
        </p>
    </div>

    <!-- Scripts -->
    <script src="../JS/utils.js"></script>
    <script src="../JS/api-client.js"></script>
    <script src="../JS/auth-api.js"></script>
    
    <script>
        // Initialiser l'authentification au chargement
        document.addEventListener('DOMContentLoaded', function() {
            initialiserAuthentification();

            // Gérer la soumission du formulaire
            document.getElementById('formInscription').addEventListener('submit', async function(e) {
                e.preventDefault();

                const nom = document.getElementById('nom').value;
                const prenom = document.getElementById('prenom').value;
                const telephone = document.getElementById('telephone').value;
                const email = document.getElementById('email').value;
                const motDePasse = document.getElementById('password').value;
                const confirmMotDePasse = document.getElementById('confirmPassword').value;

                // Appeler la fonction d'inscription
                await sInscrire(nom, prenom, telephone, email, motDePasse, confirmMotDePasse);
            });

            // Rediriger si déjà connecté
            if (estAuthentifie()) {
                window.location.href = 'dashbord.html';
            }
        });
    </script>
</body>
</html>
```

---

## 📝 Intégration dans dashbord.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - App IB</title>
    <link rel="stylesheet" href="../CSS/dashbord.css">
</head>
<body>
    <nav class="navbar">
        <h1>App IB</h1>
        <div class="user-info">
            <span id="utilisateurNom">Chargement...</span>
            <button id="btnDeconnexion" class="btn-logout">Déconnexion</button>
        </div>
    </nav>

    <div class="dashboard">
        <!-- Votre contenu du dashboard ici -->
    </div>

    <!-- Scripts -->
    <script src="../JS/utils.js"></script>
    <script src="../JS/api-client.js"></script>
    <script src="../JS/auth-api.js"></script>
    <script src="../JS/main.js"></script>
    
    <script>
        // Initialiser et vérifier l'authentification
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('🚀 Initialisation du Dashboard...');
            
            // Initialiser l'authentification
            await initialiserAuthentification();
            
            // Vérifier que l'utilisateur est connecté
            verifierAuthentification();
            
            // Afficher les informations de l'utilisateur
            const user = getUtilisateurConnecte();
            if (user) {
                document.getElementById('utilisateurNom').textContent = 
                    `${user.prenom} ${user.nom}`;
            }
            
            // Gérer le bouton de déconnexion
            document.getElementById('btnDeconnexion').addEventListener('click', async function() {
                await deconnecterUtilisateur();
            });
            
            // Continuer avec votre logique du dashboard
            // initialiserTableaux();
            // chargerDonnees();
        });
    </script>
</body>
</html>
```

---

## 🎯 Points clés d'intégration

### 1. **Ordre des scripts**
```html
<script src="../JS/utils.js"></script>           <!-- Utilitaires générales -->
<script src="../JS/api-client.js"></script>      <!-- Client HTTP -->
<script src="../JS/auth-api.js"></script>        <!-- Fonctions d'authentification -->
<script src="../JS/main.js"></script>            <!-- Logique métier -->
```

### 2. **Initialisation au chargement**
```javascript
document.addEventListener('DOMContentLoaded', async function() {
    await initialiserAuthentification(); // Restaurer la session
    verifierAuthentification();           // Vérifier l'accès
});
```

### 3. **Soumettre le formulaire**
```javascript
form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Empêcher le rechargement
    
    // Récupérer les données
    const data = getFormData();
    
    // Appeler l'API
    const result = await seConnecter(data.telephone, data.motDePasse);
});
```

### 4. **Afficher les notifications**
```javascript
// Succès
afficherNotification('Action réussie', 'success');

// Erreur
afficherNotification('Une erreur s\'est produite', 'error');

// Info
afficherNotification('Opération en cours...', 'info');
```

---

## ✅ Checklist d'intégration

- [ ] Adapter Database.php avec les credentials MySQL
- [ ] Créer la table `users` dans la BD
- [ ] Copier les fichiers JS (api-client.js, auth-api.js)
- [ ] Modifier connexion.html avec le formulaire
- [ ] Modifier inscription.html avec le formulaire
- [ ] Modifier dashbord.html avec les scripts
- [ ] Tester la connexion
- [ ] Tester l'inscription
- [ ] Tester la déconnexion
- [ ] Vérifier les sessions (ouvrir les cookies dev tools)

---

## 🧪 Test rapide

Ouvrez la console JavaScript (F12) et testez :

```javascript
// Vérifier que les fonctions sont chargées
typeof seConnecter; // "function"

// Vérifier le client API
typeof api; // "object"

// Afficher l'utilisateur connecté
console.log(getUtilisateurConnecte());

// Vérifier l'authentification
console.log(estAuthentifie()); // true ou false
```
