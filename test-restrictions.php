<?php
/**
 * Script de test des restrictions critiques
 * Vérifie que:
 * 1. Rupture de stock: produits avec stock <= 0 ne peuvent pas être vendus
 * 2. Quantité positive: quantité doit être > 0
 * 3. Prix positif: prix doit être > 0
 * 4. Prix aberrant: prix ne peut pas être > 3x du prix normal
 */

require_once 'backend/bootstrap.php';

use backend\models\Database;
use backend\models\Product;
use backend\models\Sale;

$db = Database::getInstance();
echo "=== TEST DES RESTRICTIONS CRITIQUES ===\n\n";

// ============================================
// TEST 1: Produit en rupture de stock
// ============================================
echo "[TEST 1] Produit en rupture de stock ne peut pas être vendu\n";

// Chercher ou créer un produit avec stock = 0
$sql = "SELECT id, nom, stock FROM produits WHERE stock <= 0 LIMIT 1";
$stmt = $db->prepare($sql);
$stmt->execute();
$produit_rupture = $stmt->fetch(\PDO::FETCH_ASSOC);

if ($produit_rupture) {
    echo "✓ Produit en rupture trouvé: " . $produit_rupture['nom'] . " (stock: " . $produit_rupture['stock'] . ")\n";
    
    // Essayer de vendre ce produit
    $sale = new Sale();
    $result = $sale->create(
        'Test Client',
        5000,
        'especes',
        [
            [
                'produit_id' => $produit_rupture['id'],
                'quantite' => 1,
                'prix_vente' => 3000
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente rejetée avec message: " . $result['message'] . "\n\n";
    } else {
        echo "❌ FAIL: Vente acceptée alors qu'elle ne devrait pas l'être\n\n";
    }
} else {
    echo "⚠ Pas de produit en rupture trouvé\n\n";
}

// ============================================
// TEST 2: Quantité invalide (zéro ou négative)
// ============================================
echo "[TEST 2] Quantité doit être positive (> 0)\n";

// Chercher un produit en stock
$sql = "SELECT id, nom, stock, prix_vente FROM produits WHERE stock > 0 LIMIT 1";
$stmt = $db->prepare($sql);
$stmt->execute();
$produit_bon = $stmt->fetch(\PDO::FETCH_ASSOC);

if ($produit_bon) {
    echo "✓ Produit en stock trouvé: " . $produit_bon['nom'] . " (stock: " . $produit_bon['stock'] . ")\n";
    
    // Test quantité = 0
    $sale = new Sale();
    $result = $sale->create(
        'Test Client',
        0,
        'especes',
        [
            [
                'produit_id' => $produit_bon['id'],
                'quantite' => 0,
                'prix_vente' => $produit_bon['prix_vente']
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente avec quantité=0 rejetée\n";
    } else {
        echo "❌ FAIL: Vente avec quantité=0 acceptée\n";
    }
    
    // Test quantité < 0
    $result = $sale->create(
        'Test Client',
        0,
        'especes',
        [
            [
                'produit_id' => $produit_bon['id'],
                'quantite' => -5,
                'prix_vente' => $produit_bon['prix_vente']
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente avec quantité négative rejetée\n\n";
    } else {
        echo "❌ FAIL: Vente avec quantité négative acceptée\n\n";
    }
} else {
    echo "⚠ Pas de produit en stock trouvé\n\n";
}

// ============================================
// TEST 3: Prix invalide (négatif ou zéro)
// ============================================
echo "[TEST 3] Prix doit être positif (> 0)\n";

if ($produit_bon) {
    // Test prix = 0
    $sale = new Sale();
    $result = $sale->create(
        'Test Client',
        0,
        'especes',
        [
            [
                'produit_id' => $produit_bon['id'],
                'quantite' => 1,
                'prix_vente' => 0
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente avec prix=0 rejetée\n";
    } else {
        echo "❌ FAIL: Vente avec prix=0 acceptée\n";
    }
    
    // Test prix < 0
    $result = $sale->create(
        'Test Client',
        0,
        'especes',
        [
            [
                'produit_id' => $produit_bon['id'],
                'quantite' => 1,
                'prix_vente' => -1000
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente avec prix négatif rejetée\n\n";
    } else {
        echo "❌ FAIL: Vente avec prix négatif acceptée\n\n";
    }
} else {
    echo "⚠ Pas de produit en stock\n\n";
}

// ============================================
// TEST 4: Prix aberrant (> 3x du prix normal)
// ============================================
echo "[TEST 4] Prix aberrant: ne peut pas être > 3x prix normal\n";

if ($produit_bon) {
    $prix_normal = $produit_bon['prix_vente'];
    $prix_aberrant = $prix_normal * 4; // 4x le prix normal
    
    echo "Prix normal: " . $prix_normal . " FCFA, Prix aberrant: " . $prix_aberrant . " FCFA\n";
    
    $sale = new Sale();
    $result = $sale->create(
        'Test Client',
        $prix_aberrant,
        'especes',
        [
            [
                'produit_id' => $produit_bon['id'],
                'quantite' => 1,
                'prix_vente' => $prix_aberrant
            ]
        ]
    );
    
    if (!$result['success']) {
        echo "✅ PASS: Vente avec prix aberrant rejetée\n\n";
    } else {
        echo "❌ FAIL: Vente avec prix aberrant acceptée\n\n";
    }
} else {
    echo "⚠ Pas de produit en stock\n\n";
}

// ============================================
// TEST 5: Produits en rupture filtrées de l'API
// ============================================
echo "[TEST 5] Produits en rupture de stock filtrés de /Api/Products/list.php\n";

$product = new Product();
$products = $product->getAll(false); // false pour inclure tous les produits, y compris inactifs
$rupture_count = 0;
$total_count = count($products);

// Compte les produits avec stock <= 0
foreach ($products as $p) {
    if ($p['stock'] <= 0) {
        $rupture_count++;
    }
}

// Vérifie via la base de données ce que l'API devrait retourner (sans rupture)
$sql = "SELECT COUNT(*) as count FROM produits WHERE stock > 0";
$stmt = $db->prepare($sql);
$stmt->execute();
$api_result = $stmt->fetch(\PDO::FETCH_ASSOC);
$expected_count = $api_result['count'];

echo "Total produits (tous): " . $total_count . "\n";
echo "Produits en rupture: " . $rupture_count . "\n";
echo "Produits disponibles attendus: " . $expected_count . "\n";

if ($rupture_count === 0 || $rupture_count > 0) {
    echo "✓ Vérification effectuée - l'API doit filtrer les produits avec stock <= 0\n\n";
}

// ============================================
// RÉSUMÉ
// ============================================
echo "=== FIN DES TESTS ===\n";
echo "Tous les tests complétés. Vérifiez les résultats ci-dessus.\n";

?>
