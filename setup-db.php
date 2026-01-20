<?php
/**
 * Script pour créer la base de données automatiquement
 */

// Connexion sans base de données d'abord
$conn = new mysqli('localhost', 'root', '', '');

if ($conn->connect_error) {
    die('Erreur connexion: ' . $conn->connect_error);
}

echo "<h2>Création de la base de données</h2>\n";

// Lire le fichier schema.sql
$schema = file_get_contents('database/schema.sql');

// Exécuter le script ligne par ligne
$lines = explode(';', $schema);
$count = 0;

foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '--') === 0) continue;
    
    if ($conn->query($line) === true) {
        $count++;
        echo "✅ Exécuté: " . substr($line, 0, 50) . "...\n";
    } else {
        echo "❌ Erreur: " . $conn->error . "\n";
        echo "   Ligne: " . $line . "\n";
    }
}

echo "\n<p style='color: green;'><strong>Base créée avec succès ! ($count instructions exécutées)</strong></p>\n";

// Vérifier les tables
$result = $conn->query("SHOW TABLES FROM gestion_stock");
echo "<h3>Tables créées:</h3>\n<ul>\n";
while ($row = $result->fetch_row()) {
    echo "<li>" . $row[0] . "</li>\n";
}
echo "</ul>\n";

$conn->close();
?>
