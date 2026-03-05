<?php
require_once __DIR__ . '/backend/bootstrap.php';

$db = new backend\models\Database();

// Total de toutes les ventes
$result = $db->selectOne('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM ventes');
echo 'Nombre de ventes: ' . $result['count'] . PHP_EOL;
echo 'Total des ventes: ' . $result['total'] . PHP_EOL;

// Ventes du mois en cours
$month = date('Y-m');
$result_month = $db->selectOne('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM ventes WHERE DATE_FORMAT(date_vente, "%Y-%m") = ?', [$month]);
echo 'Ventes du mois ' . $month . ': ' . $result_month['count'] . ' ventes, total: ' . $result_month['total'] . PHP_EOL;

// Détail des ventes récentes
echo PHP_EOL . 'Dernières ventes:' . PHP_EOL;
$sales = $db->select('SELECT id, numero_vente, total, date_vente FROM ventes ORDER BY date_vente DESC LIMIT 10');
foreach ($sales as $sale) {
    echo 'ID: ' . $sale['id'] . ', Numéro: ' . $sale['numero_vente'] . ', Total: ' . $sale['total'] . ', Date: ' . $sale['date_vente'] . PHP_EOL;
}
?>