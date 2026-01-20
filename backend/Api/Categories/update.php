<?php
/**
 * PUT/POST /Api/Categories/update.php
 * Mettre à jour une catégorie
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Category;
use backend\utils\Response;

try {
    error_log("UPDATE Categories/update: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD']);

    if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer les données (JSON ou form-urlencoded ou query params)
    $jsonData = [];
    if ($GLOBALS['HTTP_RAW_POST_DATA'] ?? false) {
        $jsonData = json_decode($GLOBALS['HTTP_RAW_POST_DATA'], true) ?? [];
    } else {
        // Essayer de lire depuis php://input
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            error_log("UPDATE Categories/update: raw input=" . $raw);
            $jsonData = json_decode($raw, true) ?? [];
        }
    }
    
    // Récupérer l'ID et nom (GET, POST, ou JSON)
    $id = $_GET['id'] ?? $_POST['id'] ?? $jsonData['id'] ?? null;
    $nom = $_POST['nom'] ?? $jsonData['nom'] ?? null;
    
    error_log("UPDATE Categories/update: id=" . ($id ?? 'NULL') . ", nom=" . ($nom ?? 'NULL') . ", POST=" . json_encode($_POST));

    if (!$id || !$nom) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID et nom sont obligatoires']);
        exit;
    }

    $category = new Category();
    $category->update($id, $nom);
    
    error_log("UPDATE Categories/update: Catégorie ID=" . $id . " mise à jour");
    
    $updatedCategory = $category->getById($id);
    Response::success($updatedCategory, 'Catégorie mise à jour avec succès', 200);

} catch (\Exception $e) {
    error_log("UPDATE Categories/update ERROR: " . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
