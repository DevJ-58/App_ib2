<?php
// Lister toutes les tables

require_once 'backend/configs/database.php';
require_once 'backend/models/Database.php';

$conn = backend\models\Database::getInstance()->getConnection();

$sql = 'SHOW TABLES';
$stmt = $conn->query($sql);
$tables = $stmt->fetchAll(PDO::FETCH_NUM);
$tableNames = array_column($tables, 0);

echo "=== Tables disponibles ===\n";
foreach($tableNames as $table) {
    echo "- $table\n";
}
?>
