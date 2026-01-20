<?php

namespace backend\models;

use backend\models\Database;

class Stock {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Obtenir tous les produits avec infos stock
     */
    public function getAll($limit = null, $offset = 0) {
        $sql = "SELECT 
                    p.id,
                    p.code_barre,
                    p.code_interne,
                    p.nom,
                    p.categorie_id,
                    c.nom as categorie_nom,
                    p.prix_achat,
                    p.prix_vente,
                    p.stock,
                    p.seuil_alerte,
                    p.icone,
                    p.photo,
                    p.actif
                FROM produits p
                LEFT JOIN categories c ON p.categorie_id = c.id
                WHERE p.actif = 1
                ORDER BY p.nom ASC";
        
        if ($limit) {
            $sql .= " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir détails d'un produit
     */
    public function getById($id) {
        $sql = "SELECT 
                    p.id,
                    p.code_barre,
                    p.code_interne,
                    p.nom,
                    p.categorie_id,
                    c.nom as categorie_nom,
                    p.prix_achat,
                    p.prix_vente,
                    p.stock,
                    p.seuil_alerte,
                    p.icone,
                    p.photo,
                    p.actif
                FROM produits p
                LEFT JOIN categories c ON p.categorie_id = c.id
                WHERE p.id = ? AND p.actif = 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir les produits en stock critique
     */
    public function getCritiqueStocks() {
        $sql = "SELECT 
                    p.id,
                    p.code_barre,
                    p.nom,
                    p.stock,
                    p.seuil_alerte,
                    c.nom as categorie_nom,
                    p.prix_vente,
                    CASE 
                        WHEN p.stock = 0 THEN 'rupture'
                        WHEN p.stock < (p.seuil_alerte / 2) THEN 'critique'
                        WHEN p.stock < p.seuil_alerte THEN 'alerte'
                        ELSE 'bon'
                    END as etat
                FROM produits p
                LEFT JOIN categories c ON p.categorie_id = c.id
                WHERE p.actif = 1 AND p.stock <= p.seuil_alerte
                ORDER BY p.stock ASC, p.seuil_alerte DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir la valeur totale du stock
     */
    public function getStockValue() {
        $sql = "SELECT SUM(p.stock * p.prix_vente) as valeur_totale,
                       SUM(p.stock * p.prix_achat) as valeur_achat,
                       SUM(p.stock) as quantite_totale
                FROM produits p
                WHERE p.actif = 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Mettre à jour le stock d'un produit
     */
    public function updateStock($produit_id, $quantite, $type = 'ajustement', $motif = '', $commentaire = '', $utilisateur_id = 1) {
        try {
            // Récupérer le stock actuel
            $produit = $this->getById($produit_id);
            if (!$produit) {
                return ['success' => false, 'message' => 'Produit introuvable'];
            }
            
            $nouveau_stock = $produit['stock'];
            
            // Appliquer le mouvement
            switch ($type) {
                case 'entree':
                case 'ajustement':
                    $nouveau_stock += $quantite;
                    break;
                case 'sortie':
                case 'perte':
                    if ($quantite > $nouveau_stock) {
                        return ['success' => false, 'message' => 'Stock insuffisant'];
                    }
                    $nouveau_stock -= $quantite;
                    break;
                default:
                    return ['success' => false, 'message' => 'Type de mouvement invalide'];
            }
            
            // Mettre à jour le produit
            $sql_update = "UPDATE produits SET stock = ? WHERE id = ?";
            $stmt_update = $this->db->prepare($sql_update);
            $stmt_update->execute([$nouveau_stock, $produit_id]);
            
            // Enregistrer le mouvement
            $sql_mvt = "INSERT INTO mouvements_stock 
                       (produit_id, type, quantite, motif, commentaire, utilisateur_id) 
                       VALUES (?, ?, ?, ?, ?, ?)";
            $stmt_mvt = $this->db->prepare($sql_mvt);
            $stmt_mvt->execute([$produit_id, $type, $quantite, $motif, $commentaire, $utilisateur_id]);
            
            return [
                'success' => true,
                'message' => 'Stock mis à jour',
                'ancien_stock' => $produit['stock'],
                'nouveau_stock' => $nouveau_stock,
                'mouvement_id' => $this->db->lastInsertId()
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtenir l'historique des mouvements d'un produit
     */
    public function getMovementHistory($produit_id, $limit = 50) {
        $sql = "SELECT 
                    ms.id,
                    ms.produit_id,
                    ms.type,
                    ms.quantite,
                    ms.motif,
                    ms.commentaire,
                    ms.date_mouvement,
                    u.nom as utilisateur_nom,
                    p.nom as produit_nom
                FROM mouvements_stock ms
                LEFT JOIN utilisateurs u ON ms.utilisateur_id = u.id
                LEFT JOIN produits p ON ms.produit_id = p.id
                WHERE ms.produit_id = ?
                ORDER BY ms.date_mouvement DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$produit_id, $limit]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir tous les mouvements récents
     */
    public function getRecentMovements($limit = 20) {
        $sql = "SELECT 
                    ms.id,
                    ms.produit_id,
                    ms.type,
                    ms.quantite,
                    ms.motif,
                    ms.commentaire,
                    ms.date_mouvement,
                    u.nom as utilisateur_nom,
                    p.nom as produit_nom
                FROM mouvements_stock ms
                LEFT JOIN utilisateurs u ON ms.utilisateur_id = u.id
                LEFT JOIN produits p ON ms.produit_id = p.id
                ORDER BY ms.date_mouvement DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$limit]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Compter les produits en alerte
     */
    public function countAlerts() {
        $sql = "SELECT COUNT(*) as total FROM produits 
                WHERE actif = 1 AND stock <= seuil_alerte";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
}
?>
