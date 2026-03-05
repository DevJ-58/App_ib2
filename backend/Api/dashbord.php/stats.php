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
            COALESCE(SUM(prix_vente * stock), 0) as total_value,
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

    // Statistiques des crédits du mois en cours
    $monthCreditsStats = $db->selectOne("
        SELECT
            COUNT(CASE WHEN statut = 'en_cours' THEN 1 END) as active_credits,
            COALESCE(SUM(montant_total), 0) as total_amount
        FROM credits
        WHERE DATE_FORMAT(date_credit, '%Y-%m') = ?
    ", [$currentMonth]);

    // Statistiques des ventes du mois en cours
    $currentMonth = date('Y-m');
    $monthStats = $db->selectOne("
        SELECT
            COUNT(*) as sales_count,
            COALESCE(SUM(total), 0) as revenue
        FROM ventes
        WHERE DATE_FORMAT(date_vente, '%Y-%m') = ?
    ", [$currentMonth]);

    $stats = [
        'total_products' => (int)$totalProducts,
        'total_sales' => (int)$totalSales,
        'total_revenue' => (float)$totalRevenue,
        'stockValeurTotal' => (float)$stockStats['total_value'],
        'stockNombreProduits' => (int)$totalProducts,
        'stockAlertes' => (int)$stockStats['low_stock_count'],
        'creditsTotalEncours' => (float)$monthCreditsStats['total_amount'], // Crédits du mois en cours
        'creditsNombre' => (int)$monthCreditsStats['active_credits'], // Nombre de crédits actifs du mois
        'creditsRecouvrement' => (float)$monthCreditsStats['total_amount'], // Total des crédits du mois àrecouvrer
        'ventesTotalMois' => (float)$monthStats['revenue'], // Ventes du mois en cours
        'ventesNombre' => (int)$monthStats['sales_count'], // Nombre de ventes du mois
        'ventesParnier' => (int)($monthStats['sales_count'] > 0 ? round($monthStats['revenue'] / $monthStats['sales_count']) : 0), // Panier moyen du mois
        'alertesNombre' => (int)$stockStats['low_stock_count'],
        'today_sales' => (int)$todayStats['sales_count'],
        'today_revenue' => (float)$todayStats['revenue']
    ];

    Response::success($stats, 'Statistiques récupérées avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur lors de la récupération des statistiques: ' . $e->getMessage());
}
?>
