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
    
    // DEBUG
    error_log("DEBUG reimburse.php - Données reçues: " . json_encode($data));
    
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
    if (empty($data['credit_id']) || empty($data['montant'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Paramètres manquants: credit_id, montant'
        ]);
        exit;
    }
    
    $credit_id = intval($data['credit_id']);
    $montant = floatval($data['montant']);
    
    error_log("DEBUG reimburse.php - Credit_id (int): " . $credit_id . ", Montant: " . $montant);
    
    $credit = new Credit();
    
    $result = $credit->addPayment(
        $credit_id,
        $montant,
        $data['mode_paiement'] ?? 'ESPECES',
        $data['utilisateur_id'] ?? 1
    );
    
    error_log("DEBUG reimburse.php - Résultat addPayment: " . json_encode($result));
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'code' => 200,
            'message' => 'Remboursement enregistré',
            'data' => $result
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => $result['message'] ?? 'Erreur lors du remboursement'
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
