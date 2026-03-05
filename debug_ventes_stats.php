<?php
/**
 * Debug - Vérification des statistiques de ventes
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Database;

$db = Database::getInstance();

echo "=== ANALYSE DES STATISTIQUES DE VENTES ===\n\n";

// 1. Nombre total de ventes
$totalVentes = $db->selectOne("SELECT COUNT(*) as count FROM ventes")['count'];
echo "📊 Total ventes (tous les temps): " . $totalVentes . "\n";

// 2. Revenue total
$totalRevenue = $db->selectOne("SELECT COALESCE(SUM(total), 0) as total FROM ventes")['total'];
echo "💰 Revenue total: " . number_format($totalRevenue, 0, ',', ' ') . " FCFA\n\n";

// 3. Mois courant
$currentMonth = date('Y-m');
echo "📅 Mois courant: " . $currentMonth . "\n\n";

// 4. Ventes du mois
echo "--- VENTES DU MOIS ---\n";
$monthSales = $db->selectOne("
    SELECT 
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue
    FROM ventes
    WHERE DATE_FORMAT(date_vente, '%Y-%m') = ?
", [$currentMonth]);
echo "Ventes du mois: " . $monthSales['sales_count'] . "\n";
echo "Revenue du mois: " . number_format($monthSales['revenue'], 0, ',', ' ') . " FCFA\n\n";

// 5. Détails des dates
echo "--- DÉTAILS DES DATES ---\n";
$dateDetails = $db->selectAll("
    SELECT 
        COUNT(*) as count,
        DATE_FORMAT(date_vente, '%Y-%m') as mois,
        DATE_FORMAT(date_vente, '%Y-%m-%d') as date,
        GROUP_CONCAT(date_vente) as dates_list
    FROM ventes
    GROUP BY DATE_FORMAT(date_vente, '%Y-%m')
    ORDER BY date_vente DESC
");

foreach ($dateDetails as $detail) {
    echo "Mois: " . $detail['mois'] . " | Ventes: " . $detail['count'] . "\n";
}

echo "\n--- VENTES POUR MARS 2026 ---\n";
$marcVentes = $db->selectAll("
    SELECT id, total, date_vente
    FROM ventes
    WHERE DATE_FORMAT(date_vente, '%Y-%m') = '2026-03'
    LIMIT 10
");

if (empty($marcVentes)) {
    echo "⚠️ Aucune vente trouvée pour mars 2026\n";
} else {
    echo "Ventes trouvées: " . count($marcVentes) . "\n";
    foreach ($marcVentes as $v) {
        echo "- ID: " . $v['id'] . " | Total: " . $v['total'] . " | Date: " . $v['date_vente'] . "\n";
    }
}

echo "\n--- VENTES PAR DATE (dernières 10) ---\n";
$recents = $db->selectAll("
    SELECT id, total, date_vente
    FROM ventes
    ORDER BY id DESC
    LIMIT 10
");

foreach ($recents as $v) {
    echo "- ID: " . $v['id'] . " | Total: " . $v['total'] . " | Date: " . $v['date_vente'] . "\n";
}

echo "\n✅ Test terminé!\n";
