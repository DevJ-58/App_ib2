<?php
require_once 'backend/bootstrap.php';
require_once 'backend/models/Product.php';

use backend\models\Product;

ini_set('display_errors', 1);
error_reporting(E_ALL);

$product = new Product();

echo "<h2>Test Direct Suppression en BD</h2>";

// Récupérer un produit actif
$all = $product->getAll(false); // tous les produits
$actifs = array_filter($all, function($p) { return $p['actif'] == true; });
$actifs = array_values($actifs);

if (count($actifs) > 0) {
    $testId = $actifs[0]['id'];
    $testNom = $actifs[0]['nom'];
    
    echo "<p>Test produit: ID $testId - $testNom</p>";
    
    // Vérifier AVANT
    $before = $product->getById($testId);
    echo "<p><strong>AVANT suppression:</strong></p>";
    echo "<pre>ID: " . $before['id'] . "\nNom: " . $before['nom'] . "\nActif: " . ($before['actif'] ? "true" : "false") . "</pre>";
    
    // Supprimer
    echo "<p><strong>Appel delete()...</strong></p>";
    $rowCount = $product->delete($testId);
    echo "<p>Résultat: $rowCount lignes modifiées</p>";
    
    // Vérifier APRÈS
    $after = $product->getById($testId);
    echo "<p><strong>APRÈS suppression:</strong></p>";
    echo "<pre>ID: " . $after['id'] . "\nNom: " . $after['nom'] . "\nActif: " . ($after['actif'] ? "true" : "false") . "</pre>";
    
    if ($before['actif'] == true && $after['actif'] == false) {
        echo "<p style='color: green;'><strong>✅ SUPPRESSION RÉUSSIE</strong></p>";
    } else {
        echo "<p style='color: red;'><strong>❌ SUPPRESSION ÉCHOUÉE</strong></p>";
    }
} else {
    echo "<p>Aucun produit actif à tester</p>";
}
?>
