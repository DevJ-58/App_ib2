<?php
/**
 * Endpoint API - Logout (Déconnexion)
 * POST /Api/Auth/logout.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\utils\Response;
use backend\utils\Security;

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
}

// Vérifier que l'utilisateur est authentifié
if (!isset($_SESSION['user_id'])) {
    Response::unauthorized('Utilisateur non connecté');
}

$userId = $_SESSION['user_id'];

// Logger AVANT de détruire la session
try {
    Security::logSecurityEvent('LOGOUT_SUCCESS', ['user_id' => $userId]);
} catch (\Exception $e) {
    error_log('Erreur logging logout: ' . $e->getMessage());
}

// Détruire la session
session_destroy();

Response::success(null, 'Déconnexion réussie');
?>
