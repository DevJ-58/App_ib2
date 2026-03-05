<?php
// Test des APIs de graphiques

echo "=== TEST API chart-7days.php ===\n";
$response1 = @file_get_contents('http://localhost/APP_IB/backend/Api/Sales/chart-7days.php', false, stream_context_create(['http' => ['timeout' => 5]]));
if ($response1) {
    $data = json_decode($response1, true);
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    if ($data['success']) {
        echo "Dates: " . implode(', ', $data['data']['dates']) . "\n";
        echo "Montants: " . implode(', ', $data['data']['montants']) . "\n";
    }
} else {
    echo "❌ Erreur de connexion\n";
}

echo "\n=== TEST API chart-ca.php ===\n";
$response2 = @file_get_contents('http://localhost/APP_IB/backend/Api/Reports/chart-ca.php', false, stream_context_create(['http' => ['timeout' => 5]]));
if ($response2) {
    $data = json_decode($response2, true);
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    if ($data['success']) {
        echo "Mois: " . implode(', ', array_slice($data['data']['mois'], 0, 3)) . "\n";
        echo "Premier montant: " . $data['data']['montants'][0] . "\n";
    }
} else {
    echo "❌ Erreur de connexion\n";
}

echo "\n=== TEST API chart-categories.php ===\n";
$response3 = @file_get_contents('http://localhost/APP_IB/backend/Api/Reports/chart-categories.php', false, stream_context_create(['http' => ['timeout' => 5]]));
if ($response3) {
    $data = json_decode($response3, true);
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    if ($data['success']) {
        echo "Catégories: " . implode(', ', array_slice($data['data']['labels'], 0, 3)) . "\n";
        echo "Nombre de catégories: " . count($data['data']['labels']) . "\n";
    }
} else {
    echo "❌ Erreur de connexion\n";
}

echo "\n=== TEST API chart-top-products.php ===\n";
$response4 = @file_get_contents('http://localhost/APP_IB/backend/Api/Reports/chart-top-products.php', false, stream_context_create(['http' => ['timeout' => 5]]));
if ($response4) {
    $data = json_decode($response4, true);
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    if ($data['success']) {
        echo "Top produits: " . implode(', ', array_slice($data['data']['labels'], 0, 3)) . "\n";
        echo "Nombre de produits: " . count($data['data']['labels']) . "\n";
    }
} else {
    echo "❌ Erreur de connexion\n";
}
?>
