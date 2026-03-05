<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=gestion_stock', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Total des ventes
    $stmt = $pdo->query('SELECT COUNT(*) as count, SUM(total) as total FROM ventes');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Total ventes: ' . $result['count'] . ', Montant: ' . $result['total'] . PHP_EOL;

    // Ventes du mois
    $stmt2 = $pdo->query('SELECT COUNT(*) as count, SUM(total) as total FROM ventes WHERE MONTH(date_vente) = MONTH(CURDATE()) AND YEAR(date_vente) = YEAR(CURDATE())');
    $result2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo 'Ventes du mois: ' . $result2['count'] . ', Montant: ' . $result2['total'] . PHP_EOL;

    // Détail des ventes avec montants élevés
    echo PHP_EOL . 'Ventes avec montants élevés:' . PHP_EOL;
    $stmt4 = $pdo->query('SELECT id, numero_vente, total, date_vente FROM ventes WHERE total >= 10000 ORDER BY total DESC');
    while ($row = $stmt4->fetch(PDO::FETCH_ASSOC)) {
        echo 'ID: ' . $row['id'] . ', Num: ' . $row['numero_vente'] . ', Total: ' . $row['total'] . ', Date: ' . $row['date_vente'] . PHP_EOL;
    }

    // Vérifier le produit Agwaa
    echo PHP_EOL . 'Produit Agwaa:' . PHP_EOL;
    $stmt6 = $pdo->query('SELECT * FROM produits WHERE nom = "Agwaa"');
    $produit = $stmt6->fetch(PDO::FETCH_ASSOC);
    if ($produit) {
        echo 'ID: ' . $produit['id'] . ', Nom: ' . $produit['nom'] . ', Prix achat: ' . $produit['prix_achat'] . ', Prix vente: ' . $produit['prix_vente'] . ', Stock: ' . $produit['stock'] . PHP_EOL;
        
    // Vérifier la vente ID 2
    echo PHP_EOL . 'Détails de la vente ID 2:' . PHP_EOL;
    $stmt8 = $pdo->query('SELECT * FROM details_ventes WHERE vente_id = 2');
    while ($row = $stmt8->fetch(PDO::FETCH_ASSOC)) {
        echo 'Produit: ' . $row['nom_produit'] . ', Qté: ' . $row['quantite'] . ', Prix: ' . $row['prix_unitaire'] . PHP_EOL;
    }
    } else {
        echo 'Produit Agwaa non trouvé' . PHP_EOL;
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?>