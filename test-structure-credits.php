<?php
// Vérifier la structure de la table credits

require_once 'backend/configs/database.php';
require_once 'backend/models/Database.php';

$conn = backend\models\Database::getInstance()->getConnection();

echo "=== Structure de la table 'credits' ===\n";
$sql = 'DESCRIBE credits';
$stmt = $conn->query($sql);
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($cols as $col) {
    echo $col['Field'] . ' - ' . $col['Type'] . "\n";
}

echo "\n=== Structure de la table 'mouvements_credits' ===\n";
$sql = 'DESCRIBE mouvements_credits';
$stmt = $conn->query($sql);
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($cols as $col) {
    echo $col['Field'] . ' - ' . $col['Type'] . "\n";
}
?>
