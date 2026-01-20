<?php
/**
 * PUT /Api/Products/update.php
 * Mettre à jour un produit
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer l'ID du produit
    $id = $_GET['id'] ?? $_POST['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID produit manquant']);
        exit;
    }

    // Récupérer les données
    $data = json_decode(file_get_contents('php://input'), true);

    // Vérifier que le produit existe
    $product = new Product();
    $existing = $product->getById($id);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
        exit;
    }

    // Mettre à jour le produit
    $product->update($id, $data);

    // Récupérer le produit mis à jour
    $updated = $product->getById($id);

    Response::success($updated, 'Produit mis à jour', 200);

} catch (\Exception $e) {
    error_log("Erreur API mise à jour produit: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
?>
