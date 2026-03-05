<?php
require 'backend/bootstrap.php';
use backend\models\Database;

$db = Database::getInstance();

// Vérifier les ventes récentes
$stmt = $db->prepare('SELECT id, numero_vente, total, date_vente FROM ventes ORDER BY date_vente DESC LIMIT 5');
$stmt->execute();
$ventes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "VENTES RÉCENTES:\n";
foreach ($ventes as $v) {
    echo "  ID: {$v['id']}, Num: {$v['numero_vente']}, Total: {$v['total']}, Date: {$v['date_vente']}\n";
    
    // Afficher les détails de chaque vente
    $stmt_details = $db->prepare('SELECT produit_id, nom_produit, quantite, prix_unitaire FROM details_ventes WHERE vente_id = ?');
    $stmt_details->execute([$v['id']]);
    $details = $stmt_details->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($details as $d) {
        echo "    - {$d['nom_produit']}: {$d['quantite']} x {$d['prix_unitaire']}\n";
    }
}

echo "\nSTOCK ACTUEL:\n";
$stmt = $db->prepare('SELECT id, nom, stock FROM produits WHERE stock > 0');
$stmt->execute();
$produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($produits as $p) {
    echo "  {$p['nom']}: {$p['stock']}\n";
}

?>
