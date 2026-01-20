<?php
/**
 * Endpoint API - Login (Connexion)
 * POST /Api/Auth/login.php
 */

require_once __DIR__ . '/../../bootstrap.php';

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
$motDePasse = $data['mot_de_passe'] ?? null;

if (!$telephone || !$motDePasse) {
    Response::validationError([
        'telephone' => !$telephone ? 'Le téléphone est requis' : null,
        'mot_de_passe' => !$motDePasse ? 'Le mot de passe est requis' : null
    ]);
}

// Valider le format du téléphone
if (!Security::validatePhone($telephone)) {
    Response::validationError([
        'telephone' => 'Le téléphone doit contenir 10 chiffres'
    ]);
}

try {
    $userModel = new User();
    $result = $userModel->verifierIdentifiants($telephone, $motDePasse);

    if (!$result['success']) {
        Security::logSecurityEvent('LOGIN_FAILED', ['telephone' => $telephone]);
        Response::unauthorized($result['message']);
    }

    // Créer une session utilisateur
    $_SESSION['user_id'] = $result['user']['id'];
    $_SESSION['user_role'] = $result['user']['role'];
    $_SESSION['user_telephone'] = $result['user']['telephone'];
    $_SESSION['logged_in_at'] = time();
    
    // Forcer la sauvegarde de la session sur disque
    session_write_close();
    session_start();
    
    error_log('LOGIN: ===== SESSION CRÉÉE =====');
    error_log('LOGIN: PHPSESSID=' . session_id());
    error_log('LOGIN: user_id=' . $_SESSION['user_id']);
    error_log('LOGIN: $_SESSION=' . json_encode($_SESSION));
    error_log('LOGIN: Headers envoyés: Set-Cookie should follow');

    Security::logSecurityEvent('LOGIN_SUCCESS', ['user_id' => $result['user']['id']]);
    Response::success($result['user'], 'Connexion réussie');

} catch (\Exception $e) {
    Security::logSecurityEvent('LOGIN_ERROR', ['error' => $e->getMessage()]);
    Response::serverError('Erreur lors de la connexion: ' . $e->getMessage());
}
?>
