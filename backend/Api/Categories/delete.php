<?php
/**
 * DELETE /Api/Categories/delete.php
 * Supprimer une catégorie
 * 
 * Mode par défaut: hard_cleanup (supprime les produits dépendants et leurs références)
 * Mode hard: tente de supprimer directement (échoue s'il y a des dépendances)
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Category;
use backend\utils\Response;

try {
    error_log("DELETE Categories/delete: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD'] . ", GET=" . json_encode($_GET) . ", POST=" . json_encode($_POST));

    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer l'ID de la catégorie
    $id = $_GET['id'] ?? $_POST['id'] ?? null;
    error_log("DELETE Categories/delete: ID récupéré = " . ($id ?? 'NULL'));
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID catégorie manquant']);
        exit;
    }

    // Vérifier que la catégorie existe
    $category = new Category();
    $existing = $category->getById($id);
    error_log("DELETE Categories/delete: Catégorie existe? " . ($existing ? "OUI" : "NON"));
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Catégorie non trouvée']);
        exit;
    }

    // Mode de suppression: Par défaut = hard_cleanup (suppression avec nettoyage des dépendances)
    $mode = $_GET['mode'] ?? $_POST['mode'] ?? 'hard_cleanup';
    
    error_log("DELETE Categories/delete: Mode = " . $mode);

    if ($mode === 'hard_cleanup') {
        // suppression physique avec nettoyage des dépendances (mode par défaut)
        try {
            $rowCount = $category->forceDeleteWithDeps($id);
            error_log("DELETE Categories/delete: forceDeleteWithDeps() retourné $rowCount lignes modifiées pour ID=$id");
            Response::success(null, 'Catégorie et produits dépendants supprimés définitivement', 200);
        } catch (\Exception $e) {
            error_log("DELETE Categories/delete ERROR hard_cleanup: " . $e->getMessage());
            Response::error('Erreur lors de la suppression: ' . $e->getMessage(), 400);
        }
    } elseif ($mode === 'hard') {
        // suppression physique simple (sans nettoyage des dépendances)
        try {
            $rowCount = $category->forceDelete($id);
            error_log("DELETE Categories/delete: forceDelete() retourné $rowCount lignes modifiées pour ID=$id");
            Response::success(null, 'Catégorie supprimée définitivement', 200);
        } catch (\Exception $e) {
            // Contrainte référentielle
            $msg = $e->getMessage();
            if (stripos($msg, '1451') !== false || stripos($msg, 'referential') !== false || stripos($msg, 'Integrity constraint') !== false) {
                error_log("DELETE Categories/delete ERROR hard: Contrainte référentielle - " . $msg);
                Response::error('Impossible de supprimer : cette catégorie contient des produits. Utilisez le mode hard_cleanup.', 400);
            } else {
                Response::error($e->getMessage(), 400);
            }
        }
    } else {
        // Mode inconnu
        Response::error('Mode de suppression invalide. Modes disponibles: hard_cleanup (défaut), hard', 400);
    }

} catch (\Exception $e) {
    error_log("DELETE Categories/delete ERROR: " . $e->getMessage());
    error_log("DELETE Categories/delete TRACE: " . $e->getTraceAsString());
    Response::error('Erreur serveur: ' . $e->getMessage(), 500);
}
