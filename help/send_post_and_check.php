<?php
require_once 'backend/bootstrap.php';
require_once 'backend/models/Database.php';
require_once 'backend/models/User.php';

use backend\models\Database;
use backend\models\User;

$timestamp = time();
$phone = '07' . substr($timestamp . rand(100,999), 0, 8); // unique-ish
$email = 'auto' . $timestamp . '@example.com';

$data = [
    'nom' => 'Auto',
    'prenom' => 'Test',
    'telephone' => $phone,
    'email' => $email,
    'mot_de_passe' => 'Test1234',
    'confirm_mot_de_passe' => 'Test1234'
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true,
    ],
];
$context  = stream_context_create($options);
$url = 'http://localhost/APP_IB/backend/Api/Auth/register.php';

echo "Envoi inscription: phone={$phone}, email={$email}\n";

$response = @file_get_contents($url, false, $context);
$headers = isset($http_response_header) ? implode("\n", $http_response_header) : '';

echo "--- HTTP HEADERS ---\n" . $headers . "\n\n";
echo "--- BODY ---\n" . ($response === false ? '(no body)' : $response) . "\n\n";

// Maintenant vérifier en base
$db = Database::getInstance();
$users = $db->select("SELECT id, nom, prenom, telephone, email FROM utilisateurs WHERE telephone = :tel OR email = :email", [':tel' => $phone, ':email' => $email]);

echo "--- Recherche en BD ---\n";
if (empty($users)) {
    echo "Aucun utilisateur trouvé pour ces identifiants.\n";
} else {
    foreach ($users as $u) {
        echo "ID: {$u['id']} - {$u['prenom']} {$u['nom']} ({$u['telephone']}) [{$u['email']}]\n";
    }
}

?>