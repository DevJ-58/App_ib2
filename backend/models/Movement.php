<?php

namespace backend\models;

use backend\models\Database;

class Movement {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Créer un nouveau mouvement de stock
     */
    public function create($produit_id, $type, $quantite, $motif = '', $commentaire = '', $utilisateur_id = 1) {
        try {
            // Vérifier que le produit existe
            $sql_check = "SELECT stock FROM produits WHERE id = ?";
            $stmt_check = $this->db->prepare($sql_check);
            $stmt_check->execute([$produit_id]);
            $produit = $stmt_check->fetch(\PDO::FETCH_ASSOC);
            
            if (!$produit) {
                return ['success' => false, 'message' => 'Produit introuvable'];
            }
            
            // Vérifier les mouvements de sortie
            if (in_array($type, ['sortie', 'perte']) && $quantite > $produit['stock']) {
                return ['success' => false, 'message' => 'Stock insuffisant pour ce mouvement'];
            }
            
            // Enregistrer le mouvement
            $sql = "INSERT INTO mouvements_stock 
                   (produit_id, type, quantite, motif, commentaire, utilisateur_id) 
                   VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$produit_id, $type, $quantite, $motif, $commentaire, $utilisateur_id]);
            
            // Mettre à jour le stock du produit
            if ($type === 'entree' || $type === 'ajustement') {
                $nouveau_stock = $produit['stock'] + $quantite;
            } else {
                $nouveau_stock = $produit['stock'] - $quantite;
            }
            
            $sql_update = "UPDATE produits SET stock = ? WHERE id = ?";
            $stmt_update = $this->db->prepare($sql_update);
            $stmt_update->execute([$nouveau_stock, $produit_id]);
            
            return [
                'success' => true,
                'message' => 'Mouvement enregistré',
                'mouvement_id' => $this->db->lastInsertId(),
                'nouveau_stock' => $nouveau_stock
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtenir tous les mouvements
     */
    public function getAll($limit = 50, $offset = 0) {
        $sql = "SELECT 
                    ms.id,
                    ms.produit_id,
                    ms.type,
                    ms.quantite,
                    ms.motif,
                    ms.commentaire,
                    ms.date_mouvement,
                    u.nom as utilisateur_nom,
                    p.nom as produit_nom,
                    p.code_barre
                FROM mouvements_stock ms
                LEFT JOIN utilisateurs u ON ms.utilisateur_id = u.id
                LEFT JOIN produits p ON ms.produit_id = p.id
                ORDER BY ms.date_mouvement DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir les mouvements par produit
     */
    public function getByProduct($produit_id, $limit = 30) {
        $sql = "SELECT 
                    ms.id,
                    ms.type,
                    ms.quantite,
                    ms.motif,
                    ms.commentaire,
                    ms.date_mouvement,
                    u.nom as utilisateur_nom
                FROM mouvements_stock ms
                LEFT JOIN utilisateurs u ON ms.utilisateur_id = u.id
                WHERE ms.produit_id = ?
                ORDER BY ms.date_mouvement DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$produit_id, $limit]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir les mouvements par type
     */
    public function getByType($type, $limit = 50) {
        $sql = "SELECT 
                    ms.id,
                    ms.produit_id,
                    ms.type,
                    ms.quantite,
                    ms.motif,
                    ms.date_mouvement,
                    u.nom as utilisateur_nom,
                    p.nom as produit_nom
                FROM mouvements_stock ms
                LEFT JOIN utilisateurs u ON ms.utilisateur_id = u.id
                LEFT JOIN produits p ON ms.produit_id = p.id
                WHERE ms.type = ?
                ORDER BY ms.date_mouvement DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$type, $limit]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtenir statistiques des mouvements
     */
    public function getStats($date_debut = null, $date_fin = null) {
        $sql = "SELECT 
                    type,
                    COUNT(*) as nombre,
                    SUM(quantite) as quantite_totale
                FROM mouvements_stock
                WHERE 1=1";
        
        if ($date_debut) {
            $sql .= " AND DATE(date_mouvement) >= ?";
        }
        if ($date_fin) {
            $sql .= " AND DATE(date_mouvement) <= ?";
        }
        
        $sql .= " GROUP BY type";
        
        $params = [];
        if ($date_debut) $params[] = $date_debut;
        if ($date_fin) $params[] = $date_fin;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
?>
