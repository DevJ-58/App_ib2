<?php
require 'backend/bootstrap.php';
use backend\models\Database;

$db = Database::getInstance();
$stmt = $db->prepare('SELECT id, nom, stock, prix_vente FROM produits LIMIT 10');
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($products, JSON_PRETTY_PRINT);

$stmt = $db->prepare('SELECT COUNT(*) as count FROM produits WHERE stock > 0');
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "\n\nProduits avec stock > 0: " . $result['count'] . "\n";

$stmt = $db->prepare('SELECT COUNT(*) as count FROM produits WHERE stock <= 0');
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Produits avec stock <= 0: " . $result['count'] . "\n";
?>
