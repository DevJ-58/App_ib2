<?php
/**
 * API Endpoint - GET /Api/Sales/recap-day.php
 * Résumé des ventes et paiements du jour
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';
require_once '../../models/Credit.php';

use backend\models\Sale;
use backend\models\Credit;
use backend\models\Database;

try {
    ob_clean();
    
    $today = date('Y-m-d');
    $conn = Database::getInstance()->getConnection();
    
    // ===== RECETTES TOTALES DU JOUR =====
    $sql_recettes = "SELECT SUM(total) as montant_total FROM ventes WHERE DATE(date_vente) = ?";
    $stmt = $conn->prepare($sql_recettes);
    $stmt->execute([$today]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    $recettesTotal = (float)($result['montant_total'] ?? 0);
    
    // ===== VENTES AU COMPTANT DU JOUR =====
    $sql_comptant = "SELECT SUM(total) as montant_comptant FROM ventes 
                     WHERE DATE(date_vente) = ? AND type_paiement = 'comptant'";
    $stmt = $conn->prepare($sql_comptant);
    $stmt->execute([$today]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    $ventesComptant = (float)($result['montant_comptant'] ?? 0);
    
    // ===== CRÉDITS ACCORDÉS DU JOUR =====
    // (Total de tous les crédits créés aujourd'hui, peu importe le statut)
    $sql_credits_accordes = "SELECT SUM(montant_total) as montant_credits FROM credits 
                             WHERE DATE(date_credit) = ?";
    $stmt = $conn->prepare($sql_credits_accordes);
    $stmt->execute([$today]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    $creditsAccordes = (float)($result['montant_credits'] ?? 0);
    
    // ===== REMBOURSEMENTS REÇUS DU JOUR =====
    $sql_remboursements = "SELECT SUM(montant) as montant_rembourse FROM remboursements 
                          WHERE DATE(date_paiement) = ?";
    $stmt = $conn->prepare($sql_remboursements);
    $stmt->execute([$today]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    $remboursements = (float)($result['montant_rembourse'] ?? 0);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Résumé du jour récupéré avec succès',
        'data' => [
            'date' => $today,
            'recettesTotal' => $recettesTotal,
            'ventesComptant' => $ventesComptant,
            'creditsAccordes' => $creditsAccordes,
            'remboursements' => $remboursements
        ]
    ]);
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
