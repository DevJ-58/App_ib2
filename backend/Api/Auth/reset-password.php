<?php
/**
 * Endpoint API - Reset Password (Réinitialiser le mot de passe)
 * POST /Api/Auth/reset-password.php
 */

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../utils/Response.php';

use backend\models\User;
use backend\utils\Security;
use backend\utils\Response;

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
}

// Récupérer les données JSON
$data = Security::getJSONInput();

// Valider les entrées
$telephone = $data['telephone'] ?? null;
$email = $data['email'] ?? null;

// L'utilisateur doit fournir soit le téléphone, soit l'email
if (!$telephone && !$email) {
    Response::validationError([
        'telephone' => 'Le téléphone ou l\'email est requis'
    ]);
}

if ($telephone && !Security::validatePhone($telephone)) {
    Response::validationError([
        'telephone' => 'Le téléphone doit contenir 10 chiffres'
    ]);
}

if ($email && !Security::validateEmail($email)) {
    Response::validationError([
        'email' => 'L\'email n\'est pas valide'
    ]);
}

try {
    $userModel = new User();
    $user = null;

    // Rechercher l'utilisateur
    if ($telephone) {
        $user = $userModel->getByTelephone($telephone);
    } elseif ($email) {
        $user = $userModel->getByEmail($email);
    }

    if (!$user) {
        // Pour la sécurité, ne pas révéler si l'utilisateur existe
        Security::logSecurityEvent('RESET_PASSWORD_NOT_FOUND', ['telephone' => $telephone, 'email' => $email]);
        Response::success(null, 'Si un compte existe avec ces informations, un email de réinitialisation vous a été envoyé');
    }

    // Générer un token de réinitialisation
    $resetToken = Security::generateToken(32);
    $expiresAt = time() + (3600 * 1); // Token valide 1 heure

    // Sauvegarder le token (à implémenter: ajouter colonne reset_token et reset_token_expires dans la DB)
    // Pour maintenant, on simule en session (à améliorer)
    $_SESSION['reset_token'] = $resetToken;
    $_SESSION['reset_token_user_id'] = $user['id'];
    $_SESSION['reset_token_expires'] = $expiresAt;

    // IMPORTANT: En production, envoyer un email avec le lien de réinitialisation
    // mail($user['email'], 'Réinitialisation de mot de passe', 
    //     "Cliquez ici pour réinitialiser votre mot de passe: " . 
    //     "http://yoursite.com/reset.php?token=" . $resetToken);

    Security::logSecurityEvent('RESET_PASSWORD_REQUESTED', ['user_id' => $user['id']]);
    Response::success(null, 'Si un compte existe avec ces informations, un email de réinitialisation vous a été envoyé');

} catch (\Exception $e) {
    Security::logSecurityEvent('RESET_PASSWORD_ERROR', ['error' => $e->getMessage()]);
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
