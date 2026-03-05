<?php
/**
 * API Endpoint - GET /Api/Sales/chart-7days.php
 * Données pour le graphique des ventes des 7 derniers jours
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
    
    // Récupérer les ventes des 7 derniers jours groupées par jour
    $sql = "SELECT 
                DATE(date_vente) as date,
                SUM(total) as montant,
                COUNT(*) as nombre_ventes
            FROM ventes
            WHERE date_vente >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(date_vente)
            ORDER BY DATE(date_vente)";
    
    $stmt = $conn->query($sql);
    $ventes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    // Formater les dates et créer le tableau pour le graphique
    $dates = [];
    $montants = [];
    $nombres = [];
    
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $dateFormatee = date('d/m', strtotime($date));
        
        $found = false;
        foreach ($ventes as $vente) {
            if ($vente['date'] === $date) {
                $dates[] = $dateFormatee;
                $montants[] = (float)$vente['montant'];
                $nombres[] = (int)$vente['nombre_ventes'];
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $dates[] = $dateFormatee;
            $montants[] = 0;
            $nombres[] = 0;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'code' => 200,
        'message' => 'Données 7 jours récupérées',
        'data' => [
            'dates' => $dates,
            'montants' => $montants,
            'nombres' => $nombres
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
