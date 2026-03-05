<?php
/**
 * Test de l'endpoint stats du dashboard
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Database;

try {
    $db = Database::getInstance();

    // Statistiques des produits
    $totalProducts = $db->selectOne("SELECT COUNT(*) as count FROM produits WHERE actif = 1")['count'];

    // Statistiques des stocks
    $stockStats = $db->selectOne("
        SELECT
            COALESCE(SUM(prix_vente * stock), 0) as total_value,
            COUNT(CASE WHEN stock <= seuil_alerte THEN 1 END) as low_stock_count
        FROM produits
        WHERE actif = 1
    ");

    echo "=== TEST STATS DASHBOARD ===\n\n";
    echo "Total produits actifs: " . $totalProducts . "\n";
    echo "Valeur totale du stock (prix_vente): " . $stockStats['total_value'] . " FCFA\n";
    echo "Produits en stock critique: " . $stockStats['low_stock_count'] . "\n\n";

    // Vérifier les produits
    echo "Détails des produits:\n";
    $produits = $db->select("SELECT id, nom, stock, prix_vente, seuil_alerte FROM produits WHERE actif = 1");
    foreach ($produits as $p) {
        echo "- " . $p['nom'] . ": " . $p['stock'] . " × " . $p['prix_vente'] . " = " . ($p['stock'] * $p['prix_vente']) . " FCFA\n";
    }

} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>