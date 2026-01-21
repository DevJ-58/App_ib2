<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // Connexion directe à la base de données
    $host = 'localhost';
    $db = 'gestion_stock';
    $user = 'root';
    $pass = '';
    
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(2, 2);
    
    // Récupérer l'utilisateur depuis la session ou utiliser un défaut
    session_start();
    $utilisateur_id = $_SESSION['user_id'] ?? 1;
    
    // Créer un nouvel inventaire
    $sql = "INSERT INTO inventaires (utilisateur_id, date_inventaire, statut) 
            VALUES (?, NOW(), 'EN_COURS')";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$utilisateur_id]);
    
    $inventaire_id = $conn->lastInsertId();
    
    // Ajouter tous les produits actuels en stock au détail d'inventaire
    $sql_produits = "SELECT id, stock FROM produits WHERE actif = 1";
    $stmt_produits = $conn->prepare($sql_produits);
    $stmt_produits->execute();
    $produits = $stmt_produits->fetchAll(PDO::FETCH_ASSOC);
    
    $sql_insert = "INSERT INTO details_inventaires (inventaire_id, produit_id, stock_theorique, stock_reel, ecart) 
                   VALUES (?, ?, ?, 0, 0)";
    $stmt_insert = $conn->prepare($sql_insert);
    
    foreach ($produits as $produit) {
        $stmt_insert->execute([$inventaire_id, $produit['id'], $produit['stock']]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Inventaire créé avec succès',
        'data' => [
            'id' => $inventaire_id,
            'utilisateur_id' => $utilisateur_id,
            'date_inventaire' => date('Y-m-d H:i:s'),
            'statut' => 'EN_COURS'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

