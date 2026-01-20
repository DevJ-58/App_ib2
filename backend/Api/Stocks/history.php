<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Stock.php';

use backend\models\Stock;

try {
    $stock = new Stock();
    
    // Paramètres
    $produit_id = $_GET['produit_id'] ?? null;
    $limit = $_GET['limit'] ?? 50;
    
    if ($produit_id) {
        // Historique pour un produit spécifique
        $data = $stock->getMovementHistory($produit_id, $limit);
        $message = 'Historique des mouvements du produit';
    } else {
        // Derniers mouvements généraux
        $data = $stock->getRecentMovements($limit);
        $message = 'Mouvements récents';
    }
    
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => $message,
        'data' => $data,
        'count' => count($data)
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
