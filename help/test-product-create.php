<?php
require_once 'backend/bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

// Tester création produit via l'endpoint
echo "=== TEST CREATION PRODUIT ===\n\n";

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';

$json = json_encode([
    'nom' => 'Test Produit',
    'prix_vente' => 500,
    'prix_achat' => 300,
    'stock' => 10
]);

// Remplacer php://input
$GLOBALS['_POST_JSON'] = $json;

// Simuler l'appel
$data = json_decode($json, true);

echo "Données reçues:\n";
print_r($data);

// Tester la création
try {
    $product = new Product();
    $id = $product->create($data);
    echo "\n✅ Produit créé: ID = $id\n";
    
    $created = $product->getById($id);
    echo "\nProduit créé:\n";
    print_r($created);
} catch (Exception $e) {
    echo "\n❌ Erreur: " . $e->getMessage() . "\n";
}
?>
