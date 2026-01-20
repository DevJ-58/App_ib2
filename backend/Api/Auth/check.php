<?php
/**
 * Endpoint API - Check Session (Vérifier la session)
 * GET /Api/Auth/check.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\User;
use backend\utils\Response;

error_log('CHECK: ===== CHECK.PHP CALLED =====');
error_log('CHECK: Method=' . $_SERVER['REQUEST_METHOD']);
error_log('CHECK: PHPSESSID=' . session_id());
error_log('CHECK: $_SESSION=' . json_encode($_SESSION));
error_log('CHECK: $_COOKIE=' . json_encode($_COOKIE));

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_log('CHECK: Méthode invalide');
    Response::error('Méthode non autorisée', 405);
}

// Vérifier si l'utilisateur est authentifié
if (!isset($_SESSION['user_id'])) {
    error_log('CHECK: Session inactive - pas de user_id');
    Response::unauthorized('Aucune session active');
}

try {
    $userId = $_SESSION['user_id'];
    error_log('CHECK: Récupération user_id=' . $userId);
    
    $userModel = new User();
    $user = $userModel->getById($userId);

    if (!$user) {
        error_log('CHECK: User non trouvé dans BD');
        session_destroy();
        Response::unauthorized('Utilisateur non trouvé');
    }

    error_log('CHECK: User trouvé: ' . json_encode($user));
    Response::success($user, 'Utilisateur authentifié');

} catch (\Exception $e) {
    error_log('CHECK: Exception - ' . $e->getMessage());
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
