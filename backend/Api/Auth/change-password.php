<?php
/**
 * Endpoint API - Change Password (Changer le mot de passe)
 * POST /Api/Auth/change-password.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\User;
use backend\utils\Security;
use backend\utils\Response;

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
}

// Vérifier que l'utilisateur est authentifié
if (!isset($_SESSION['user_id'])) {
    Response::unauthorized('Utilisateur non connecté');
}

// Récupérer les données JSON
$data = Security::getJSONInput();

// Valider les champs
$errors = [];
$oldPassword = $data['old_password'] ?? null;
$newPassword = $data['new_password'] ?? null;
$confirmPassword = $data['confirm_password'] ?? null;

if (!$oldPassword) $errors['old_password'] = 'L\'ancien mot de passe est requis';
if (!$newPassword) $errors['new_password'] = 'Le nouveau mot de passe est requis';
if (!$confirmPassword) $errors['confirm_password'] = 'La confirmation du mot de passe est requise';

if (!empty($errors)) {
    Response::validationError($errors);
}

// Vérifier que les nouveaux mots de passe correspondent
if ($newPassword !== $confirmPassword) {
    Response::validationError([
        'confirm_password' => 'Les mots de passe ne correspondent pas'
    ]);
}

try {
    $userModel = new User();
    $user = $userModel->getById($_SESSION['user_id']);

    if (!$user) {
        Response::notFound('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    $result = $userModel->verifierIdentifiants($user['telephone'], $oldPassword);

    if (!$result['success']) {
        Response::error('L\'ancien mot de passe est incorrect', 400);
    }

    // Mettre à jour le mot de passe
    $updateResult = $userModel->update($_SESSION['user_id'], [
        'mot_de_passe' => $newPassword
    ]);

    if (!$updateResult['success']) {
        Response::error($updateResult['message']);
    }

    Security::logSecurityEvent('PASSWORD_CHANGED', ['user_id' => $_SESSION['user_id']]);
    Response::success(null, 'Mot de passe changé avec succès');

} catch (\Exception $e) {
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
