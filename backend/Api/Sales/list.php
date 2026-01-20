<?php
/**
 * API Endpoint - GET /Api/Sales/list.php
 * Récupérer la liste des ventes avec détails
 */

header('Content-Type: application/json');
require_once '../../configs/cors.php';
require_once '../../configs/constants.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;

try {
    $sale = new Sale();
    
    // Récupérer les ventes avec détails
    $ventes = $sale->getAllWithDetails(20);
    
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
        'data' => $ventes
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
