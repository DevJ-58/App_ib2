<?php
// Test de simulation de l'appel frontend
$url = 'http://localhost/APP_IB/Api/Sales/create.php';

// Simuler les données du panier comme elles arrivent du frontend
$data = [
    'client_nom' => 'Test Client WhatsApp',
    'total' => 400, // 2 * 200 = 400
    'type_paiement' => 'credit',
    'items' => [
        [
            'id' => 13, // Utiliser un produit avec du stock
            'code_barre' => '1234567890123',
            'code_interne' => 'PAIN001',
            'nom' => 'Pain',
            'categorie_id' => 2,
            'prix_achat' => 100,
            'prix_vente' => 200,
            'stock' => 8,
            'seuil_alerte' => 15,
            'icone' => 'fa-bread-slice',
            'photo' => null,
            'actif' => 1,
            'created_at' => '2026-03-05 07:30:00',
            'categorie_nom' => 'Snacks',
            'quantite' => 2
        ]
    ],
    'montant_recu' => 0,
    'montant_rendu' => -400,
    'whatsapp' => '+22501234567'
];

echo "Données simulées du frontend:\n";
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