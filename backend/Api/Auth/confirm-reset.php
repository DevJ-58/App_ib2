<?php
/**
 * confirm-reset.php
 *
 * Endpoint pour finaliser la réinitialisation du mot de passe via token
 *
 * POST /Api/Auth/confirm-reset.php
 * Body: { "token": "...", "new_password": "..." }
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\User;
use backend\utils\Security;
use backend\utils\Response;

header('Content-Type: application/json');

// Vérifier méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
}

$body = Security::getJSONInput();
$token = $body['token'] ?? null;
$newPassword = $body['new_password'] ?? null;

if (!$token || !$newPassword) {
    Response::validationError([
        'token' => $token ? null : 'Token requis',
        'new_password' => $newPassword ? null : 'Nouveau mot de passe requis'
    ]);
}

// Vérifier force du mot de passe (par ex. longueur 6+)
if (strlen($newPassword) < 6) {
    Response::validationError(['new_password' => 'Le mot de passe doit contenir au moins 6 caractères']);
}

try {
    $userModel = new User();
    $user = $userModel->getByResetToken($token);
    if (!$user) {
        Response::error('Token invalide ou expiré', 400);
    }

    // Appliquer nouveau mot de passe
    $userModel->resetPasswordWithToken($token, $newPassword);

    Security::logSecurityEvent('RESET_PASSWORD_COMPLETED', ['user_id' => $user['id']]);
    Response::success(null, 'Mot de passe réinitialisé avec succès');

} catch (\Exception $e) {
    Security::logSecurityEvent('RESET_PASSWORD_CONFIRM_ERROR', ['error' => $e->getMessage()]);
    Response::serverError('Erreur serveur: ' . $e->getMessage());
}
?>
