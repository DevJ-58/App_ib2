<?php
require 'backend/bootstrap.php';
use backend\models\Database;

$db = Database::getInstance();

// Supprimer toutes les ventes et détails de test
$stmt = $db->prepare('DELETE FROM details_ventes WHERE vente_id IN (SELECT id FROM ventes WHERE numero_vente LIKE "V%")');
$stmt->execute();

$stmt = $db->prepare('DELETE FROM ventes WHERE numero_vente LIKE "V%"');
$stmt->execute();

echo "✓ Base de données nettoyée - ventes supprimées\n";

// Réinitialiser les stocks
$stmt = $db->prepare('UPDATE produits SET stock = 50 WHERE id = 1');
$stmt->execute();
$stmt = $db->prepare('UPDATE produits SET stock = 100 WHERE id = 12');
$stmt->execute();
$stmt = $db->prepare('UPDATE produits SET stock = 200 WHERE id = 13');
$stmt->execute();

$stmt = $db->prepare('UPDATE produits SET stock = 0 WHERE id IN (14, 15, 16)');
$stmt->execute();

echo "✓ Stocks réinitialisés\n";
?>
