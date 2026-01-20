<?php
/**
 * TestController - Pour tester les APIs produits
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

$action = $_GET['action'] ?? $_POST['action'] ?? null;

echo json_encode([
    'success' => true,
    'action' => $action,
    'message' => 'Test endpoint - pour usage interne',
    'endpoints' => [
        'GET' => [
            'list' => '/Api/Products/list.php',
            'details' => '/Api/Products/details.php?id=1'
        ],
        'POST' => [
            'create' => '/Api/Products/create.php'
        ],
        'PUT' => [
            'update' => '/Api/Products/update.php?id=1'
        ],
        'DELETE' => [
            'delete' => '/Api/Products/delete.php?id=1'
        ]
    ]
]);
?>
