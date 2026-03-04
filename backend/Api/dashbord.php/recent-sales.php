<?php
/**
 * Endpoint API - Ventes Récentes
 * GET /backend/Api/dashbord.php/recent-sales.php
 */

require_once dirname(__DIR__, 2) . '/bootstrap.php';

use backend\utils\Response;

try {
    $db = new PDO('mysql:host=localhost;dbname=gestion_stock', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->query("SELECT id, numero_vente, client_nom, total, date_vente, type_paiement FROM ventes ORDER BY date_vente DESC LIMIT 10");
    $recentSales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les données pour l'affichage
    $formattedSales = array_map(function($sale) {
        return [
            'id' => $sale['id'],
            'numero_vente' => $sale['numero_vente'],
            'client_nom' => $sale['client_nom'],
            'total' => $sale['total'],
            'date_vente' => date('d/m/Y H:i', strtotime($sale['date_vente'])),
            'type_paiement' => $sale['type_paiement']
        ];
    }, $recentSales);

    Response::success($formattedSales, 'Ventes récentes récupérées avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur lors de la récupération des ventes récentes: ' . $e->getMessage());
}
?>
