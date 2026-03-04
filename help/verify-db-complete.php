<?php
require_once 'backend/models/Database.php';
use backend\models\Database;

$db = Database::getInstance();

echo "<h2>Vérification complète des bases de données</h2>";

// Lister toutes les bases
$bases = $db->select("SHOW DATABASES");
echo "<h3>Bases disponibles:</h3>";
foreach ($bases as $b) {
    echo $b['Database'] . "<br>";
}

echo "<h3>Base actuellement utilisée:</h3>";
$current = $db->select("SELECT DATABASE() as db");
echo "BASE: " . $current[0]['db'] . "<br>";

echo "<h3>Tables dans la base actuelle:</h3>";
$tables = $db->select("SHOW TABLES");
foreach ($tables as $t) {
    foreach ($t as $table) {
        echo "- " . $table . "<br>";
    }
}

echo "<h3>Contenu de la table produits:</h3>";
$produits = $db->select("SELECT id, nom, actif FROM produits ORDER BY id");
echo "Total: " . count($produits) . " lignes<br>";
echo "<table border='1'>";
echo "<tr><th>ID</th><th>Nom</th><th>Actif</th></tr>";
foreach ($produits as $p) {
    echo "<tr>";
    echo "<td>" . $p['id'] . "</td>";
    echo "<td>" . $p['nom'] . "</td>";
    echo "<td>" . ($p['actif'] ? "✅" : "❌") . "</td>";
    echo "</tr>";
}
echo "</table>";

// Vérifier les stats
$stats = $db->select("SELECT COUNT(*) as total, SUM(IF(actif=1,1,0)) as actifs FROM produits");
echo "<h3>Statistiques:</h3>";
echo "Total: " . $stats[0]['total'] . "<br>";
echo "Actifs: " . $stats[0]['actifs'] . "<br>";
echo "Inactifs: " . ($stats[0]['total'] - $stats[0]['actifs']) . "<br>";
?>
