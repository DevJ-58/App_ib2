<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Stock.php';

use backend\models\Stock;
use backend\models\Database;

try {
    $stock = new Stock();
    
    // Récupérer les stocks critiques
    $critiques = $stock->getCritiqueStocks();
    $count = $stock->countAlerts();
    
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Alertes de stock',
        'data' => $critiques,
        'count' => $count,
        'summary' => [
            'total_alertes' => $count,
            'ruptures' => count(array_filter($critiques, function($item) { return $item['etat'] === 'rupture'; })),
            'critiques' => count(array_filter($critiques, function($item) { return $item['etat'] === 'critique'; })),
            'avertissements' => count(array_filter($critiques, function($item) { return $item['etat'] === 'alerte'; }))
        ]
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
