<?php
/**
 * GET /Api/Products/check-deps.php
 * Retourne les dépendances d'un produit (tables et counts)
 */
require_once __DIR__ . '/../../bootstrap.php';
use backend\models\Database;
use backend\utils\Response;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID manquant']);
        exit;
    }

    $db = Database::getInstance();
    $tables = [
        'details_inventaires' => 'SELECT COUNT(*) as c FROM details_inventaires WHERE produit_id = :id',
        'mouvements_stock' => 'SELECT COUNT(*) as c FROM mouvements_stock WHERE produit_id = :id',
        'details_ventes' => 'SELECT COUNT(*) as c FROM details_ventes WHERE produit_id = :id'
    ];

    $result = [];
    foreach ($tables as $name => $query) {
        $res = $db->select($query, [':id' => $id]);
        $count = $res && isset($res[0]['c']) ? intval($res[0]['c']) : 0;
        $result[$name] = $count;
    }

    Response::success($result, 'Dépendances récupérées', 200);
} catch (\Exception $e) {
    error_log('ERROR check-deps: ' . $e->getMessage());
    Response::error($e->getMessage(), 400);
}
?>