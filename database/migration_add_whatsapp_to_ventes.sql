-- Migration: Ajouter colonne whatsapp à la table ventes
-- Date: 2026-03-05
-- Description: Ajout du champ WhatsApp pour les ventes avec numéro de téléphone client

USE gestion_stock;

-- Ajouter la colonne whatsapp à la table ventes
ALTER TABLE ventes
ADD COLUMN whatsapp VARCHAR(20) NULL AFTER client_nom,
ADD INDEX idx_whatsapp (whatsapp);

-- Commentaire sur la colonne
ALTER TABLE ventes COMMENT 'En-tête des ventes avec support WhatsApp';