<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Stock.php';
require_once '../../models/Movement.php';

use backend\models\Stock;
use backend\models\Movement;
use backend\models\Database;

try {
    $stock = new Stock();
    $movement = new Movement();
    
    // Paramètres
    $date_debut = $_GET['date_debut'] ?? date('Y-m-d', strtotime('-30 days'));
    $date_fin = $_GET['date_fin'] ?? date('Y-m-d');
    
    // Statistiques globales
    $alertes = $stock->countAlerts();
    $valeur_stock = $stock->getStockValue();
    $stats_mouvements = $movement->getStats($date_debut, $date_fin);
    
    // Données de stocks critiques
    $stocks_critiques = $stock->getCritiqueStocks();
    
    // Compter par état
    $ruptures = 0;
    $critiques = 0;
    $avertissements = 0;
    
    foreach ($stocks_critiques as $item) {
        if ($item['etat'] === 'rupture') $ruptures++;
        elseif ($item['etat'] === 'critique') $critiques++;
        elseif ($item['etat'] === 'alerte') $avertissements++;
    }
    
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Statistiques des stocks',
        'data' => [
            'resume' => [
                'nombre_alertes' => $alertes,
                'ruptures' => $ruptures,
                'critiques' => $critiques,
                'avertissements' => $avertissements
            ],
            'valeur_stock' => $valeur_stock,
            'mouvements' => [
                'periode' => [
                    'debut' => $date_debut,
                    'fin' => $date_fin
                ],
                'stats' => $stats_mouvements
            ]
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
