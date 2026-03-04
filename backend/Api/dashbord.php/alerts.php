<?php
/**
 * Endpoint API - Alertes du Dashboard
 * GET /backend/Api/dashbord.php/alerts.php
 */

require_once dirname(__DIR__, 2) . '/bootstrap.php';

use backend\utils\Response;

try {
    $db = new PDO('mysql:host=localhost;dbname=gestion_stock', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $alerts = [];

    // Alertes de stock faible - utiliser la colonne 'stock' de produits
    $stmt = $db->query("SELECT id, nom, stock, seuil_alerte FROM produits WHERE actif = 1");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as $product) {
        $stock = (int)$product['stock'];
        $seuil = (int)$product['seuil_alerte'];

        if ($stock <= $seuil && $stock > 0) {
            $alerts[] = [
                'type' => 'stock_faible',
                'niveau' => 'warning',
                'message' => "Stock faible: {$product['nom']} (Quantité: {$stock})",
                'produit_id' => $product['id']
            ];
        }

        if ($stock == 0) {
            $alerts[] = [
                'type' => 'rupture_stock',
                'niveau' => 'danger',
                'message' => "Rupture de stock: {$product['nom']}",
                'produit_id' => $product['id']
            ];
        }
    }

    // Alertes de crédits en retard
    $stmt = $db->query("SELECT id, client_nom, date_credit FROM credits WHERE statut = 'en_cours'");
    $credits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($credits as $credit) {
        $dateCredit = strtotime($credit['date_credit']);
        $now = time();
        $daysDiff = floor(($now - $dateCredit) / (60 * 60 * 24));

        // Crédit de plus de 30 jours
        if ($daysDiff > 30) {
            $alerts[] = [
                'type' => 'credit_retard',
                'niveau' => 'warning',
                'message' => "Crédit en retard: {$credit['client_nom']} - {$daysDiff} jours",
                'credit_id' => $credit['id']
            ];
        }
    }

    Response::success($alerts, 'Alertes récupérées avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur lors de la récupération des alertes: ' . $e->getMessage());
}
?>
                $alerts[] = [
                    'type' => 'credit_retard',
                    'niveau' => 'warning',
                    'message' => "Crédit en retard: {$credit['client_nom']} - {$daysDiff} jours",
                    'credit_id' => $credit['id']
                ];
            }
        }
    }

    Response::success($alerts, 'Alertes récupérées avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur lors de la récupération des alertes: ' . $e->getMessage());
}
?>
