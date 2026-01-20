<?php
/**
 * GET /Api/Categories/list.php
 * Lister toutes les catégories
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Category;
use backend\utils\Response;

try {
    error_log("GET Categories/list: requête reçue");

    $category = new Category();
    
    // Paramètre optionnel pour inclure les inactives
    $includeInactive = isset($_GET['include_inactive']) && $_GET['include_inactive'] === 'true';
    
    $categories = $category->getAll($includeInactive);
    
    error_log("GET Categories/list: " . count($categories) . " catégories trouvées");
    Response::success($categories, 'Catégories récupérées avec succès', 200);

} catch (\Exception $e) {
    error_log("GET Categories/list ERROR: " . $e->getMessage());
    Response::error('Erreur lors de la récupération des catégories: ' . $e->getMessage(), 500);
}
