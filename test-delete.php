<?php
require_once 'backend/bootstrap.php';
require_once 'backend/models/Product.php';

use backend\models\Product;

ini_set('display_errors', 1);
error_reporting(E_ALL);

$product = new Product();

// Récupérer le premier produit actif
echo "<h2>Vérification suppression produit</h2>";

// Avant suppression
$all = $product->getAll(false); // false = inclure tous (actifs et inactifs)
echo "<p>Total produits (tous) AVANT: " . count($all) . "</p>";
echo "<table border='1'><tr><th>ID</th><th>Nom</th><th>Actif</th></tr>";
foreach ($all as $p) {
    echo "<tr><td>{$p['id']}</td><td>{$p['nom']}</td><td>{$p['actif']}</td></tr>";
}
echo "</table>";

// Tester suppression d'un produit (ID 1)
if (count($all) > 0) {
    $testId = $all[0]['id'];
    echo "<p><strong>Suppression du produit ID: $testId</strong></p>";
    
    // Suppression
    $rowCount = $product->delete($testId);
    echo "<p>Lignes modifiées: $rowCount</p>";
    
    // Vérifier après suppression
    $all = $product->getAll(false);
    echo "<p>Total produits (tous) APRÈS: " . count($all) . "</p>";
    echo "<table border='1'><tr><th>ID</th><th>Nom</th><th>Actif</th></tr>";
    foreach ($all as $p) {
        echo "<tr><td>{$p['id']}</td><td>{$p['nom']}</td><td>{$p['actif']}</td></tr>";
    }
    echo "</table>";
}
?>
