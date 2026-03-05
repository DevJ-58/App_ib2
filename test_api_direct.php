<?php
// Test direct pour voir si l'API reçoit les données
$url = 'http://localhost/APP_IB/Api/Sales/create.php';

$data = [
    'client_nom' => 'Test Direct',
    'total' => 600, // 2 * 300 = 600
    'type_paiement' => 'comptant',
    'items' => [
        [
            'produit_id' => 14, // Eau minérale
            'quantite' => 2,
            'prix_vente' => 300
        ]
    ],
    'montant_recu' => 600,
    'montant_rendu' => 0
];

echo "Test direct - Données à envoyer:\n";
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

echo "Réponse de l'API:\n";
echo $result . "\n";
?>