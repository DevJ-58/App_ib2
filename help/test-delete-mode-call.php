<?php
// Appel POST à delete.php avec mode=hard
if ($argc < 2) { echo "Usage: php test-delete-mode-call.php <id>\n"; exit(1); }
$id = intval($argv[1]);
$opts = [ 'http' => [ 'method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => http_build_query(['id'=>$id,'mode'=>'hard']), 'ignore_errors'=>true ] ];
$context = stream_context_create($opts);
$url = 'http://localhost/APP_IB/backend/Api/Products/delete.php';
$res = file_get_contents($url,false,$context);
echo "API response:\n".$res."\n";
require_once 'backend/models/Database.php';
use backend\models\Database;
$db = Database::getInstance();
$stats = $db->select('SELECT COUNT(*) as total, SUM(IF(actif=1,1,0)) as actifs FROM produits');
echo "After call - Total: " . $stats[0]['total'] . ", Actifs: " . $stats[0]['actifs'] . "\n";
?>