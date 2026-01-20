<?php
// Test POST avec les données fournies par l'utilisateur
$url = 'http://localhost/APP_IB/backend/Api/Auth/register.php';
$data = [
    'nom' => 'DJEBI',
    'prenom' => 'YAX',
    'telephone' => '1111111111',
    'email' => 'yax@gmail.com',
    'mot_de_passe' => '545454',
    'confirm_mot_de_passe' => '545454'
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
$result = @file_get_contents($url, false, $context);
$meta = isset($http_response_header) ? implode("\n", $http_response_header) : '';

echo "=== HTTP HEADERS ===\n";
echo $meta . "\n\n";
echo "=== BODY ===\n";
echo ($result === false ? "(no body)" : $result) . "\n";
?>