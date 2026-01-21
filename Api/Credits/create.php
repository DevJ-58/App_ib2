<?php

header('Content-Type: application/json');

// Chemin vers la racine du projet
$projectRoot = dirname(dirname(__FILE__));

// Inclure les fichiers nécessaires
require_once $projectRoot . '/backend/models/Database.php';
require_once $projectRoot . '/backend/models/Credit.php';

use backend\models\Credit;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'code' => 405,
            'message' => 'Méthode non autorisée. Utilisez POST'
        ]);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Données invalides'
        ]);
        exit;
    }
    
    // Valider les paramètres obligatoires
    if (empty($data['vente_id']) || empty($data['client_nom']) || empty($data['montant_total'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Paramètres manquants: vente_id, client_nom, montant_total'
        ]);
        exit;
    }
    
    $credit = new Credit();
    
    $result = $credit->create(
        $data['vente_id'],
        $data['client_nom'],
        floatval($data['montant_total']),
        $data['type_client'] ?? 'AUTRE'
    );
    
    if ($result['success']) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'code' => 201,
            'message' => 'Crédit créé avec succès',
            'data' => $result
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => $result['message'] ?? 'Erreur lors de la création du crédit'
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
