-- ============================================================================
-- BASE DE DONNÉES BOUTIQUE UIYA - VERSION FINALE
-- Compatible avec le frontend (HTML/JS/CSS)
-- Architecture MVC (Model-View-Controller)
-- ============================================================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS gestion_stock
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gestion_stock;

-- ============================================================================
-- TABLE: utilisateurs
-- Gestion des comptes administrateurs et vendeurs
-- ============================================================================
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
) ENGINE=InnoDB COMMENT='Comptes utilisateurs';

-- ============================================================================
-- TABLE: categories
-- Catégories de produits (Boissons, Snacks, Alimentaire, Hygiène)
-- ============================================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT TRUE,
    
    INDEX idx_nom (nom)
) ENGINE=InnoDB COMMENT='Catégories de produits';

-- ============================================================================
-- TABLE: produits
-- Catalogue complet des produits
-- ============================================================================
CREATE TABLE produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_barre VARCHAR(50) NOT NULL UNIQUE,
    code_interne VARCHAR(50) UNIQUE,
    nom VARCHAR(200) NOT NULL,
    categorie_id INT NOT NULL,
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    seuil_alerte INT DEFAULT 5,
    icone VARCHAR(50) DEFAULT 'fa-box',
    photo TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT,
    
    INDEX idx_code_barre (code_barre),
    INDEX idx_code_interne (code_interne),
    INDEX idx_nom (nom),
    INDEX idx_categorie (categorie_id),
    INDEX idx_stock_alerte (stock, seuil_alerte)
) ENGINE=InnoDB COMMENT='Catalogue des produits';

-- ============================================================================
-- TABLE: ventes
-- En-tête des ventes
-- ============================================================================
CREATE TABLE ventes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_vente VARCHAR(50) NOT NULL UNIQUE,
    client_nom VARCHAR(200),
    date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    montant_recu DECIMAL(10,2),
    montant_rendu DECIMAL(10,2),
    type_paiement ENUM('comptant','credit') NOT NULL,
    utilisateur_id INT NOT NULL,
    notes TEXT,

    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    
    INDEX idx_numero_vente (numero_vente),
    INDEX idx_client_nom (client_nom),
    INDEX idx_date_vente (date_vente),
    INDEX idx_type_paiement (type_paiement)
) ENGINE=InnoDB COMMENT='En-tête des ventes';

-- ============================================================================
-- TABLE: details_ventes
-- Lignes de détail des ventes
-- ============================================================================
CREATE TABLE details_ventes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vente_id INT NOT NULL,
    produit_id INT NOT NULL,
    nom_produit VARCHAR(200) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    sous_total DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
    
    INDEX idx_vente (vente_id),
    INDEX idx_produit (produit_id)
) ENGINE=InnoDB COMMENT='Détails des ventes';

-- ============================================================================
-- TABLE: mouvements_stock
-- Historique des mouvements de stock
-- ============================================================================
CREATE TABLE mouvements_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_id INT NOT NULL,
    type ENUM('entree','sortie','ajustement','perte') NOT NULL,
    quantite INT NOT NULL,
    motif VARCHAR(100),
    commentaire TEXT,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INT NOT NULL,
    reference VARCHAR(50),

    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    
    INDEX idx_produit (produit_id),
    INDEX idx_type (type),
    INDEX idx_date (date_mouvement)
) ENGINE=InnoDB COMMENT='Historique mouvements stock';

-- ============================================================================
-- TABLE: credits
-- Crédits accordés aux clients
-- ============================================================================
CREATE TABLE credits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(20) UNIQUE NOT NULL,
    vente_id INT NOT NULL,
    client_nom VARCHAR(200),
    type_client ENUM('ETUDIANT','PERSONNEL','AUTRE') DEFAULT 'AUTRE',
    montant_total DECIMAL(10,2) NOT NULL,
    montant_paye DECIMAL(10,2) DEFAULT 0,
    montant_restant DECIMAL(10,2) NOT NULL,
    statut ENUM('en_cours','solde') DEFAULT 'en_cours',
    date_credit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_remboursement_complet TIMESTAMP NULL,
    notes TEXT,

    FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE RESTRICT,
    
    INDEX idx_reference (reference),
    INDEX idx_client (client_nom),
    INDEX idx_statut (statut)
) ENGINE=InnoDB COMMENT='Crédits clients';

