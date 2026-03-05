<?php
/**
 * API Endpoint - GET /Api/Sales/recent.php
 * Récupérer les ventes récentes pour le dashboard
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    ob_clean();
    
    $sale = new Sale();
    
    // Paramètres
    $limit = $_GET['limit'] ?? 10;
    $limit = intval($limit);
    if ($limit <= 0 || $limit > 100) $limit = 10;
    
    // Récupérer les ventes récentes
    $ventes = $sale->getAllWithDetails($limit, 0);
    
    if ($ventes === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des ventes récentes'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Ventes récentes récupérées avec succès',
        'data' => $ventes,
        'count' => count($ventes)
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
