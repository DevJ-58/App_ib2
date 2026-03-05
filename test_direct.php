<?php
// Test direct de l'API
$url = 'http://localhost/APP_IB/Api/Sales/create.php';

$data = [
    'client_nom' => 'Test Client',
    'total' => 400, // 2 * 200 = 400
    'type_paiement' => 'comptant',
    'items' => [
        [
            'produit_id' => 13, // Pain
            'quantite' => 2,
            'prix_vente' => 200
        ]
    ],
    'montant_recu' => 500,
    'montant_rendu' => 100
];

echo "Données à envoyer:\n";
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