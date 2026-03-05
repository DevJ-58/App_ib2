<?php
/**
 * API Endpoint - GET /Api/Reports/chart-categories.php
 * Données pour le graphique des ventes par catégorie
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
    
    // Récupérer les ventes par catégorie
    $sql = "SELECT 
                c.nom as categorie,
                SUM(dv.sous_total) as montant,
                SUM(dv.quantite) as quantite,
                COUNT(DISTINCT v.id) as nombre_ventes
            FROM details_ventes dv
            LEFT JOIN ventes v ON dv.vente_id = v.id
            LEFT JOIN produits p ON dv.produit_id = p.id
            LEFT JOIN categories c ON p.categorie_id = c.id
            GROUP BY c.id, c.nom
            ORDER BY montant DESC";
    
    $stmt = $conn->query($sql);
    $categories = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    // Préparer les données pour le graphique pie
    $labels = [];
    $montants = [];
    $couleurs = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    foreach ($categories as $index => $cat) {
        $labels[] = $cat['categorie'] ?? 'Non catégorisé';
        $montants[] = (float)$cat['montant'];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Données catégories récupérées',
        'data' => [
            'labels' => $labels,
            'montants' => $montants,
            'couleurs' => array_slice($couleurs, 0, count($labels)),
            'categories' => $categories
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
