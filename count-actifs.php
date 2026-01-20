<?php
require_once 'backend/models/Database.php';
use backend\models\Database;

$db = Database::getInstance();
$res = $db->select('SELECT COUNT(*) as count FROM produits WHERE actif = true');
echo "Produits ACTIFS EN BD: " . $res[0]['count'];
?>
