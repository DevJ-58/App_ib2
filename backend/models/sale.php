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
     * Créer une nouvelle vente avec ses détails
     */
    public function create($client_nom, $total, $type_paiement, $items = [], $utilisateur_id = 1, $montant_recu = 0, $montant_rendu = 0) {
        try {
            $conn = $this->db->getConnection();
            
            // Début de transaction
            $conn->beginTransaction();
            
            // Générer un numéro de vente unique
            $numero_vente = 'V' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Insérer la vente
            $sql = "INSERT INTO ventes (numero_vente, client_nom, total, montant_recu, montant_rendu, type_paiement, utilisateur_id, date_vente) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            
            // Log pour déboggage
            error_log("INSERT VENTE: montant_recu=$montant_recu, montant_rendu=$montant_rendu");
            
            $stmt->execute([
                $numero_vente, 
                $client_nom, 
                $total, 
                ($montant_recu > 0 || $montant_recu === 0) ? $montant_recu : null,
                ($montant_rendu > 0 || $montant_rendu === 0) ? $montant_rendu : null,
                $type_paiement, 
                $utilisateur_id
            ]);
            
            $vente_id = $conn->lastInsertId();
            
            // Insérer les détails de vente et mettre à jour les stocks
            foreach ($items as $item) {
                // Récupérer le nom du produit
                $sql_prod = "SELECT nom FROM produits WHERE id = ?";
                $stmt_prod = $conn->prepare($sql_prod);
                $stmt_prod->execute([$item['produit_id']]);
                $produit = $stmt_prod->fetch(\PDO::FETCH_ASSOC);
                $nom_produit = $produit['nom'] ?? 'Produit';
                
                // Insérer détail de vente
                $sql_detail = "INSERT INTO details_ventes (vente_id, produit_id, nom_produit, quantite, prix_unitaire, sous_total) 
                               VALUES (?, ?, ?, ?, ?, ?)";
                $stmt_detail = $conn->prepare($sql_detail);
                $sous_total = $item['quantite'] * $item['prix_vente'];
                $stmt_detail->execute([
                    $vente_id,
                    $item['produit_id'],
                    $nom_produit,
                    $item['quantite'],
                    $item['prix_vente'],
                    $sous_total
                ]);
                
                // Mettre à jour le stock du produit
                $sql_update = "UPDATE produits SET stock = stock - ? WHERE id = ?";
                $stmt_update = $conn->prepare($sql_update);
                $stmt_update->execute([$item['quantite'], $item['produit_id']]);
                
                // Créer un mouvement de stock
                $sql_mouvement = "INSERT INTO mouvements_stock (produit_id, type, quantite, motif, date_mouvement, utilisateur_id) 
                                  VALUES (?, 'sortie', ?, 'vente', NOW(), ?)";
                $stmt_mouvement = $conn->prepare($sql_mouvement);
                $stmt_mouvement->execute([$item['produit_id'], $item['quantite'], $utilisateur_id]);
            }
            
            // Valider la transaction
            $conn->commit();
            
            return [
                'success' => true,
                'message' => 'Vente enregistrée avec succès',
                'vente_id' => $vente_id,
                'numero_vente' => $numero_vente
            ];
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            if (isset($conn) && $conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log("Error in Sale::create: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de la création de la vente: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer toutes les ventes avec détails des produits
     */
    public function getAllWithDetails($limit = 50, $offset = 0) {
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
                      LIMIT ? OFFSET ?";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([$limit, $offset]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getAllWithDetails: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Récupérer les détails d'une vente
     */
    public function getDetails($vente_id) {
        try {
            $query = "SELECT 
                        dv.id,
                        dv.produit_id,
                        p.nom as produit_nom,
                        dv.quantite,
                        dv.prix_unitaire,
                        dv.sous_total
                      FROM details_ventes dv
                      LEFT JOIN produits p ON dv.produit_id = p.id
                      WHERE dv.vente_id = ?";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([$vente_id]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getDetails: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Récupérer les statistiques des ventes
     */
    public function getStats($date_debut = null, $date_fin = null) {
        try {
            $where = "1=1";
            $params = [];
            
            if ($date_debut) {
                $where .= " AND DATE(v.date_vente) >= ?";
                $params[] = $date_debut;
            }
            if ($date_fin) {
                $where .= " AND DATE(v.date_vente) <= ?";
                $params[] = $date_fin;
            }
            
            $query = "SELECT 
                        COUNT(*) as nombre_ventes,
                        SUM(v.total) as total_montant,
                        AVG(v.total) as montant_moyen,
                        COUNT(DISTINCT v.type_paiement) as types_paiement,
                        SUM(dv.quantite) as quantite_totale
                      FROM ventes v
                      LEFT JOIN details_ventes dv ON v.id = dv.vente_id
                      WHERE $where";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getStats: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Récupérer les ventes récentes (pour le dashboard)
     */
    public function getRecent($limit = 5) {
        return $this->getAllWithDetails($limit, 0);
    }
}
?>
