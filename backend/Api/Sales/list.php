<?php
/**
 * API Endpoint - GET /Api/Sales/list.php
 * Récupérer la liste des ventes avec détails
 */

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    $sale = new Sale();
    
    // Paramètres
    $limit = $_GET['limit'] ?? 50;
    $offset = $_GET['offset'] ?? 0;
    
    // Récupérer les ventes avec détails
    $ventes = $sale->getAllWithDetails($limit, $offset);
    
    if ($ventes === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des ventes'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Ventes récupérées avec succès',
        'data' => $ventes,
        'count' => count($ventes)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>

