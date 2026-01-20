<?php
/**
 * GET /Api/Products/details.php
 * Récupérer les détails d'un produit
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

    // Récupérer l'ID du produit
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID produit manquant']);
        exit;
    }

    // Récupérer le produit
    $product = new Product();
    $details = $product->getById($id);

    if (!$details) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
        exit;
    }

    Response::success($details, 'Produit récupéré', 200);

} catch (\Exception $e) {
    error_log("Erreur API détails produit: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
?>
