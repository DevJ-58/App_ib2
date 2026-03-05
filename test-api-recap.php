<?php
// Test l'API recap-day.php et recent.php

echo "=== TEST API recap-day.php ===\n";
$ctx = stream_context_create(['http' => ['timeout' => 5]]);
$response = @file_get_contents('http://localhost/APP_IB/backend/Api/Sales/recap-day.php', false, $ctx);
if ($response !== false) {
    echo $response . "\n";
} else {
    echo "❌ Erreur de connexion\n";
}

echo "\n=== TEST API recent.php ===\n";
$response2 = @file_get_contents('http://localhost/APP_IB/backend/Api/Sales/recent.php', false, $ctx);
if ($response2 !== false) {
    $data = json_decode($response2, true);
    echo "Count: " . ($data['count'] ?? 0) . "\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    if ($data['success'] && isset($data['data'])) {
        echo "Nombre de ventes: " . count($data['data']) . "\n";
        if (count($data['data']) > 0) {
            echo "Première vente:\n";
            print_r(array_slice($data['data'][0], 0, 3));
        }
    }
} else {
    echo "❌ Erreur de connexion\n";
}
?>
