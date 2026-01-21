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
    
    $inventaire_id = $_GET['id'] ?? null;
    
    if (!$inventaire_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID inventaire manquant']);
        exit;
    }
    
    // Récupérer les détails d'un inventaire avec les infos produits
    $sql = "SELECT 
                di.id,
                di.inventaire_id,
                di.produit_id,
                di.stock_theorique,
                di.stock_reel,
                di.ecart,
                p.nom as produit_nom,
                p.prix_vente
            FROM details_inventaires di
            LEFT JOIN produits p ON di.produit_id = p.id
            WHERE di.inventaire_id = ?
            ORDER BY p.nom ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$inventaire_id]);
    $details = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Détails récupérés avec succès',
        'data' => $details
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
