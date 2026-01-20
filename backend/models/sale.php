<?php
/**
 * Model Sale - Gestion des ventes
 */

namespace backend\models;

use backend\models\Database;

class Sale {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Récupérer toutes les ventes avec détails des produits
     */
    public function getAllWithDetails($limit = 5) {
        try {
            $query = "SELECT 
                        v.id,
                        v.numero_vente,
                        v.client_nom,
                        v.total as montant_total,
                        v.type_paiement as type,
                        v.date_vente,
                        GROUP_CONCAT(p.nom SEPARATOR ', ') as descriptions,
                        COALESCE(SUM(dv.quantite), 1) as quantite_totale
                      FROM ventes v
                      LEFT JOIN details_ventes dv ON v.id = dv.vente_id
                      LEFT JOIN produits p ON dv.produit_id = p.id
                      GROUP BY v.id, v.numero_vente, v.client_nom, v.total, v.type_paiement, v.date_vente
                      ORDER BY v.date_vente DESC
                      LIMIT ?";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([$limit]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getAllWithDetails: " . $e->getMessage());
            return [];
        }
    }
}
?>
