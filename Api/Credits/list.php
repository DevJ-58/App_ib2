<?php

header('Content-Type: application/json');

// Chemin vers la racine du projet
$projectRoot = dirname(dirname(__FILE__));

// Inclure les fichiers nécessaires
require_once $projectRoot . '/backend/models/Database.php';
require_once $projectRoot . '/backend/models/Credit.php';

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
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    $credit = new Credit();
    
    if ($status === 'en_cours') {
        $credits = $credit->getUnpaid();
    } else {
        $credits = $credit->getAll($limit, $offset);
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Crédits récupérés',
        'data' => $credits,
        'count' => count($credits)
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
