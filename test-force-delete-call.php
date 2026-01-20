<?php
// Script CLI pour appeler l'API force-delete et afficher l'état de la BD
require_once 'backend/bootstrap.php';
require_once 'backend/models/Database.php';

use backend\models\Database;

if ($argc < 2) {
    echo "Usage: php test-force-delete-call.php <id>\n";
    exit(1);
}

$id = intval($argv[1]);

$opts = [
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query(['id' => $id]),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($opts);
$url = 'http://localhost/APP_IB/backend/Api/Products/force-delete.php';
$response = file_get_contents($url, false, $context);

echo "API Response:\n" . $response . "\n\n";

$db = Database::getInstance();
$stats = $db->select('SELECT COUNT(*) as total, SUM(IF(actif=1,1,0)) as actifs FROM produits');
echo "After API call - Total: " . $stats[0]['total'] . ", Actifs: " . $stats[0]['actifs'] . "\n";

?>