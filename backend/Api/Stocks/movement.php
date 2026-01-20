<?php

header('Content-Type: application/json');
require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Movement.php';

use backend\models\Movement;
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
    if (empty($data['produit_id']) || empty($data['type']) || empty($data['quantite'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Paramètres manquants: produit_id, type, quantite'
        ]);
        exit;
    }
    
    $movement = new Movement();
    
    // Créer le mouvement
    $result = $movement->create(
        $data['produit_id'],
        $data['type'],
        $data['quantite'],
        $data['motif'] ?? '',
        $data['commentaire'] ?? '',
        $data['utilisateur_id'] ?? 1  // À adapter selon auth
    );
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'code' => 201,
            'message' => 'Mouvement enregistré',
            'data' => $result
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => $result['message'] ?? 'Erreur lors de l\'enregistrement'
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
