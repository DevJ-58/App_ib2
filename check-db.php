<?php
require_once 'backend/models/Database.php';

use backend\models\Database;

ini_set('display_errors', 1);
error_reporting(E_ALL);

$db = Database::getInstance();

echo "<h2>État actuel de la base de données</h2>";

// Compter les produits ACTIFS
$active = $db->select("SELECT COUNT(*) as count FROM produits WHERE actif = true");
echo "<p><strong>Produits ACTIFS (actif = true):</strong> " . $active[0]['count'] . "</p>";

// Compter les produits INACTIFS
$inactive = $db->select("SELECT COUNT(*) as count FROM produits WHERE actif = false");
echo "<p><strong>Produits INACTIFS (actif = false):</strong> " . $inactive[0]['count'] . "</p>";

// Compter TOUS les produits
$all = $db->select("SELECT COUNT(*) as count FROM produits");
echo "<p><strong>TOTAL produits:</strong> " . $all[0]['count'] . "</p>";

echo "<h3>Détail des produits</h3>";
$produits = $db->select("SELECT id, nom, actif FROM produits ORDER BY id");
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr style='background-color: #ddd;'><th>ID</th><th>Nom</th><th>Actif</th></tr>";
foreach ($produits as $p) {
    $bg = $p['actif'] ? '#fff' : '#ffcccc';
    echo "<tr style='background-color: $bg;'>";
    echo "<td>" . $p['id'] . "</td>";
    echo "<td>" . $p['nom'] . "</td>";
    echo "<td>" . ($p['actif'] ? "✅ OUI" : "❌ NON") . "</td>";
    echo "</tr>";
}
echo "</table>";

// Tester une suppression directe
echo "<h3>Test suppression directe</h3>";
if (count($produits) > 0) {
    $testId = $produits[0]['id'];
    echo "<p>Test: suppression du produit ID $testId</p>";
    
    // Avant
    $before = $db->select("SELECT actif FROM produits WHERE id = $testId");
    echo "<p>Avant: actif = " . ($before[0]['actif'] ? "true" : "false") . "</p>";
    
    // Exécuter l'UPDATE
    $rowCount = $db->execute("UPDATE produits SET actif = false WHERE id = :id", [':id' => $testId]);
    echo "<p><strong>Lignes modifiées: $rowCount</strong></p>";
    
    // Après
    $after = $db->select("SELECT actif FROM produits WHERE id = $testId");
    echo "<p>Après: actif = " . ($after[0]['actif'] ? "true" : "false") . "</p>";
}
?>
