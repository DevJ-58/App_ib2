<?php
require_once 'backend/models/Database.php';
use backend\models\Database;

$db = Database::getInstance();

echo "<h2>État ACTUEL de la base de données</h2>";

// Compter les produits
$all = $db->select("SELECT COUNT(*) as count FROM produits");
$actifs = $db->select("SELECT COUNT(*) as count FROM produits WHERE actif = true");
$inactifs = $db->select("SELECT COUNT(*) as count FROM produits WHERE actif = false");

echo "<p><strong>TOTAL produits:</strong> " . $all[0]['count'] . "</p>";
echo "<p><strong>Produits ACTIFS (actif=1):</strong> " . $actifs[0]['count'] . "</p>";
echo "<p><strong>Produits INACTIFS (actif=0):</strong> " . $inactifs[0]['count'] . "</p>";

if ($actifs[0]['count'] + $inactifs[0]['count'] == $all[0]['count']) {
    echo "<p style='color: green;'><strong>✅ Les comptes correspondent</strong></p>";
} else {
    echo "<p style='color: red;'><strong>❌ Erreur: actifs + inactifs != total</strong></p>";
}

echo "<h3>Détail des produits INACTIFS:</h3>";
$inactifsList = $db->select("SELECT id, nom, actif FROM produits WHERE actif = false ORDER BY id");
echo "<table border='1'><tr><th>ID</th><th>Nom</th></tr>";
foreach ($inactifsList as $p) {
    echo "<tr><td>" . $p['id'] . "</td><td>" . $p['nom'] . "</td></tr>";
}
echo "</table>";
?>
