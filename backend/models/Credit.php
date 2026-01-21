<?php
/**
 * Model Credit - Gestion des crédits
 */

namespace backend\models;

use backend\models\Database;

class Credit {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un crédit pour une vente
     */
    public function create($vente_id, $client_nom, $montant_total, $type_client = 'AUTRE') {
        try {
            $conn = $this->db->getConnection();
            
            // Générer une référence unique
            $reference = 'CR' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            $sql = "INSERT INTO credits (reference, vente_id, client_nom, type_client, montant_total, montant_paye, montant_restant, statut, date_credit) 
                    VALUES (?, ?, ?, ?, ?, 0, ?, 'en_cours', NOW())";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $reference,
                $vente_id,
                $client_nom,
                $type_client,
                $montant_total,
                $montant_total
            ]);
            
            $credit_id = $conn->lastInsertId();
            
            return [
                'success' => true,
                'credit_id' => $credit_id,
                'reference' => $reference,
                'message' => 'Crédit créé avec succès'
            ];
        } catch (\Exception $e) {
            error_log("Error in Credit::create: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer tous les crédits
     */
    public function getAll($limit = 50, $offset = 0) {
        try {
            $query = "SELECT * FROM credits ORDER BY date_credit DESC LIMIT ? OFFSET ?";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([$limit, $offset]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getAll: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Récupérer les crédits impayés
     */
    public function getUnpaid() {
        try {
            $query = "SELECT * FROM credits WHERE statut = 'en_cours' ORDER BY date_credit DESC";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getUnpaid: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Récupérer un crédit par ID
     */
    public function getById($credit_id) {
        try {
            $query = "SELECT * FROM credits WHERE id = ?";
            
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([$credit_id]);
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Enregistrer un remboursement
     */
    public function addPayment($credit_id, $montant, $mode_paiement = 'ESPECES', $utilisateur_id = 1) {
        try {
            $conn = $this->db->getConnection();
            $conn->beginTransaction();
            
            // Récupérer le crédit
            $credit = $this->getById($credit_id);
            if (!$credit) {
                throw new \Exception("Crédit non trouvé");
            }
            
            // Vérifier que le montant ne dépasse pas ce qui est dû
            $montant_restant_actuel = floatval($credit['montant_restant']);
            $montant_a_payer = floatval($montant);
            
            if ($montant_a_payer > $montant_restant_actuel) {
                throw new \Exception("Le montant du remboursement ({$montant_a_payer}) dépasse ce qui est dû ({$montant_restant_actuel})");
            }
            
            if ($montant_a_payer <= 0) {
                throw new \Exception("Le montant doit être supérieur à 0");
            }
            
            // Insérer le remboursement
            $sql_payment = "INSERT INTO remboursements (credit_id, utilisateur_id, montant, mode_paiement, date_paiement) 
                            VALUES (?, ?, ?, ?, NOW())";
            $stmt_payment = $conn->prepare($sql_payment);
            $stmt_payment->execute([$credit_id, $utilisateur_id, $montant, $mode_paiement]);
            
            // Mettre à jour le crédit - CONVERSION IMPORTANTE EN NOMBRE
            $montant_paye_actuel = floatval($credit['montant_paye']);
            $montant_total = floatval($credit['montant_total']);
            $nouveau_montant_paye = $montant_paye_actuel + floatval($montant);
            $nouveau_montant_restant = $montant_total - $nouveau_montant_paye;
            $nouveau_statut = ($nouveau_montant_restant <= 0) ? 'solde' : 'en_cours';
            
            $sql_update = "UPDATE credits 
                           SET montant_paye = ?, 
                               montant_restant = ?, 
                               statut = ?, 
                               date_remboursement_complet = " . ($nouveau_statut === 'solde' ? 'NOW()' : 'NULL') . "
                           WHERE id = ?";
            $stmt_update = $conn->prepare($sql_update);
            $stmt_update->execute([
                $nouveau_montant_paye,
                max(0, $nouveau_montant_restant),
                $nouveau_statut,
                $credit_id
            ]);
            
            $conn->commit();
            
            return [
                'success' => true,
                'message' => 'Remboursement enregistré',
                'montant_paye' => $nouveau_montant_paye,
                'montant_restant' => max(0, $nouveau_montant_restant),
                'statut' => $nouveau_statut
            ];
        } catch (\Exception $e) {
            if (isset($conn) && $conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log("Error in addPayment: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer les statistiques des crédits
     */
    public function getStats() {
        try {
            $sql = "SELECT 
                    COUNT(*) as nombre_credits,
                    SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as credits_impayés,
                    SUM(CASE WHEN statut = 'solde' THEN 1 ELSE 0 END) as credits_saldés,
                    SUM(montant_total) as montant_total_dû,
                    SUM(montant_restant) as montant_restant_dû,
                    SUM(montant_paye) as montant_total_payé
                    FROM credits";
            
            $stmt = $this->db->getConnection()->prepare($sql);
            $stmt->execute();
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error in getStats: " . $e->getMessage());
            return null;
        }
    }
}
?>
