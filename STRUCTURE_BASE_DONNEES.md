# Structure de la Base de Données

## 📊 Table `users` - Gestion des utilisateurs

### SQL de création

```sql
-- Créer la base de données (si elle n'existe pas)
CREATE DATABASE IF NOT EXISTS app_ib CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE app_ib;

-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vendeur') DEFAULT 'vendeur',
    photo LONGBLOB,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes pour les performances
    INDEX idx_telephone (telephone),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_date_creation (date_creation)
);

-- Insérer un utilisateur administrateur par défaut (mot de passe: Admin@123)
INSERT INTO users (nom, prenom, telephone, email, mot_de_passe, role) VALUES (
    'IB',
    'Mr',
    '0123456789',
    'admin@app-ib.com',
    '$2y$12$...',  -- Sera haché lors de la création réelle
    'admin'
);
```

---

## 🔑 Colonnes expliquées

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT | Identifiant unique (clé primaire, auto-incrémenté) |
| `nom` | VARCHAR(100) | Nom de l'utilisateur |
| `prenom` | VARCHAR(100) | Prénom de l'utilisateur |
| `telephone` | VARCHAR(20) | Numéro de téléphone (unique, identifiant pour la connexion) |
| `email` | VARCHAR(255) | Adresse email (unique) |
| `mot_de_passe` | VARCHAR(255) | Mot de passe haché avec BCRYPT (min 60 caractères) |
| `role` | ENUM | Rôle de l'utilisateur : `admin` ou `vendeur` |
| `photo` | LONGBLOB | Photo de profil en binaire (optionnel) |
| `date_creation` | TIMESTAMP | Date et heure de création |
| `date_modification` | TIMESTAMP | Date et heure de la dernière modification |

---

## 📋 Tables supplémentaires à créer

### Table `categories` - Gestion des catégories

```sql
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icone VARCHAR(50),
    couleur VARCHAR(7),
    est_active BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nom (nom),
    INDEX idx_est_active (est_active)
);
```

### Table `products` - Gestion des produits

```sql
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie_id INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    quantite_stock INT DEFAULT 0,
    seuil_alerte INT DEFAULT 10,
    fournisseur VARCHAR(100),
    code_barre VARCHAR(50) UNIQUE,
    photo LONGBLOB,
    est_actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categorie_id) REFERENCES categories(id),
    INDEX idx_categorie_id (categorie_id),
    INDEX idx_nom (nom),
    INDEX idx_est_actif (est_actif)
);
```

### Table `stocks` - Gestion des stocks

```sql
CREATE TABLE IF NOT EXISTS stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    quantite_actuelle INT NOT NULL,
    quantite_entree INT DEFAULT 0,
    quantite_sortie INT DEFAULT 0,
    date_dernier_inventaire DATE,
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (produit_id) REFERENCES products(id),
    INDEX idx_produit_id (produit_id)
);
```

### Table `sales` - Gestion des ventes

```sql
CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    montant_total DECIMAL(10, 2) NOT NULL,
    nombre_articles INT DEFAULT 0,
    type_paiement ENUM('comptant', 'credit', 'cheque') DEFAULT 'comptant',
    numero_cheque VARCHAR(50),
    montant_paye DECIMAL(10, 2),
    montant_restant DECIMAL(10, 2),
    notes TEXT,
    est_cloturee BOOLEAN DEFAULT FALSE,
    date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (utilisateur_id) REFERENCES users(id),
    INDEX idx_utilisateur_id (utilisateur_id),
    INDEX idx_date_vente (date_vente),
    INDEX idx_est_cloturee (est_cloturee)
);
```

### Table `sale_items` - Détails des articles vendus

```sql
CREATE TABLE IF NOT EXISTS sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vente_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vente_id) REFERENCES sales(id),
    FOREIGN KEY (produit_id) REFERENCES products(id),
    INDEX idx_vente_id (vente_id),
    INDEX idx_produit_id (produit_id)
);
```

### Table `credits` - Gestion des crédits

```sql
CREATE TABLE IF NOT EXISTS credits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vente_id INT NOT NULL,
    montant_credit DECIMAL(10, 2) NOT NULL,
    montant_paye DECIMAL(10, 2) DEFAULT 0,
    montant_restant DECIMAL(10, 2) NOT NULL,
    date_debut DATE DEFAULT CURDATE(),
    date_echeance DATE,
    statut ENUM('en_cours', 'paye', 'en_retard') DEFAULT 'en_cours',
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vente_id) REFERENCES sales(id),
    INDEX idx_vente_id (vente_id),
    INDEX idx_statut (statut),
    INDEX idx_date_echeance (date_echeance)
);
```

### Table `movements` - Gestion des mouvements de stock

```sql
CREATE TABLE IF NOT EXISTS movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    type_mouvement ENUM('entree', 'sortie', 'ajustement') NOT NULL,
    quantite INT NOT NULL,
    raison VARCHAR(255),
    utilisateur_id INT NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (produit_id) REFERENCES products(id),
    FOREIGN KEY (utilisateur_id) REFERENCES users(id),
    INDEX idx_produit_id (produit_id),
    INDEX idx_utilisateur_id (utilisateur_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_date_mouvement (date_mouvement)
);
```

---

## 🔐 Sécurité

### Recommandations

1. **Hachage du mot de passe**
   - Utilise BCRYPT avec coût 12
   - Les mots de passe ne sont jamais stockés en clair
   - Les mots de passe ne sont jamais transmis au client

2. **Permissions**
   ```sql
   -- Créer un utilisateur MySQL pour l'application
   CREATE USER 'app_ib'@'localhost' IDENTIFIED BY 'secure_password_here';
   GRANT SELECT, INSERT, UPDATE, DELETE ON app_ib.* TO 'app_ib'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Indexes**
   - Sur les colonnes de recherche fréquente
   - Sur les clés étrangères
   - Sur les colonnes de filtrage

---

## 📈 Schéma des relations

```
users (1) ────────── (Many) sales
    │                    │
    │                    ├── (Many) sale_items
    │                    │               │
    │                    │               └── (Many) products
    │                    │
    │                    └── (Many) credits
    │
    └── (Many) movements
            │
            └── products (1) ────────── (1) categories
                        │
                        └── (Many) stocks
                                │
                                └── (Many) sale_items
```

---

## 🧪 Requêtes SQL de test

```sql
-- Vérifier le nombre d'utilisateurs
SELECT COUNT(*) as total_utilisateurs FROM users;

-- Lister tous les utilisateurs
SELECT id, nom, prenom, telephone, email, role FROM users;

-- Vérifier un utilisateur par téléphone
SELECT * FROM users WHERE telephone = '0123456789';

-- Compter les ventes par utilisateur
SELECT u.id, u.prenom, u.nom, COUNT(s.id) as total_ventes 
FROM users u 
LEFT JOIN sales s ON u.id = s.utilisateur_id 
GROUP BY u.id;

-- Total des ventes par jour
SELECT DATE(date_vente) as jour, SUM(montant_total) as montant_total 
FROM sales 
GROUP BY DATE(date_vente);
```

---

## 📝 Notes importants

- Toutes les colonnes `mot_de_passe` doivent faire au moins 60 caractères (taille BCRYPT)
- Les colonnes `UNIQUE` garantissent pas de doublons
- Les `FOREIGN KEY` garantissent l'intégrité référentielle
- Les `TIMESTAMP` se mettent à jour automatiquement
- Les `INDEX` améliorent les performances de recherche