-- ============================================================================
-- TABLE: remboursements
-- Historique des remboursements de crédits
-- ============================================================================
CREATE TABLE remboursements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    credit_id INT NOT NULL,
    utilisateur_id INT,
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement ENUM('ESPECES','VIREMENT','MOBILE_MONEY') DEFAULT 'ESPECES',
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (credit_id) REFERENCES credits(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    
    INDEX idx_credit (credit_id),
    INDEX idx_date (date_paiement)
) ENGINE=InnoDB COMMENT='Remboursements crédits';

-- ============================================================================
-- TABLE: inventaires
-- Sessions d'inventaire
-- ============================================================================
CREATE TABLE inventaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_inventaire TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INT NOT NULL,
    commentaire TEXT,
    statut ENUM('EN_COURS','TERMINE') DEFAULT 'EN_COURS',

    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    
    INDEX idx_date (date_inventaire),
    INDEX idx_statut (statut)
) ENGINE=InnoDB COMMENT='Sessions inventaire';

-- ============================================================================
-- TABLE: details_inventaires
-- Détails comptage inventaire
-- ============================================================================
CREATE TABLE details_inventaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventaire_id INT NOT NULL,
    produit_id INT NOT NULL,
    stock_theorique INT NOT NULL,
    stock_reel INT NOT NULL,
    ecart INT NOT NULL COMMENT 'stock_reel - stock_theorique',
    
    FOREIGN KEY (inventaire_id) REFERENCES inventaires(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
    
    INDEX idx_inventaire (inventaire_id),
    INDEX idx_produit (produit_id)
) ENGINE=InnoDB COMMENT='Détails inventaire';

-- ============================================================================
-- INSERTION DES DONNÉES DE TEST
-- ============================================================================

-- Utilisateurs (mot de passe: 123456)
INSERT INTO utilisateurs (nom, prenom, telephone, email, mot_de_passe, role) VALUES
('IB', 'Mr', '0123456789', 'mr@uiya.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Dupont', 'Jean', '0987654321', 'jean@uiya.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendeur'),
('Kouassi', 'Marie', '0555555555', 'marie@uiya.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendeur');

-- Catégories
INSERT INTO categories (nom) VALUES
('Boissons'),
('Snacks'),
('Alimentaire'),
('Hygiène');

-- Produits
INSERT INTO produits (code_barre, code_interne, nom, categorie_id, prix_achat, prix_vente, stock, seuil_alerte, icone) VALUES
('5449000000996', 'PROD-0001', 'Coca-Cola 50cl', 1, 400, 500, 5, 10, 'fa-bottle-water'),
('3456789012345', 'PROD-0002', 'Eau minérale 1.5L', 1, 200, 300, 45, 20, 'fa-wine-bottle'),
('2345678901234', 'PROD-0003', 'Pain français', 3, 150, 200, 8, 15, 'fa-bread-slice'),
('1111111111111', 'PROD-0004', 'Sucre 1kg', 3, 600, 800, 12, 8, 'fa-jar'),
('7891234567890', 'PROD-0005', 'Lait Nido 400g', 3, 2000, 2500, 3, 5, 'fa-box'),
('6543210987654', 'PROD-0006', 'Chips Pringles', 2, 900, 1200, 15, 10, 'fa-box'),
('4567890123456', 'PROD-0007', 'Jus Youki 1L', 1, 300, 400, 20, 15, 'fa-bottle-droplet'),
('9876543210123', 'PROD-0008', 'Café Nescafé 100g', 3, 1200, 1500, 6, 8, 'fa-mug-hot');

