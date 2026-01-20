<?php
/**
 * GET /Api/Categories/check-deps.php
 * Vérifier les dépendances d'une catégorie avant suppression
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Category;
use backend\utils\Response;

try {
    error_log("GET Categories/check-deps: requête reçue");

    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID catégorie manquant']);
        exit;
    }

    $category = new Category();
    
    // Vérifier que la catégorie existe
    if (!$category->getById($id)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Catégorie non trouvée']);
        exit;
    }

    // Compter les produits dépendants
    $dependents = $category->countDependents($id);
    
    error_log("GET Categories/check-deps: Catégorie ID=" . $id . " a " . $dependents . " produits dépendants");
    
    Response::success([
        'id' => $id,
        'dependents' => $dependents,
        'hasDependents' => $dependents > 0
    ], 'Vérification de dépendances complétée', 200);

} catch (\Exception $e) {
    error_log("GET Categories/check-deps ERROR: " . $e->getMessage());
    Response::error('Erreur lors de la vérification: ' . $e->getMessage(), 500);
}
