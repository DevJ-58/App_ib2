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
    $produit_id = $input['produit_id'] ?? null;
    $stock_reel = intval($input['stock_reel'] ?? 0);
    
    if (!$inventaire_id || !$produit_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
        exit;
    }
    
    // ✅ VALIDATION: Le stock réel ne peut pas être négatif
    if ($stock_reel < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le stock réel ne peut pas être négatif']);
        exit;
    }
    
    // Récupérer le stock théorique
    $sql = "SELECT stock_theorique FROM details_inventaires 
            WHERE inventaire_id = ? AND produit_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$inventaire_id, $produit_id]);
    $detail = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$detail) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Détail d\'inventaire non trouvé']);
        exit;
    }
    
    $stock_theorique = $detail['stock_theorique'];
    $ecart = $stock_reel - $stock_theorique;
    
    // Mettre à jour le stock réel et l'écart
    $sql_update = "UPDATE details_inventaires 
                   SET stock_reel = ?, ecart = ?
                   WHERE inventaire_id = ? AND produit_id = ?";
    
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->execute([$stock_reel, $ecart, $inventaire_id, $produit_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Produit ajouté à l\'inventaire',
        'data' => [
            'stock_reel' => $stock_reel,
            'ecart' => $ecart
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
