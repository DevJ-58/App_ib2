<?php
require_once 'backend/bootstrap.php';

use backend\models\Product;

$product = new Product();

// Insérer quelques produits de test
$produitsTest = [
    [
        'code_interne' => 'P001',
        'code_barre' => '5449000000001',
        'nom' => 'Coca-Cola 1.5L',
        'categorie_id' => 1,
        'prix_achat' => 120,
        'prix_vente' => 200,
        'stock' => 50,
        'seuil_alerte' => 10,
        'icone' => 'fa-bottle-water',
        'actif' => 1
    ],
    [
        'code_interne' => 'P002',
        'code_barre' => '5449000000002',
        'nom' => 'Sprite 1.5L',
        'categorie_id' => 1,
        'prix_achat' => 120,
        'prix_vente' => 200,
        'stock' => 35,
        'seuil_alerte' => 10,
        'icone' => 'fa-bottle-water',
        'actif' => 1
    ],
    [
        'code_interne' => 'P003',
        'code_barre' => '5449000000003',
        'nom' => 'Chips Lay\'s 40g',
        'categorie_id' => 2,
        'prix_achat' => 50,
        'prix_vente' => 100,
        'stock' => 8,
        'seuil_alerte' => 15,
        'icone' => 'fa-bag-shopping',
        'actif' => 1
    ]
];

foreach ($produitsTest as $data) {
    try {
        $id = $product->create($data);
        echo "✅ Produit créé: {$data['nom']} (ID: $id)\n";
    } catch (Exception $e) {
        echo "❌ Erreur: " . $e->getMessage() . "\n";
    }
}

echo "\nProduits dans la BDD:\n";
$tous = $product->getAll(false);
echo json_encode($tous, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
?>
