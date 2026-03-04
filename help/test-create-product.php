<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

try {
    // Inclure bootstrap
    require_once __DIR__ . '/backend/bootstrap.php';
    
    echo "✅ Bootstrap chargé\n";
    
    // Les données à envoyer
    $testData = [
        'nom' => 'Test Produit',
        'code_barre' => 'TEST123',
        'categorie_id' => '1',  // Changé de 'boissons' à '1'
        'prix_vente' => 1200,
        'stock' => 10,
        'seuil_alerte' => 5,
        'actif' => 1
    ];
    
    $product = new backend\models\Product();
    echo "✅ Objet Product créé\n";
    
    $id = $product->create($testData);
    echo "✅ ID créé: $id\n";
    
    $newProduct = $product->getById($id);
    echo "✅ Produit récupéré:\n";
    print_r($newProduct);
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
?>
