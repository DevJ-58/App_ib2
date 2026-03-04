<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo "[PHP ERROR] $errstr in $errfile:$errline\n";
    return false;
});

echo "=== TEST DIRECT CREATION ===\n";

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Product;

$data = array(
    'nom' => 'BAOBAB',
    'code_barre' => 'PROD-12',
    'categorie_id' => '3',
    'prix_vente' => 1200,
    'stock' => 20,
    'seuil_alerte' => 5,
    'actif' => 1
);

echo "Data to create: " . json_encode($data) . "\n";

try {
    echo "Creating Product object...\n";
    $product = new Product();
    echo "Product object created successfully\n";
    
    echo "Calling create() method...\n";
    $id = $product->create($data);
    echo "✅ Product created with ID: $id\n";
    
    // Verify creation
    echo "Retrieving created product...\n";
    $created = $product->getById($id);
    echo "✅ Product retrieved: " . json_encode($created) . "\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n✅ TEST COMPLETED SUCCESSFULLY\n";
