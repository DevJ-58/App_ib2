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

    // Sauvegarder le token en base
    $userModel->setResetToken($user['id'], $resetToken, $expiresAt);

    // Construire le lien de réinitialisation
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    
    // Extraire le chemin depuis REQUEST_URI et recalculer vers frontend
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/APP_IB/backend/Api/Auth/reset-password.php';
    // Si on est dans /APP_IB/backend/Api/Auth/reset-password.php, on veut /APP_IB/frontend/HTML/reset_confirm.html
    preg_match('#(/[^/]+)?/backend/Api/Auth/reset-password\.php#', $requestUri, $matches);
    $appPath = $matches[1] ?? '/APP_IB';
    $resetLink = $protocol . '://' . $host . $appPath . '/frontend/HTML/reset_confirm.html?token=' . urlencode($resetToken);

    // Essayer d'envoyer l'email via PHPMailer si disponible
    $mailConfig = [];
    $mailCfgPath = __DIR__ . '/../../configs/mail.php';
    if (file_exists($mailCfgPath)) {
        $mailConfig = require $mailCfgPath;
    }

    $emailSent = false;
    $sendError = null;

    if (file_exists(__DIR__ . '/../../../vendor/autoload.php')) {
        try {
            require_once __DIR__ . '/../../../vendor/autoload.php';
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $mailConfig['smtp_host'] ?? 'localhost';
            $mail->SMTPAuth = true;
            $mail->Username = $mailConfig['smtp_user'] ?? '';
            $mail->Password = $mailConfig['smtp_pass'] ?? '';
            $mail->SMTPSecure = $mailConfig['smtp_secure'] ?? 'tls';
            $mail->Port = $mailConfig['smtp_port'] ?? 587;
            $mail->setFrom($mailConfig['from_email'] ?? $mailConfig['smtp_user'] ?? 'no-reply@example.com', $mailConfig['from_name'] ?? 'Support');
            $mail->addAddress($user['email']);
            $mail->isHTML(true);
            $mail->Subject = 'Réinitialisation de votre mot de passe';
            $mail->Body = "Bonjour,<br/><br/>Cliquez sur le lien suivant pour réinitialiser votre mot de passe:<br/><a href=\"{$resetLink}\">{$resetLink}</a><br/><br/>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.";
            $emailSent = $mail->send();
        } catch (Exception $e) {
            $sendError = $e->getMessage();
            $emailSent = false;
        }
    } else {
        // Fallback natif
        $subject = 'Réinitialisation de votre mot de passe';
        $message = "Cliquez sur le lien pour réinitialiser: {$resetLink}";
        $headers = 'From: ' . ($mailConfig['from_email'] ?? 'no-reply@example.com') . "\r\n";
        $emailSent = @mail($user['email'], $subject, $message, $headers);
    }

    Security::logSecurityEvent('RESET_PASSWORD_REQUESTED', ['user_id' => $user['id'], 'email_sent' => $emailSent, 'error' => $sendError]);
    Response::success(null, 'Si un compte existe avec ces informations, un email de réinitialisation vous a été envoyé');

} catch (\Exception $e) {
    Security::logSecurityEvent('RESET_PASSWORD_ERROR', ['error' => $e->getMessage()]);
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
