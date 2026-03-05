<?php
require_once 'backend/bootstrap.php';
use backend\models\Product;

$product = new Product();
$products = $product->getAll(true);

echo "Produits récupérés:\n";
foreach ($products as $p) {
    echo "ID: {$p['id']} - Nom: {$p['nom']} - categorie_nom: " . ($p['categorie_nom'] ?? 'NULL') . " - categorie: " . ($p['categorie'] ?? 'NULL') . "\n";
}
?>