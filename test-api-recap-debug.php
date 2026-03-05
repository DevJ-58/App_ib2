<?php
// Test l'API recap-day.php plus précisément

echo "=== TEST API recap-day.php (avec debug) ===\n";

// Test 1: Vérifier que la page se charge
$url = 'http://localhost/APP_IB/backend/Api/Sales/recap-day.php';
echo "URL: $url\n";

$ctx = stream_context_create([
    'http' => [
        'timeout' => 5,
        'ignore_errors' => true  // Retourner la réponse même en cas d'erreur
    ]
]);

$response = @file_get_contents($url, false, $ctx);
if ($response === false) {
    echo "❌ Erreur: Impossible de se connecter à l'URL\n";
    echo "Vérifiez que le serveur est en cours d'exécution (WAMP64)\n";
} else {
    echo "Status: " . (isset($http_response_header) ? $http_response_header[0] : 'unknown') . "\n";
    echo "Response length: " . strlen($response) . " bytes\n";
    echo "Response (first 500 chars):\n";
    echo substr($response, 0, 500) . "\n";
    
    // Essayer de décoder le JSON
    $data = json_decode($response, true);
    if ($data) {
        echo "\n✅ JSON valide\n";
        echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
        if (isset($data['data'])) {
            echo "Data:\n";
            print_r($data['data']);
        }
    } else {
        echo "\n❌ Pas du JSON valide\n";
        echo "JSON Error: " . json_last_error_msg() . "\n";
    }
}
?>
