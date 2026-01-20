<?php
require_once 'backend/models/Database.php';
use backend\models\Database;
$db = Database::getInstance();
$res = $db->select('SELECT id FROM produits WHERE actif = 1 ORDER BY id LIMIT 1');
if (count($res) > 0) echo $res[0]['id'] . PHP_EOL; else echo "NONE\n";
?>