-- Mouvements de stock initiaux
INSERT INTO mouvements_stock (produit_id, type, quantite, utilisateur_id, motif, reference) VALUES
(1, 'entree', 20, 1, 'Approvisionnement initial', 'APP-001'),
(2, 'entree', 50, 1, 'Approvisionnement initial', 'APP-001'),
(3, 'entree', 30, 1, 'Approvisionnement initial', 'APP-001'),
(4, 'entree', 20, 1, 'Approvisionnement initial', 'APP-001'),
(5, 'entree', 10, 1, 'Approvisionnement initial', 'APP-001'),
(6, 'entree', 25, 1, 'Approvisionnement initial', 'APP-001'),
(7, 'entree', 30, 1, 'Approvisionnement initial', 'APP-001'),
(8, 'entree', 15, 1, 'Approvisionnement initial', 'APP-001');

-- ============================================================================
-- VUES SQL
-- ============================================================================

-- Vue: Produits complets
CREATE VIEW v_produits_complets AS
SELECT 
    p.id,
    p.code_barre,
    p.code_interne,
    p.nom,
    p.prix_vente,
    p.stock,
    p.seuil_alerte,
    p.icone,
    c.nom AS categorie_nom,
    CASE 
        WHEN p.stock = 0 THEN 'RUPTURE'
        WHEN p.stock < p.seuil_alerte THEN 'CRITIQUE'
        WHEN p.stock < (p.seuil_alerte * 1.5) THEN 'MOYEN'
        ELSE 'BON'
    END AS etat_stock
FROM produits p
INNER JOIN categories c ON p.categorie_id = c.id
WHERE p.actif = TRUE;

-- Vue: Alertes stock
CREATE VIEW v_alertes_stock AS
SELECT 
    p.id,
    p.nom,
    p.code_interne,
    p.stock,
    p.seuil_alerte,
    c.nom AS categorie
FROM produits p
INNER JOIN categories c ON p.categorie_id = c.id
WHERE p.stock <= p.seuil_alerte
AND p.actif = TRUE
ORDER BY p.stock ASC;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger: Mise à jour stock après vente
CREATE TRIGGER trg_after_insert_detail_vente
AFTER INSERT ON details_ventes
FOR EACH ROW
BEGIN
    UPDATE produits 
    SET stock = stock - NEW.quantite
    WHERE id = NEW.produit_id;
    
    INSERT INTO mouvements_stock (produit_id, type, quantite, utilisateur_id, motif, reference)
    SELECT NEW.produit_id, 'sortie', NEW.quantite, v.utilisateur_id, 'Vente', v.numero_vente
    FROM ventes v WHERE v.id = NEW.vente_id;
END //

-- Trigger: Mise à jour crédit après remboursement
CREATE TRIGGER trg_after_insert_remboursement
AFTER INSERT ON remboursements
FOR EACH ROW
BEGIN
    UPDATE credits 
    SET 
        montant_paye = montant_paye + NEW.montant,
        montant_restant = montant_restant - NEW.montant,
        statut = CASE 
            WHEN (montant_restant - NEW.montant) <= 0 THEN 'solde'
            ELSE statut
        END,
        date_remboursement_complet = CASE 
            WHEN (montant_restant - NEW.montant) <= 0 THEN NOW()
            ELSE date_remboursement_complet
        END
    WHERE id = NEW.credit_id;
END //

-- Trigger: Calculer sous-total
CREATE TRIGGER trg_before_insert_detail_vente
BEFORE INSERT ON details_ventes
FOR EACH ROW
BEGIN
    SET NEW.sous_total = NEW.quantite * NEW.prix_unitaire;
END //

DELIMITER ;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

SELECT 'Base de données créée avec succès!' AS message;
SELECT 
    (SELECT COUNT(*) FROM utilisateurs) AS utilisateurs,
    (SELECT COUNT(*) FROM categories) AS categories,
    (SELECT COUNT(*) FROM produits) AS produits;