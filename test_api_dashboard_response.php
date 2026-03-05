<?php
/**
 * Test API - Vérification réponse stats dashboard
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Database;
use backend\models\Product;
use backend\models\Sale;
use backend\models\Credit;
use backend\models\Movement;

try {
    $db = Database::getInstance();
    $product = new Product();
    $sale = new Sale();
    $credit = new Credit();
    $movement = new Movement();

    echo "=== TEST RÉPONSE API DASHBOARD STATS ===\n\n";

    // Statistiques des ventes
    $totalSales = $db->selectOne("SELECT COUNT(*) as count FROM ventes")['count'];
    $totalRevenue = $db->selectOne("SELECT COALESCE(SUM(total), 0) as total FROM ventes")['total'];

    // Statistiques des crédits
    $creditStats = $credit->getStats();

    // Statistiques des ventes du mois en cours
    $currentMonth = date('Y-m');
    echo "📅 Mois courant: " . $currentMonth . "\n\n";
    
    $monthStats = $db->selectOne("
        SELECT
            COUNT(*) as sales_count,
            COALESCE(SUM(total), 0) as revenue
        FROM ventes
        WHERE DATE_FORMAT(date_vente, '%Y-%m') = ?
    ", [$currentMonth]);

    echo "📊 monthStats (avant utilisation):\n";
    var_dump($monthStats);
    echo "\n";

    echo "ventes du mois - nombre: " . $monthStats['sales_count'] . "\n";
    echo "ventes du mois - revenue: " . $monthStats['revenue'] . "\n\n";

    // Construction de la réponse
    $stats = [
        'total_products' => (int)1,
        'total_sales' => (int)$totalSales,
        'total_revenue' => (float)$totalRevenue,
        'stockValeurTotal' => (float)0,
        'stockNombreProduits' => (int)1,
        'stockAlertes' => (int)0,
        'creditsTotalEncours' => (float)0,
        'creditsNombre' => (int)0,
        'creditsRecouvrement' => (float)0,
        'ventesTotalMois' => (float)$monthStats['revenue'], // Ventes du mois en cours
        'ventesNombre' => (int)$monthStats['sales_count'], // Nombre de ventes du mois
        'ventesParnier' => (int)($monthStats['sales_count'] > 0 ? round($monthStats['revenue'] / $monthStats['sales_count']) : 0), // Panier moyen du mois
        'alertesNombre' => (int)0,
        'today_sales' => (int)0,
        'today_revenue' => (float)0
    ];

    echo "📊 Stats retournées (JSON):\n";
    echo json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

    echo "✅ Test terminé! Vérifiez les valeurs ci-dessus\n";

} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
