<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    $sale = new Sale();
    
    // Paramètres optionnels
    $date_debut = $_GET['date_debut'] ?? null;
    $date_fin = $_GET['date_fin'] ?? null;
    
    // Récupérer les statistiques
    $stats = $sale->getStats($date_debut, $date_fin);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Statistiques des ventes',
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
?>
