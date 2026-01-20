<?php
/**
 * POST /Api/Products/force-delete.php
 * Supprimer physiquement un produit de la table (DELETE réel)
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

try {
    error_log("FORCE_DELETE API: REQUEST_METHOD=" . ($_SERVER['REQUEST_METHOD'] ?? 'NULL') . ", GET=" . json_encode($_GET) . ", POST=" . json_encode($_POST));

    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $id = $_GET['id'] ?? $_POST['id'] ?? null;
    error_log("FORCE_DELETE API: ID récupéré = " . ($id ?? 'NULL'));

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID produit manquant']);
        exit;
    }

    $product = new Product();
    $existing = $product->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
        exit;
    }

    $rowCount = $product->forceDelete($id);
    error_log("FORCE_DELETE API: forceDelete() retourné $rowCount lignes modifiées");

    Response::success(null, 'Produit supprimé définitivement', 200);

} catch (\Exception $e) {
    error_log("Erreur API FORCE DELETE produit: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
?>