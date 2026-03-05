<?php
// Test de rejet des prix aberrants
$url = 'http://localhost/APP_IB/Api/Sales/create.php';

$data = [
    'client_nom' => 'Test Prix Aberrant',
    'total' => 15000, // 1 * 15000
    'type_paiement' => 'comptant',
    'items' => [
        [
            'produit_id' => 13, // Pain (prix normal 200)
            'quantite' => 1,
            'prix_vente' => 15000 // Prix aberrant (> 3x 200 = 600)
        ]
    ],
    'montant_recu' => 15000,
    'montant_rendu' => 0
];

echo "Test de rejet des prix aberrants:\n";
echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Réponse:\n";
echo $result . "\n";
?>