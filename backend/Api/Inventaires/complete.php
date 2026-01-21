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
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $inventaire_id = $input['inventaire_id'] ?? null;
    
    if (!$inventaire_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID inventaire manquant']);
        exit;
    }
    
    // Mettre à jour le statut de l'inventaire à TERMINE
    $sql = "UPDATE inventaires SET statut = 'TERMINE' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$inventaire_id]);
    
    // Récupérer les écarts et appliquer les ajustements aux stocks
    $sql_details = "SELECT produit_id, stock_reel, ecart FROM details_inventaires 
                    WHERE inventaire_id = ? AND ecart != 0";
    $stmt_details = $conn->prepare($sql_details);
    $stmt_details->execute([$inventaire_id]);
    $details = $stmt_details->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($details as $detail) {
        // Mettre à jour le stock des produits en fonction des écarts
        $sql_update = "UPDATE produits SET stock = ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->execute([$detail['stock_reel'], $detail['produit_id']]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Inventaire terminé avec succès',
        'data' => [
            'inventaire_id' => $inventaire_id,
            'statut' => 'TERMINE',
            'ajustements_appliques' => count($details)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
