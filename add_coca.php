<?php
require_once 'backend/bootstrap.php';

use backend\models\Product;

$product = new Product();

$data = [
    'code_interne' => 'COCA001',
    'code_barre' => '5449000000996',
    'nom' => 'Coca-Cola 50cl',
    'categorie_id' => 1,
    'prix_achat' => 300,
    'prix_vente' => 500,
    'stock' => 5,
    'seuil_alerte' => 10,
    'icone' => 'fa-bottle-water',
    'actif' => 1
];

try {
    $id = $product->create($data);
    echo 'Produit Coca-Cola ajouté avec ID: ' . $id . PHP_EOL;
} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?></content>
<parameter name="filePath">c:\wamp64\www\APP_IB\add_coca.php