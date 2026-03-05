<?php
/**
 * Test des statistiques corrigées
 */

// Inclure les fichiers nécessaires
require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Database;
use backend\models\Product;
use backend\models\Sale;
use backend\models\Credit;
use backend\models\Movement;
use backend\utils\Response;

try {
    $db = Database::getInstance();
    $product = new Product();
    $sale = new Sale();
    $credit = new Credit();
    $movement = new Movement();

    echo "=== TEST DES STATISTIQUES CORRIGÉES ===\n\n";

    // Statistiques des crédits (vraies données)
    $creditStats = $credit->getStats();
    echo "📊 Statistiques Crédits (depuis modèle):\n";
    echo "   - Nombre total de crédits: " . ($creditStats['nombre_credits'] ?? 0) . "\n";
    echo "   - Crédits impayés: " . ($creditStats['credits_impayés'] ?? 0) . "\n";
    echo "   - Crédits soldés: " . ($creditStats['credits_saldés'] ?? 0) . "\n";
    echo "   - Montant total dû: " . number_format($creditStats['montant_total_dû'] ?? 0, 0, ',', ' ') . " FCFA\n";
    echo "   - Montant restant dû: " . number_format($creditStats['montant_restant_dû'] ?? 0, 0, ',', ' ') . " FCFA\n";
    echo "   - Montant total payé: " . number_format($creditStats['montant_total_payé'] ?? 0, 0, ',', ' ') . " FCFA\n\n";

    // Statistiques du dashboard
    $totalProducts = $db->selectOne("SELECT COUNT(*) as count FROM produits WHERE actif = 1")['count'];
    $totalSales = $db->selectOne("SELECT COUNT(*) as count FROM ventes")['count'];
    $totalRevenue = $db->selectOne("SELECT COALESCE(SUM(total), 0) as total FROM ventes")['total'];

    $stockStats = $db->selectOne("
        SELECT
            COALESCE(SUM(prix_vente * stock), 0) as total_value,
            COUNT(CASE WHEN stock <= seuil_alerte THEN 1 END) as low_stock_count
        FROM produits
        WHERE actif = 1
    ");

    $currentMonth = date('Y-m');
    $monthStats = $db->selectOne("
        SELECT
            COUNT(*) as sales_count,
            COALESCE(SUM(total), 0) as revenue
        FROM ventes
        WHERE DATE_FORMAT(date_vente, '%Y-%m') = ?
    ", [$currentMonth]);

    echo "📊 Statistiques Dashboard:\n";
    echo "   - Total produits: " . $totalProducts . "\n";
    echo "   - Total ventes: " . $totalSales . "\n";
    echo "   - Chiffre d'affaires total: " . number_format($totalRevenue, 0, ',', ' ') . " FCFA\n";
    echo "   - Valeur stock total: " . number_format($stockStats['total_value'], 0, ',', ' ') . " FCFA\n";
    echo "   - Produits en alerte stock: " . $stockStats['low_stock_count'] . "\n";
    echo "   - Ventes du mois: " . $monthStats['sales_count'] . " (" . number_format($monthStats['revenue'], 0, ',', ' ') . " FCFA)\n";
    echo "   - Crédits en cours (montant restant): " . number_format($creditStats['montant_restant_dû'] ?? 0, 0, ',', ' ') . " FCFA\n";
    echo "   - Nombre crédits impayés: " . ($creditStats['credits_impayés'] ?? 0) . "\n\n";

    echo "✅ Test terminé avec succès !\n";

} catch (\Exception $e) {
    echo "❌ Erreur lors du test: " . $e->getMessage() . "\n";
}