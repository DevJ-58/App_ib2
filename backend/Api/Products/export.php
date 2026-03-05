<?php
/**
 * API Endpoint - GET /Api/Products/export.php
 * Exporter la liste complète des produits
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Product.php';

use backend\models\Product;

try {
    ob_clean();
    
    $product = new Product();
    $produits = $product->getAll();
    
    if ($produits === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des produits'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Produits récupérés',
        'data' => $produits,
        'count' => count($produits)
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
