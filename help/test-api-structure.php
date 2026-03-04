<?php
/**
 * Test des APIs produits après correction de Response::success()
 */

require_once 'backend/bootstrap.php';

echo "=== TEST STRUCTURE RÉPONSE API ===\n\n";

// Simuler GET /Api/Products/list.php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET = [];

// Capture output
ob_start();
include 'backend/Api/Products/list.php';
$response = ob_get_clean();

$data = json_decode($response, true);

echo "Structure réponse:\n";
echo "- success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
echo "- code: " . $data['code'] . "\n";
echo "- message: " . $data['message'] . "\n";
echo "- data type: " . gettype($data['data']) . "\n";
echo "- data count: " . (is_array($data['data']) ? count($data['data']) : 'N/A') . "\n\n";

if (is_array($data['data']) && count($data['data']) > 0) {
    echo "Premier produit:\n";
    $first = $data['data'][0];
    echo "- id: " . $first['id'] . "\n";
    echo "- nom: " . $first['nom'] . "\n";
    echo "- prix_vente: " . $first['prix_vente'] . "\n";
    echo "- stock: " . $first['stock'] . "\n";
    
    echo "\n✅ Structure valide - prête pour le frontend!\n";
} else {
    echo "❌ Erreur - data n'est pas un tableau ou vide\n";
}
?>
