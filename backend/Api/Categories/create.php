<?php
/**
 * POST /Api/Categories/create.php
 * Créer une nouvelle catégorie
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Category;
use backend\utils\Response;

try {
    error_log("POST Categories/create: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD']);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer les données JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    $nom = $data['nom'] ?? $_POST['nom'] ?? null;
    
    error_log("POST Categories/create: nom=" . ($nom ?? 'NULL'));

    if (!$nom) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le nom de la catégorie est obligatoire']);
        exit;
    }

    $category = new Category();
    $newId = $category->create($nom);
    
    error_log("POST Categories/create: Catégorie créée avec ID=" . $newId);
    
    $newCategory = $category->getById($newId);
    Response::success($newCategory, 'Catégorie créée avec succès', 201);

} catch (\Exception $e) {
    error_log("POST Categories/create ERROR: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
