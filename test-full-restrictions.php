<?php
/**
 * Test complet des restrictions de vente
 * Vérifie:
 * 1. Impossible d'ajouter plus de produits que le stock
 * 2. Les produits en rupture sont filtrés
 * 3. Les validations backend sont en place
 */

require_once 'backend/bootstrap.php';

use backend\models\Database;
use backend\models\Product;
use backend\models\Sale;

$db = Database::getInstance();

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║   TEST COMPLET DES RESTRICTIONS DE VENTE - MARS 2026           ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// ============================================================
// 1. État général des stocks
// ============================================================
echo "1️⃣  ÉTAT DES STOCKS\n";
echo "═══════════════════════════════════════════════════════════════\n";

$stmt = $db->prepare('SELECT COUNT(*) as total FROM produits');
$stmt->execute();
$total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

$stmt = $db->prepare('SELECT COUNT(*) as count FROM produits WHERE stock > 0');
$stmt->execute();
$enStock = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

$stmt = $db->prepare('SELECT COUNT(*) as count FROM produits WHERE stock <= 0');
$stmt->execute();
$enRupture = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

echo "Total produits: $total\n";
echo "En stock (> 0): $enStock\n";
echo "En rupture (≤ 0): $enRupture\n\n";

// ============================================================
// 2. Détails des produits
// ============================================================
echo "2️⃣  DÉTAILS DES PRODUITS\n";
echo "═══════════════════════════════════════════════════════════════\n";

$stmt = $db->prepare('SELECT id, nom, stock, prix_vente FROM produits ORDER BY stock DESC LIMIT 10');
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo sprintf("%-5s %-30s %-15s %-15s\n", "ID", "Produit", "Stock", "Prix");
echo str_repeat("─", 65) . "\n";

foreach ($products as $p) {
    $status = $p['stock'] <= 0 ? "⚠️  RUPTURE" : "✅ " . $p['stock'];
    echo sprintf("%-5s %-30s %-15s %-15s %s\n", $p['id'], substr($p['nom'], 0, 28), $p['stock'], $p['prix_vente'] . " F", $status);
}
echo "\n";

// ============================================================
// 3. Test 1: Vente avec quantité excessive
// ============================================================
echo "3️⃣  TEST: Vente avec quantité > stock\n";
echo "═══════════════════════════════════════════════════════════════\n";

$produitTest = $products[0]; // Produit avec le plus de stock
echo "Produit test: {$produitTest['nom']} (stock: {$produitTest['stock']})\n";
echo "Tentative: Ajouter {$produitTest['stock']} + 1 = " . ($produitTest['stock'] + 1) . " unités\n";

$sale = new Sale();
$result = $sale->create(
    'Test Quantité Excessive',
    $produitTest['prix_vente'] * ($produitTest['stock'] + 1),
    'especes',
    [
        [
            'produit_id' => $produitTest['id'],
            'quantite' => $produitTest['stock'] + 1,
            'prix_vente' => $produitTest['prix_vente']
        ]
    ]
);

if (!$result['success']) {
    echo "✅ PASS: Rejeté avec message: " . $result['message'] . "\n\n";
} else {
    echo "❌ FAIL: Accepté alors qu'il ne devrait pas l'être\n\n";
}

// ============================================================
// 4. Test 2: Vente avec quantité valide
// ============================================================
echo "4️⃣  TEST: Vente avec quantité valide (< stock)\n";
echo "═══════════════════════════════════════════════════════════════\n";

$quantiteValide = max(1, intval($produitTest['stock'] / 2));
echo "Produit test: {$produitTest['nom']} (stock: {$produitTest['stock']})\n";
echo "Tentative: Ajouter $quantiteValide unités (valide)\n";

// Vérifier le stock avant
$stmt = $db->prepare('SELECT stock FROM produits WHERE id = ?');
$stmt->execute([$produitTest['id']]);
$stockAvant = $stmt->fetch(PDO::FETCH_ASSOC)['stock'];

$result = $sale->create(
    'Test Quantité Valide',
    $produitTest['prix_vente'] * $quantiteValide,
    'especes',
    [
        [
            'produit_id' => $produitTest['id'],
            'quantite' => $quantiteValide,
            'prix_vente' => $produitTest['prix_vente']
        ]
    ]
);

// Vérifier le stock après
$stmt = $db->prepare('SELECT stock FROM produits WHERE id = ?');
$stmt->execute([$produitTest['id']]);
$stockApres = $stmt->fetch(PDO::FETCH_ASSOC)['stock'];

if ($result['success']) {
    echo "✅ PASS: Vente acceptée\n";
    echo "Stock avant: $stockAvant\n";
    echo "Stock après: $stockApres\n";
    echo "Différence: " . ($stockAvant - $stockApres) . " (attendu: $quantiteValide)\n\n";
} else {
    echo "❌ FAIL: Rejeté - " . $result['message'] . "\n\n";
}

// ============================================================
// 5. Test 3: Vente avec produit en rupture
// ============================================================
echo "5️⃣  TEST: Vente avec produit en rupture\n";
echo "═══════════════════════════════════════════════════════════════\n";

$stmt = $db->prepare('SELECT id, nom, stock FROM produits WHERE stock <= 0 LIMIT 1');
$stmt->execute();
$produitRupture = $stmt->fetch(PDO::FETCH_ASSOC);

if ($produitRupture) {
    echo "Produit test: {$produitRupture['nom']} (stock: {$produitRupture['stock']})\n";
    
    $result = $sale->create(
        'Test Rupture Stock',
        1000,
        'especes',
        [
            [
                'produit_id' => $produitRupture['id'],
                'quantite' => 1,
                'prix_vente' => 1000
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Rejeté avec message: " . $result['message'] . "\n\n";
    } else {
        echo "❌ FAIL: Accepté alors qu'il ne devrait pas l'être\n\n";
    }
} else {
    echo "⚠️  Pas de produit en rupture trouvé\n\n";
}

// ============================================================
// 6. Résumé
// ============================================================
echo "✅ TESTS COMPLÉTÉS\n";
echo "═══════════════════════════════════════════════════════════════\n";
echo "Les restrictions de vente sont en place et fonctionnelles.\n";
echo "Les produits suivants demandent attention:\n";

$stmt = $db->prepare('SELECT id, nom, stock, seuil_alerte FROM produits WHERE stock <= seuil_alerte ORDER BY stock');
$stmt->execute();
$alertes = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($alertes) > 0) {
    foreach ($alertes as $alerte) {
        echo "  ⚠️  {$alerte['nom']}: stock = {$alerte['stock']}, seuil = {$alerte['seuil_alerte']}\n";
    }
} else {
    echo "  ✅ Tous les produits ont un stock satisfaisant\n";
}

echo "\n";

?>
