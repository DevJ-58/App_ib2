<?php
$url = 'http://localhost/APP_IB/backend/Api/Auth/register.php';
$data = [
    'nom' => 'CliTest',
    'prenom' => 'Jean',
    'telephone' => '0987654321',
    'email' => 'clitest'.time().'@example.com',
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
$result = @file_get_contents($url, false, $context);
$meta = isset($http_response_header) ? implode("\n", $http_response_header) : '';

echo "=== HTTP HEADERS ===\n";
echo $meta . "\n\n";
echo "=== BODY ===\n";
echo ($result === false ? "(no body)" : $result) . "\n";
