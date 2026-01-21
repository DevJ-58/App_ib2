<?php

header('Content-Type: application/json');

// Inclure les fichiers nécessaires
$basePath = dirname(dirname(dirname(__FILE__)));
require_once $basePath . '/models/Database.php';
require_once $basePath . '/models/Credit.php';

use backend\models\Credit;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'code' => 405,
            'message' => 'Méthode non autorisée. Utilisez GET'
        ]);
        exit;
    }
    
    $credit = new Credit();
    $stats = $credit->getStats();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Statistiques des crédits',
        'data' => $stats
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
