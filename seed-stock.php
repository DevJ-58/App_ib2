<?php
require 'backend/bootstrap.php';
use backend\models\Database;

$db = Database::getInstance();

// Ajouter du stock à quelques produits
$produits = [
    ['id' => 1, 'stock' => 50],   // Agwaa
    ['id' => 12, 'stock' => 100], // Coca-Cola
    ['id' => 13, 'stock' => 200], // Pain
];

foreach ($produits as $produit) {
    $stmt = $db->prepare('UPDATE produits SET stock = ? WHERE id = ?');
    $stmt->execute([$produit['stock'], $produit['id']]);
    echo "✓ Produit ID " . $produit['id'] . " stock mis à jour à " . $produit['stock'] . "\n";
}

echo "\nVérification:\n";
$stmt = $db->prepare('SELECT id, nom, stock FROM produits WHERE stock > 0 ORDER BY id');
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($products as $p) {
    echo "- " . $p['nom'] . " (stock: " . $p['stock'] . ")\n";
}

echo "\nProduits avec stock > 0: " . count($products) . "\n";
?>
