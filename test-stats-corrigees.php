<?php
$json = json_decode(file_get_contents('http://localhost/APP_IB/backend/Api/Sales/list.php'), true);
$totalVentes = 0;
$totalArticles = 0;
$produitsUniques = [];

foreach($json['data'] as $v) {
    $totalVentes += floatval($v['montant_total']);
    $totalArticles += intval($v['quantite_totale']);
    
    // Compter les produits uniques
    $produits = array_map('trim', explode(',', $v['descriptions']));
    foreach($produits as $p) {
        if ($p) {
            $produitsUniques[$p] = 1;
        }
    }
}

$nbTransactions = count($json['data']);
$ticketMoyen = $totalVentes / $nbTransactions;
$margin30 = $totalVentes * 0.30;

echo "Total ventes: " . number_format($totalVentes, 2) . " FCFA\n";
echo "Nombre transactions: $nbTransactions\n";
echo "Ticket moyen: " . number_format($ticketMoyen, 2) . " FCFA\n";
echo "Marge 30%: " . number_format($margin30, 2) . " FCFA\n";
echo "Total articles: $totalArticles\n";
echo "Produits différents: " . count($produitsUniques) . "\n";
echo "\nProduits uniques:\n";
print_r(array_keys($produitsUniques));
?>
