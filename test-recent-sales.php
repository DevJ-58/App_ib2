<?php
require_once 'backend/bootstrap.php';

try {
    echo "Bootstrap loaded successfully\n";

    $db = new PDO('mysql:host=localhost;dbname=gestion_stock', 'root', '');
    echo "Database connected\n";

    $stmt = $db->query("SELECT COUNT(*) as count FROM ventes");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Query executed: " . $result['count'] . " ventes\n";

    $stmt = $db->query("SELECT id, numero_vente, client_nom, total, date_vente, type_paiement FROM ventes ORDER BY date_vente DESC LIMIT 10");
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Recent sales: " . json_encode($sales);

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>