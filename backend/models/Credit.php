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
     * Récupérer tous les crédits
     */
    public function getAll($limit = null) {
        try {
            $query = "SELECT * FROM credits ORDER BY date_credit DESC";
            
            if ($limit) {
                $query .= " LIMIT " . (int)$limit;
            }

            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute();
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
}
?>
