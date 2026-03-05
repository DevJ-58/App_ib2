<?php
/**
 * API Endpoint - GET /Api/Reports/chart-ca.php
 * Données pour le graphique d'évolution du chiffre d'affaires
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
    
    // Récupérer les ventes mensuelles de l'année en cours
    $annee = date('Y');
    $sql = "SELECT 
                MONTH(date_vente) as mois,
                MONTHNAME(date_vente) as nom_mois,
                SUM(total) as montant,
                COUNT(*) as nombre_ventes
            FROM ventes
            WHERE YEAR(date_vente) = ?
            GROUP BY MONTH(date_vente), MONTHNAME(date_vente)
            ORDER BY MONTH(date_vente)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$annee]);
    $ventes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    // Créer les données pour tous les 12 mois
    $mois_noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    $montants = array_fill(0, 12, 0);
    $nombres = array_fill(0, 12, 0);
    
    foreach ($ventes as $vente) {
        $index = (int)$vente['mois'] - 1;
        $montants[$index] = (float)$vente['montant'];
        $nombres[$index] = (int)$vente['nombre_ventes'];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Données CA récupérées',
        'data' => [
            'mois' => $mois_noms,
            'montants' => $montants,
            'nombres' => $nombres,
            'annee' => $annee
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
