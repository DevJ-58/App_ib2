<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Product;

$data = array(
    'nom' => 'BAOBAB TEST UNIQUE',
    'code_barre' => 'BAOBAB-' . time(),  // Code unique
    'categorie_id' => '2',
    'prix_vente' => 1200,
    'stock' => 10,
    'seuil_alerte' => 4,
    'actif' => 1
);

echo "Testing product creation...\n";
echo "Code: " . $data['code_barre'] . "\n";

try {
    $product = new Product();
    $id = $product->create($data);
    echo "✅ Product created with ID: $id\n";
    
    $created = $product->getById($id);
    echo "✅ Product retrieved:\n";
    echo json_encode($created, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
