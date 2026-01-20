<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Stock.php';

use backend\models\Stock;

try {
    $stock = new Stock();
    
    // Paramètres
    $limit = $_GET['limit'] ?? 50;
    $offset = $_GET['offset'] ?? 0;
    $type = $_GET['type'] ?? 'all'; // all, critiques, value
    
    if ($type === 'critiques') {
        // Stocks en alerte
        $data = $stock->getCritiqueStocks();
        echo json_encode([
            'success' => true,
            'code' => 200,
            'message' => 'Stocks critiques récupérés',
            'data' => $data,
            'count' => count($data)
        ]);
    } elseif ($type === 'value') {
        // Valeur totale du stock
        $data = $stock->getStockValue();
        echo json_encode([
            'success' => true,
            'code' => 200,
            'message' => 'Valeur du stock',
            'data' => $data
        ]);
    } else {
        // Tous les produits avec infos stock
        $data = $stock->getAll($limit, $offset);
        echo json_encode([
            'success' => true,
            'code' => 200,
            'message' => 'Stocks récupérés',
            'data' => $data,
            'count' => count($data),
            'limit' => $limit,
            'offset' => $offset
        ]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
