<?php
/**
 * POST /Api/Products/create.php
 * Créer un nouveau produit
 */

// Fallback pour éviter les erreurs silencieuses
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $errstr,
        'debug' => "$errfile:$errline"
    ]);
    exit;
});

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;
use backend\utils\Validator;

try {
    error_log('📝 [CREATE] Début traitement');
    error_log('📝 [CREATE] REQUEST_METHOD: ' . $_SERVER['REQUEST_METHOD']);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer les données
    $input = file_get_contents('php://input');
    error_log('📝 [CREATE] Raw input: ' . $input);
    
    $data = json_decode($input, true);
    error_log('📝 [CREATE] Decoded data: ' . json_encode($data));

    // Valider les données requises
    $validator = new Validator();
    $validator->required('nom', $data['nom'] ?? null, 'Le nom est requis');
    $validator->required('prix_vente', $data['prix_vente'] ?? null, 'Le prix de vente est requis');

    if (!$validator->isValid()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => $validator->getErrors()]);
        exit;
    }

    // Créer le produit
    error_log('📝 [CREATE] Création du produit avec les données: ' . json_encode($data));
    $product = new Product();
    $id = $product->create($data);
    error_log('📝 [CREATE] Produit créé avec ID: ' . $id);

    // Récupérer le produit créé
    $newProduct = $product->getById($id);
    error_log('📝 [CREATE] Produit récupéré: ' . json_encode($newProduct));

    http_response_code(201);
    Response::success($newProduct, 'Produit créé avec succès', 201);

} catch (\Exception $e) {
    error_log("❌ [CREATE] Erreur: " . $e->getMessage());
    error_log("❌ [CREATE] Trace: " . $e->getTraceAsString());
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'code' => 400,
        'message' => $e->getMessage()
    ]);
    exit;
}
?>
