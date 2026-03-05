<?php
/**
 * API Endpoint - GET /Api/Reports/chart-top-products.php
 * Données pour le graphique des top 10 produits
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../../configs/database.php';
require_once '../../models/Database.php';

use backend\models\Database;

try {
    ob_clean();
    
    $conn = Database::getInstance()->getConnection();
    
    // Récupérer les top 10 produits les plus vendus
    $sql = "SELECT 
                p.id,
                p.nom as produit,
                SUM(dv.quantite) as quantite_vendue,
                SUM(dv.sous_total) as montant_total,
                COUNT(DISTINCT v.id) as nombre_ventes
            FROM details_ventes dv
            LEFT JOIN ventes v ON dv.vente_id = v.id
            LEFT JOIN produits p ON dv.produit_id = p.id
            WHERE p.nom IS NOT NULL
            GROUP BY p.id, p.nom
            ORDER BY montant_total DESC
            LIMIT 10";
    
    $stmt = $conn->query($sql);
    $produits = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    // Préparer les données pour le graphique
    $labels = [];
    $montants = [];
    $quantites = [];
    
    foreach ($produits as $produit) {
        $labels[] = $produit['produit'];
        $montants[] = (float)$produit['montant_total'];
        $quantites[] = (int)$produit['quantite_vendue'];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Données top produits récupérées',
        'data' => [
            'labels' => $labels,
            'montants' => $montants,
            'quantites' => $quantites,
            'produits' => $produits
        ]
    ]);
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 500,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
