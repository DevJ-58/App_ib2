<?php
require_once __DIR__ . '/backend/bootstrap.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query('SELECT id, nom, stock FROM produits LIMIT 5');
    $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo 'Produits disponibles:' . PHP_EOL;
    foreach ($produits as $p) {
        echo 'ID: ' . $p['id'] . ', Nom: ' . $p['nom'] . ', Stock: ' . $p['stock'] . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
?>