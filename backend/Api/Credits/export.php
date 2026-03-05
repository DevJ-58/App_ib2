<?php
/**
 * API Endpoint - GET /Api/Credits/export.php
 * Exporter la liste complète des crédits
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Credit.php';

use backend\models\Credit;

try {
    ob_clean();
    
    $credit = new Credit();
    $credits = $credit->getAll(10000, 0);
    
    if ($credits === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des crédits'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Crédits récupérés',
        'data' => $credits,
        'count' => count($credits)
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
