<?php
/**
 * GET /Api/Products/list.php
 * Récupérer tous les produits
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $product = new Product();
    
    // Récupérer le paramètre pour filtrer les actifs
    $actifOnly = isset($_GET['all']) && $_GET['all'] === 'true' ? false : true;
    
    // ✅ Récupérer tous les produits (actifs et ayant du stock)
    $products = $product->getAll($actifOnly);
    
    // ✅ RESTRICTION: Exclure les produits en rupture de stock (stock <= 0)
    $productsAvailable = array_filter($products, function($p) {
        return intval($p['stock']) > 0;
    });

    Response::success(array_values($productsAvailable), 'Produits disponibles récupérés', 200);

} catch (\Exception $e) {
    error_log("Erreur API liste produits: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
?>
