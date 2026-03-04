<?php
require_once 'backend/bootstrap.php';

try {
    $pdo = Database::getInstance()->getConnection();
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM produits');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Nombre de produits: ' . $result['count'] . PHP_EOL;

    if ($result['count'] > 0) {
        $stmt = $pdo->query('SELECT id, nom, code_barre FROM produits LIMIT 5');
        $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo 'Premiers produits:' . PHP_EOL;
        foreach ($produits as $p) {
            echo '  - ' . $p['nom'] . ' (code: ' . $p['code_barre'] . ')' . PHP_EOL;
        }
    } else {
        echo 'Aucun produit trouvé. Insertion des données de test...' . PHP_EOL;

        // Insérer les produits de test
        $produits = [
            ['5449000000996', 'COCA001', 'Coca-Cola 50cl', 1, 300, 500, 5, 10, 'fa-bottle-water', 1],
            ['2345678901234', 'PAIN001', 'Pain', 3, 100, 200, 8, 15, 'fa-bread-slice', 1],
            ['3456789012345', 'EAU001', 'Eau minérale 1.5L', 1, 250, 300, 45, 20, 'fa-wine-bottle', 1],
            ['8901234567890', 'CAFE001', 'Café Nescafé', 3, 2000, 2500, 3, 5, 'fa-mug-hot', 1],
            ['4567890123456', 'BISCUIT001', 'Biscuits Golden', 3, 250, 350, 32, 15, 'fa-cookie', 1]
        ];

        $stmt = $pdo->prepare('INSERT INTO produits (code_barre, code_interne, nom, categorie_id, prix_achat, prix_vente, stock, seuil_alerte, icone, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

        foreach ($produits as $p) {
            $stmt->execute($p);
        }

        echo 'Produits de test insérés avec succès !' . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?>