<?php
/**
 * Test de l'API via curl (simule le navigateur)
 */

$json = file_get_contents('http://localhost/APP_IB/backend/Api/Products/list.php');
$data = json_decode($json, true);

echo "=== TEST STRUCTURE RÉPONSE API ===\n\n";
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
