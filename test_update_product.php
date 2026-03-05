<?php
/**
 * Test de mise à jour d'un produit
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Product;

try {
    $product = new Product();

    // Tester la mise à jour d'un produit existant
    $testData = [
        'nom' => 'Produit Test Modifié',
        'categorie_id' => 1,
        'prix_vente' => 15.50,
        'stock' => 25,
        'seuil_alerte' => 5
    ];

    echo "Test de mise à jour du produit ID 2...\n";
    echo "Données: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

    $result = $product->update(2, $testData);

    if ($result > 0) {
        echo "✅ Mise à jour réussie! $result ligne(s) affectée(s)\n";

        // Vérifier le résultat
        $updated = $product->getById(2);
        echo "Produit mis à jour:\n";
        echo json_encode($updated, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "❌ Aucune ligne affectée\n";
    }

} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>