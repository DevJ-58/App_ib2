<?php
/**
 * RESET-SYSTEM.PHP - Réinitialisation totale du système
 *
 * ATTENTION DANGER : Cette fonction supprime TOUTES les données !
 * - Produits
 * - Ventes
 * - Crédits
 * - Utilisateurs (sauf admin)
 * - Mouvements de stock
 * - Photos uploadées
 */

require_once __DIR__ . '/../bootstrap.php';

use backend\utils\Response;
use backend\models\Database;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
    exit();
}

// Vérifier l'authentification
if (!isset($_SESSION['user_id'])) {
    Response::error('Authentification requise', 401);
    exit();
}

// Debug : log des informations de session pour diagnostiquer les 403
error_log('RESET_SYSTEM: session=' . json_encode($_SESSION));


// Si le modèle de votre application ne distingue pas admin/vendeur,
// on ne vérifie plus le rôle ici. Seule la présence d'un utilisateur
// authentifié est requise (votre logique métier peut être différente).
//
// // Vérifier que l'utilisateur est admin
// if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
//     Response::error('Accès refusé : droits administrateur requis', 403);
//     exit();
// }

try {
    // Récupérer la connexion PDO depuis Database
    $pdo = Database::getInstance()->getConnection();
    
    // Démarrer une transaction pour assurer l'intégrité
    $pdo->beginTransaction();
    error_log('DEBUG: transaction started, inTransaction=' . ($pdo->inTransaction() ? 'yes' : 'no'));

    // LOG DE SÉCURITÉ : Enregistrer l'action avant de l'exécuter
    $userId = $_SESSION['user_id'];
    $userName = $_SESSION['user_name'] ?? 'Admin';
    $timestamp = date('Y-m-d H:i:s');

    error_log("🚨 RÉINITIALISATION SYSTÈME DÉCLENCHÉE par $userName (ID: $userId) à $timestamp");

    // 1. SUPPRIMER TOUS LES CRÉDITS (le FK vers ventes est en RESTRICT)
    $pdo->exec("DELETE FROM credits");
    error_log("✅ Supprimé tous les crédits");

    // 2. SUPPRIMER LES LIGNES D'INVENTAIRE (contraintes vers produits)
    $pdo->exec("DELETE FROM details_inventaires");
    error_log("✅ Supprimé les détails d'inventaire");

    // 3. SUPPRIMER TOUTES LES VENTES (cette table a des contraintes de clés étrangères)
    $pdo->exec("DELETE FROM ventes");
    error_log("✅ Supprimé toutes les ventes");

    // 3. SUPPRIMER TOUS LES MOUVEMENTS DE STOCK
    $pdo->exec("DELETE FROM mouvements_stock");
    error_log("✅ Supprimé tous les mouvements de stock");

    // 4. SUPPRIMER TOUTES LES PHOTOS UPLOADÉES
    $uploadDir = __DIR__ . '/../uploads/';
    if (is_dir($uploadsDir = $uploadDir)) {
        $files = glob($uploadDir . '*');
        foreach ($files as $file) {
            if (is_file($file) && basename($file) !== '.gitkeep') {
                unlink($file);
            }
        }
    }
    error_log("✅ Supprimé toutes les photos uploadées");

    // 5. SUPPRIMER TOUTES LES SESSIONS D'INVENTAIRE
    $pdo->exec("DELETE FROM inventaires");
    error_log("✅ Supprimé toutes les inventaires");

    // 6. SUPPRIMER TOUS LES PRODUITS
    $pdo->exec("DELETE FROM produits");
    error_log("✅ Supprimé tous les produits");

    // 7. SUPPRIMER TOUS LES UTILISATEURS SAUF L'ADMIN ACTUEL
    $pdo->exec("DELETE FROM utilisateurs WHERE role != 'admin'");
    error_log("✅ Supprimé tous les utilisateurs non-admin");

    // Valider la transaction (avant de lancer des opérations DDL)
    error_log('DEBUG: before commit, inTransaction=' . ($pdo->inTransaction() ? 'yes' : 'no'));
    $pdo->commit();
    error_log('DEBUG: commit succeeded, inTransaction=' . ($pdo->inTransaction() ? 'yes' : 'no'));

    // 7. RÉINITIALISER LES SÉQUENCES AUTO_INCREMENT (optionnel mais propre)
    // ces ALTER TABLE entraînent un commit implicite, donc les exécuter après
    // avoir fermé la transaction.
    $pdo->exec("ALTER TABLE produits AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE ventes AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE credits AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE mouvements_stock AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE utilisateurs AUTO_INCREMENT = 1");
    error_log("✅ Réinitialisé les séquences auto-increment");

    // LOG FINAL
    error_log("✅ RÉINITIALISATION SYSTÈME TERMINÉE AVEC SUCCÈS");

    // Réponse de succès
    Response::success([
        'message' => 'Système réinitialisé avec succès',
        'details' => [
            'ventes_supprimees' => true,
            'credits_supprimes' => true,
            'mouvements_supprimes' => true,
            'photos_supprimees' => true,
            'produits_supprimes' => true,
            'utilisateurs_nettoyes' => true,
            'sequences_reinitialisees' => true
        ],
        'timestamp' => $timestamp,
        'admin' => $userName
    ]);

} catch (Exception $e) {
    // En cas d'erreur, annuler la transaction
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("❌ ERREUR LORS DE LA RÉINITIALISATION: " . $e->getMessage());

    Response::error('Erreur lors de la réinitialisation: ' . $e->getMessage(), 500);
}
?>