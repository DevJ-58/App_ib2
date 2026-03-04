<?php
/**
 * API Endpoint - GET /Api/Sales/top-products-today.php
 * Récupérer les top produits vendus aujourd'hui
 */

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    $sale = new Sale();
    
    // Paramètre optionnel pour limiter le nombre de produits
    $limit = $_GET['limit'] ?? 5;
    
    // Récupérer les top produits d'aujourd'hui
    $topProducts = $sale->getTopProductsToday($limit);
    
    if ($topProducts === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des top produits'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Top produits du jour récupérés avec succès',
        'data' => $topProducts,
        'count' => count($topProducts)
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
