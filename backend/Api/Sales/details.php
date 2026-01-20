<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Paramètre manquant: id'
        ]);
        exit;
    }
    
    $sale = new Sale();
    $vente_id = $_GET['id'];
    
    // Récupérer les détails de la vente
    $details = $sale->getDetails($vente_id);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Détails de la vente récupérés',
        'data' => $details,
        'count' => count($details)
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
