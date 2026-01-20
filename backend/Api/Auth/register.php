<?php
/**
 * Endpoint API - Register (Inscription)
 * POST /Api/Auth/register.php
 */

// Utiliser le bootstrap pour tout charger
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

// Log des données reçues
error_log('REGISTER: Données reçues: ' . json_encode($data));
error_log('REGISTER: Méthode HTTP: ' . $_SERVER['REQUEST_METHOD']);
error_log('REGISTER: Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'undefined'));

// Valider les champs obligatoires
$errors = [];
$nom = $data['nom'] ?? null;
$prenom = $data['prenom'] ?? null;
$telephone = $data['telephone'] ?? null;
$email = $data['email'] ?? null;
$motDePasse = $data['mot_de_passe'] ?? null;
$confirmMotDePasse = $data['confirm_mot_de_passe'] ?? null;

if (!$nom) $errors['nom'] = 'Le nom est requis';
if (!$prenom) $errors['prenom'] = 'Le prénom est requis';
if (!$telephone) $errors['telephone'] = 'Le téléphone est requis';
if (!$email) $errors['email'] = 'L\'email est requis';
if (!$motDePasse) $errors['mot_de_passe'] = 'Le mot de passe est requis';
if (!$confirmMotDePasse) $errors['confirm_mot_de_passe'] = 'La confirmation du mot de passe est requise';

if (!empty($errors)) {
    Response::validationError($errors);
}

// Valider les formats
if (!Security::validatePhone($telephone)) {
    Response::validationError(['telephone' => 'Le téléphone doit contenir 10 chiffres']);
}

if (!Security::validateEmail($email)) {
    Response::validationError(['email' => 'L\'email n\'est pas valide']);
}

// Valider la force du mot de passe
$passwordValidation = Security::validatePassword($motDePasse);
if (!$passwordValidation['valid']) {
    Response::validationError(['mot_de_passe' => $passwordValidation['errors']]);
}

// Vérifier que les mots de passe correspondent
if ($motDePasse !== $confirmMotDePasse) {
    Response::validationError(['confirm_mot_de_passe' => 'Les mots de passe ne correspondent pas']);
}

try {
    $userModel = new User();

    // Vérifier si l'utilisateur existe déjà
    if ($userModel->telephoneExists($telephone)) {
        Response::validationError(['telephone' => 'Un utilisateur avec ce téléphone existe déjà']);
    }

    if ($userModel->emailExists($email)) {
        Response::validationError(['email' => 'Un utilisateur avec cet email existe déjà']);
    }

    // Créer l'utilisateur
    $createResult = $userModel->create([
        'nom' => Security::sanitize($nom),
        'prenom' => Security::sanitize($prenom),
        'telephone' => $telephone,
        'email' => Security::sanitize($email),
        'mot_de_passe' => $motDePasse,
        'role' => 'vendeur',
        'photo' => null
    ]);

    if (!$createResult['success']) {
        Security::logSecurityEvent('REGISTER_FAILED', ['telephone' => $telephone]);
        Response::error($createResult['message']);
    }

    // Récupérer l'utilisateur créé
    $user = $userModel->getById($createResult['id']);

    // Créer une session utilisateur
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_telephone'] = $user['telephone'];
    $_SESSION['logged_in_at'] = time();

    Security::logSecurityEvent('REGISTER_SUCCESS', ['user_id' => $user['id']]);
    Response::success($user, 'Inscription réussie, vous êtes maintenant connecté', 201);

} catch (\Exception $e) {
    Security::logSecurityEvent('REGISTER_ERROR', ['error' => $e->getMessage()]);
    Response::serverError('Erreur lors de l\'inscription: ' . $e->getMessage());
}
?>
