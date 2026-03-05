<?php

// Démarrer le buffering de sortie pour capturer les erreurs
ob_start();

header('Content-Type: application/json');

// Logs d'erreur détaillés
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';
require_once '../../models/Sale.php';

use backend\models\Sale;
use backend\models\Database;

try {
    // Nettoyer le buffer de sortie en cas d'erreur précédente
    ob_clean();
    
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
    $input = file_get_contents('php://input');
    error_log("RAW INPUT RECEIVED: " . $input);
    $data = json_decode($input, true);
    
    error_log("DECODED DATA: " . json_encode($data));
    error_log("DATA KEYS: " . implode(', ', array_keys($data ?? [])));
    
    if (!$data) {
        error_log("JSON DECODE ERROR: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Données invalides ou JSON malformé'
        ]);
        exit;
    }
    
    // Valider les paramètres obligatoires
    error_log("CHECKING items: " . (isset($data['items']) ? 'EXISTS' : 'MISSING') . " - " . json_encode($data['items'] ?? null));
    error_log("CHECKING total: " . (isset($data['total']) ? 'EXISTS' : 'MISSING') . " - " . ($data['total'] ?? 'NULL'));
    
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
        isset($data['montant_rendu']) ? floatval($data['montant_rendu']) : 0,
        isset($data['whatsapp']) ? $data['whatsapp'] : null
    );
    
    error_log("SALE CREATE RESULT: " . json_encode($result));
    
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
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    error_log("Exception in Sales/create.php: " . $e->getMessage());
}
