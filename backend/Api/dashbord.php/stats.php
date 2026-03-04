<?php
/**
 * Endpoint API - Statistiques du Dashboard
 * GET /backend/Api/dashbord.php/stats.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Database;
use backend\utils\Response;

try {
    $db = Database::getInstance();

    // Statistiques des produits
    $totalProducts = $db->selectOne("SELECT COUNT(*) as count FROM produits WHERE actif = 1")['count'];

    // Statistiques des ventes
    $totalSales = $db->selectOne("SELECT COUNT(*) as count FROM ventes")['count'];
    $totalRevenue = $db->selectOne("SELECT COALESCE(SUM(total), 0) as total FROM ventes")['total'];

    // Statistiques des stocks
    $stockStats = $db->selectOne("
        SELECT
            COALESCE(SUM(prix_achat * stock), 0) as total_value,
            COUNT(CASE WHEN stock <= seuil_alerte THEN 1 END) as low_stock_count
        FROM produits
        WHERE actif = 1
    ");

    // Statistiques des crédits
    $creditStats = $db->selectOne("
        SELECT
            COUNT(CASE WHEN statut = 'en_cours' THEN 1 END) as active_credits,
            COALESCE(SUM(montant_total), 0) as total_amount
        FROM credits
    ");

    // Statistiques des ventes du jour
    $today = date('Y-m-d');
    $todayStats = $db->selectOne("
        SELECT
            COUNT(*) as sales_count,
            COALESCE(SUM(total), 0) as revenue
        FROM ventes
        WHERE DATE(date_vente) = ?
    ", [$today]);

    $stats = [
        'total_products' => (int)$totalProducts,
        'total_sales' => (int)$totalSales,
        'total_revenue' => (float)$totalRevenue,
        'total_stock_value' => (float)$stockStats['total_value'],
        'low_stock_alerts' => (int)$stockStats['low_stock_count'],
        'active_credits' => (int)$creditStats['active_credits'],
        'total_credit_amount' => (float)$creditStats['total_amount'],
        'today_sales' => (int)$todayStats['sales_count'],
        'today_revenue' => (float)$todayStats['revenue']
    ];

    Response::success($stats, 'Statistiques récupérées avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur lors de la récupération des statistiques: ' . $e->getMessage());
}
?>
