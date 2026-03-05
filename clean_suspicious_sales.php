<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=gestion_stock', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Identifier les ventes suspectes (prix > 5x le prix normal)
    echo 'Ventes suspectes à supprimer:' . PHP_EOL;
    $stmt = $pdo->query('
        SELECT v.id, v.numero_vente, v.total, dv.nom_produit, dv.prix_unitaire, p.prix_vente as prix_normal
        FROM ventes v
        JOIN details_ventes dv ON v.id = dv.vente_id
        JOIN produits p ON dv.produit_id = p.id
        WHERE dv.prix_unitaire > p.prix_vente * 2  -- Prix > 2x le prix normal
        ORDER BY v.id
    ');

    $ventesSuspectes = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $ventesSuspectes[] = $row['id'];
        echo 'ID: ' . $row['id'] . ', Num: ' . $row['numero_vente'] . ', Total: ' . $row['total'] . ', Produit: ' . $row['nom_produit'] . ', Prix facturé: ' . $row['prix_unitaire'] . ', Prix normal: ' . $row['prix_normal'] . PHP_EOL;
    }

    if (count($ventesSuspectes) > 0) {
        echo PHP_EOL . 'Suppression des ventes suspectes...' . PHP_EOL;

        // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
        foreach ($ventesSuspectes as $id) {
            // Supprimer les mouvements de stock
            $pdo->exec("DELETE FROM mouvements_stock WHERE motif LIKE '%vente%' AND DATE(date_mouvement) = (SELECT DATE(date_vente) FROM ventes WHERE id = $id)");

            // Supprimer les détails de vente
            $pdo->exec("DELETE FROM details_ventes WHERE vente_id = $id");

            // Supprimer la vente
            $pdo->exec("DELETE FROM ventes WHERE id = $id");

            echo 'Vente ID ' . $id . ' supprimée' . PHP_EOL;
        }

        // Recalculer les stocks
        echo PHP_EOL . 'Recalcul des stocks...' . PHP_EOL;
        $pdo->exec('
            UPDATE produits
            SET stock = (
                SELECT COALESCE(SUM(quantite), 0)
                FROM mouvements_stock
                WHERE produit_id = produits.id AND type = "entree"
            ) - (
                SELECT COALESCE(SUM(quantite), 0)
                FROM mouvements_stock
                WHERE produit_id = produits.id AND type = "sortie"
            )
        ');

        echo 'Nettoyage terminé!' . PHP_EOL;
    } else {
        echo 'Aucune vente suspecte trouvée.' . PHP_EOL;
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?>