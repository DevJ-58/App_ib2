<?php
header('Content-Type: application/json');

try {
    // Configuration de connexion
    $dsn = 'mysql:host=localhost;port=3306;dbname=gestion_stock;charset=utf8mb4';
    $pdo = new PDO($dsn, 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // Récupérer les inventaires
    $sql = "SELECT 
                i.id,
                i.date_inventaire,
                i.utilisateur_id,
                u.nom as utilisateur_nom,
                i.commentaire,
                i.statut
            FROM inventaires i
            LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
            ORDER BY i.date_inventaire DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $inventaires = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Inventaires récupérés avec succès',
        'data' => $inventaires,
        'count' => count($inventaires)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => 500
    ]);
}
?>
