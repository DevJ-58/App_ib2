<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'code' => 405,
            'message' => 'Méthode non autorisée. Utilisez POST'
        ]);
        exit;
    }
    
    // Récupérer les données
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
    if (empty($data['items']) || !is_array($data['items']) || empty($data['total'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Paramètres manquants: items (tableau), total'
        ]);
        exit;
    }
    
    $sale = new Sale();
    
    // Log pour déboggage
    error_log("CREATE SALE DATA: " . json_encode($data));
    
    // Créer la vente
    $result = $sale->create(
        $data['client_nom'] ?? 'Client',
        floatval($data['total']),
        $data['type_paiement'] ?? 'comptant',
        $data['items'],
        $data['utilisateur_id'] ?? 1,
        isset($data['montant_recu']) ? floatval($data['montant_recu']) : 0,
        isset($data['montant_rendu']) ? floatval($data['montant_rendu']) : 0
    );
    
    if ($result['success']) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'code' => 201,
            'message' => 'Vente enregistrée avec succès',
            'data' => $result
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => $result['message'] ?? 'Erreur lors de la création de la vente'
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
