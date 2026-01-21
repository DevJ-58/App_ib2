<?php
$json = json_decode(file_get_contents('http://localhost/APP_IB/backend/Api/Sales/list.php'), true);
$total = 0;
$count = 0;
$articles = 0;

foreach($json['data'] as $v) {
    $total += floatval($v['montant_total']);
    $articles += intval($v['quantite_totale']);
    $count++;
}

echo "Total ventes: " . number_format($total, 2) . " FCFA\n";
echo "Nombre transactions: $count\n";
echo "Total articles: $articles\n";
echo "Ticket moyen: " . number_format($total/$count, 2) . " FCFA\n";
echo "Marge 30%: " . number_format($total * 0.30, 2) . " FCFA\n";
?>
