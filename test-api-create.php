<?php
// Simulation d'une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost';

// Données JSON de test
$testData = json_encode([
    'nom' => 'Test Product',
    'code_barre' => '',  // Vide pour auto-générer
    'categorie_id' => '1',
    'prix_vente' => 999,
    'stock' => 5,
    'seuil_alerte' => 2,
    'actif' => 1
]);

// Réécrire stdin pour simuler une requête POST
// C'est compliqué en CLI, faisons plutôt un test via le test de création direct

echo "Testing via direct Product::create() call instead...\n\n";

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Product;

$data = [
    'nom' => 'Test Produit via API',
    'code_barre' => '',  // Vide pour auto-générer
    'categorie_id' => '1',
    'prix_vente' => 1500,
    'stock' => 8,
    'seuil_alerte' => 3,
    'actif' => 1
];

try {
    $product = new Product();
    $id = $product->create($data);
    echo "✅ SUCCESS! Product created with ID: $id\n";
    
    $created = $product->getById($id);
    echo json_encode(['success' => true, 'data' => $created], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
