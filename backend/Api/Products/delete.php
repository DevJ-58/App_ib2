<?php
/**
 * DELETE /Api/Products/delete.php
 * Supprimer un produit
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

try {
    error_log("DELETE API: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD'] . ", GET=" . json_encode($_GET) . ", POST=" . json_encode($_POST));
    
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer l'ID du produit
    $id = $_GET['id'] ?? $_POST['id'] ?? null;
    error_log("DELETE API: ID récupéré = " . ($id ?? 'NULL'));
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID produit manquant']);
        exit;
    }

    // Vérifier que le produit existe
    $product = new Product();
    $existing = $product->getById($id);
    error_log("DELETE API: Produit existe? " . ($existing ? "OUI" : "NON"));
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
        exit;
    }

    // Mode de suppression: soft (par défaut) ou hard lorsque ?mode=hard ou POST mode=hard
    $mode = $_GET['mode'] ?? $_POST['mode'] ?? null;
    if ($mode === 'hard') {
        // suppression physique
        try {
            $rowCount = $product->forceDelete($id);
            error_log("DELETE API: forceDelete() retourné $rowCount lignes modifiées pour ID=$id");
            Response::success(null, 'Produit supprimé définitivement', 200);
        } catch (\Exception $e) {
            // Contrainte référentielle fréquente (SQLSTATE 23000 / code 1451)
            $msg = $e->getMessage();
            if (stripos($msg, '1451') !== false || stripos($msg, 'referential') !== false || stripos($msg, 'Integrity constraint') !== false) {
                Response::error('Impossible de supprimer définitivement : contraintes référentielles existent (mouvements/ventes). Utilisez la suppression normale.', 400);
            } else {
                Response::error($e->getMessage(), 400);
            }
        }
    } elseif ($mode === 'hard_cleanup') {
        // suppression physique après nettoyage des dépendances
        try {
            $rowCount = $product->forceDeleteWithDeps($id);
            error_log("DELETE API: forceDeleteWithDeps() retourné $rowCount lignes modifiées pour ID=$id");
            Response::success(null, 'Produit et dépendances supprimés définitivement', 200);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    } else {
        // suppression physique par défaut
        try {
            $rowCount = $product->forceDelete($id);
            error_log("DELETE API: forceDelete() retourné $rowCount lignes modifiées pour ID=$id");
            Response::success(null, 'Produit supprimé définitivement', 200);
        } catch (\Exception $e) {
            // Contrainte référentielle fréquente (SQLSTATE 23000 / code 1451)
            $msg = $e->getMessage();
            if (stripos($msg, '1451') !== false || stripos($msg, 'referential') !== false || stripos($msg, 'Integrity constraint') !== false) {
                Response::error('Impossible de supprimer définitivement : contraintes référentielles existent (mouvements/ventes). Utilisez la suppression normale.', 400);
            } else {
                Response::error($e->getMessage(), 400);
            }
        }
    }
} catch (\Exception $e) {
    error_log("DELETE API ERROR: " . $e->getMessage());
    error_log("DELETE API TRACE: " . $e->getTraceAsString());
    Response::error('Erreur serveur: ' . $e->getMessage(), 500);
}
