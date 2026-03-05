<?php
/**
 * Test des données des produits et calcul de la valeur totale
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Product;

try {
    $product = new Product();

    // Récupérer tous les produits
    $produits = $product->getAll();

    echo "=== DONNÉES DES PRODUITS ===\n\n";

    $totalProduits = count($produits);
    echo "Nombre total de produits: $totalProduits\n\n";

    $valeurTotale = 0;

    foreach ($produits as $index => $p) {
        echo "Produit #" . ($index + 1) . ":\n";
        echo "  ID: " . $p['id'] . "\n";
        echo "  Nom: " . $p['nom'] . "\n";
        echo "  Stock: " . $p['stock'] . "\n";
        echo "  Prix vente: " . $p['prix_vente'] . "\n";
        echo "  Categorie: " . ($p['categorie_nom'] ?? 'N/A') . "\n";

        // Calcul de la valeur pour ce produit
        $stock = intval($p['stock'] ?? 0);
        $prix = floatval($p['prix_vente'] ?? 0);
        $valeurProduit = $stock * $prix;

        echo "  Valeur calculée: $valeurProduit FCFA (stock: $stock × prix: $prix)\n\n";

        $valeurTotale += $valeurProduit;
    }

    echo "=== RÉSULTAT ===\n";
    echo "Valeur totale du stock: $valeurTotale FCFA\n";
    echo "Nombre de produits: $totalProduits\n";

} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>