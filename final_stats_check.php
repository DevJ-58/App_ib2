<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=gestion_stock', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Statistiques du mois en cours
    $month = date('Y-m');
    $stmt = $pdo->prepare('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM ventes WHERE DATE_FORMAT(date_vente, "%Y-%m") = ?');
    $stmt->execute([$month]);
    $result_month = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Ventes du mois ' . $month . ': ' . $result_month['count'] . ' ventes, total: ' . $result_month['total'] . ' FCFA' . PHP_EOL;

    // Statistiques du jour
    $today = date('Y-m-d');
    $stmt2 = $pdo->prepare('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM ventes WHERE DATE(date_vente) = ?');
    $stmt2->execute([$today]);
    $result_today = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo 'Ventes du jour ' . $today . ': ' . $result_today['count'] . ' ventes, total: ' . $result_today['total'] . ' FCFA' . PHP_EOL;

    // Détail des ventes restantes
    echo PHP_EOL . 'Ventes restantes:' . PHP_EOL;
    $stmt3 = $pdo->query('SELECT id, numero_vente, total, date_vente FROM ventes ORDER BY id');
    while ($row = $stmt3->fetch(PDO::FETCH_ASSOC)) {
        echo 'ID: ' . $row['id'] . ', Num: ' . $row['numero_vente'] . ', Total: ' . $row['total'] . ', Date: ' . $row['date_vente'] . PHP_EOL;
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?>