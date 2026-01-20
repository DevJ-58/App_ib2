<?php
/**
 * API Endpoint - GET /Api/Credits/list.php
 * Récupérer la liste des crédits
 */

header('Content-Type: application/json');
require_once '../../configs/cors.php';
require_once '../../configs/constants.php';
require_once '../../models/Database.php';
require_once '../../models/Credit.php';

use backend\models\Credit;

try {
    $credit = new Credit();
    
    // Récupérer les crédits impayés si spécifié
    $unpaidOnly = isset($_GET['unpaid']) ? true : false;
    
    if ($unpaidOnly) {
        $credits = $credit->getUnpaid();
    } else {
        $credits = $credit->getAll(20);
    }
    
    if ($credits === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 400,
            'message' => 'Erreur lors de la récupération des crédits'
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Crédits récupérés avec succès',
        'data' => $credits
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
