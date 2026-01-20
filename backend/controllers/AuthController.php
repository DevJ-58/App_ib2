<?php
/**
 * AuthController - Orchestration de l'authentification
 * 
 * Ce contrôleur gère les actions d'authentification et les sessions utilisateur.
 * Les endpoints API (/Api/Auth/) gèrent les requêtes HTTP directes.
 * Ce contrôleur peut être utilisé pour des actions MVC si nécessaire.
 */

namespace backend\controllers;

session_start();

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';

use backend\models\User;
use backend\utils\Security;
use backend\utils\Response;

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    public function isAuthenticated()
    {
        return isset($_SESSION['user_id']);
    }

    /**
     * Vérifier si l'utilisateur a un certain rôle
     */
    public function hasRole($role)
    {
        if (!$this->isAuthenticated()) {
            return false;
        }
        return $_SESSION['user_role'] === $role || $_SESSION['user_role'] === 'admin';
    }

    /**
     * Récupérer l'utilisateur connecté
     */
    public function getCurrentUser()
    {
        if (!$this->isAuthenticated()) {
            return null;
        }
        return $this->userModel->getById($_SESSION['user_id']);
    }

    /**
     * Se connecter (méthode programmative)
     */
    public function login($telephone, $motDePasse)
    {
        $result = $this->userModel->verifierIdentifiants($telephone, $motDePasse);

        if (!$result['success']) {
            return $result;
        }

        // Créer une session utilisateur
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['user_role'] = $result['user']['role'];
        $_SESSION['user_telephone'] = $result['user']['telephone'];
        $_SESSION['logged_in_at'] = time();

        Security::logSecurityEvent('LOGIN_SUCCESS', ['user_id' => $result['user']['id']]);

        return [
            'success' => true,
            'user' => $result['user'],
            'message' => 'Connexion réussie'
        ];
    }

    /**
     * S'inscrire (méthode programmative)
     */
    public function register($data)
    {
        // Valider les données
        $errors = [];
        if (!isset($data['nom'])) $errors['nom'] = 'Le nom est requis';
        if (!isset($data['prenom'])) $errors['prenom'] = 'Le prénom est requis';
        if (!isset($data['telephone'])) $errors['telephone'] = 'Le téléphone est requis';
        if (!isset($data['email'])) $errors['email'] = 'L\'email est requis';
        if (!isset($data['mot_de_passe'])) $errors['mot_de_passe'] = 'Le mot de passe est requis';

        if (!empty($errors)) {
            return [
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $errors
            ];
        }

        // Valider les formats
        if (!Security::validatePhone($data['telephone'])) {
            return [
                'success' => false,
                'message' => 'Téléphone invalide'
            ];
        }

        if (!Security::validateEmail($data['email'])) {
            return [
                'success' => false,
                'message' => 'Email invalide'
            ];
        }

        // Vérifier si l'utilisateur existe
        if ($this->userModel->telephoneExists($data['telephone'])) {
            return [
                'success' => false,
                'message' => 'Un utilisateur avec ce téléphone existe déjà'
            ];
        }

        if ($this->userModel->emailExists($data['email'])) {
            return [
                'success' => false,
                'message' => 'Un utilisateur avec cet email existe déjà'
            ];
        }

        // Créer l'utilisateur
        $result = $this->userModel->create($data);

        if (!$result['success']) {
            return $result;
        }

        // Récupérer l'utilisateur créé
        $user = $this->userModel->getById($result['id']);

        // Connecter automatiquement après l'inscription
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_telephone'] = $user['telephone'];
        $_SESSION['logged_in_at'] = time();

        Security::logSecurityEvent('REGISTER_SUCCESS', ['user_id' => $user['id']]);

        return [
            'success' => true,
            'user' => $user,
            'message' => 'Inscription réussie'
        ];
    }

    /**
     * Se déconnecter
     */
    public function logout()
    {
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            session_destroy();
            Security::logSecurityEvent('LOGOUT_SUCCESS', ['user_id' => $userId]);
        }

        return [
            'success' => true,
            'message' => 'Déconnexion réussie'
        ];
    }

    /**
     * Vérifier la session actuelle (endpoint pour le frontend)
     */
    public function checkSession()
    {
        if (!$this->isAuthenticated()) {
            return [
                'success' => false,
                'authenticated' => false,
                'message' => 'Aucune session active'
            ];
        }

        $user = $this->getCurrentUser();

        return [
            'success' => true,
            'authenticated' => true,
            'user' => $user,
            'message' => 'Utilisateur authentifié'
        ];
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword($oldPassword, $newPassword, $confirmPassword)
    {
        if (!$this->isAuthenticated()) {
            return [
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ];
        }

        if ($newPassword !== $confirmPassword) {
            return [
                'success' => false,
                'message' => 'Les nouveaux mots de passe ne correspondent pas'
            ];
        }

        $user = $this->getCurrentUser();
        $result = $this->userModel->verifierIdentifiants($user['telephone'], $oldPassword);

        if (!$result['success']) {
            return [
                'success' => false,
                'message' => 'Ancien mot de passe incorrect'
            ];
        }

        // Mettre à jour le mot de passe
        $updateResult = $this->userModel->update($user['id'], [
            'mot_de_passe' => $newPassword
        ]);

        if (!$updateResult['success']) {
            return $updateResult;
        }

        Security::logSecurityEvent('PASSWORD_CHANGED', ['user_id' => $user['id']]);

        return [
            'success' => true,
            'message' => 'Mot de passe changé avec succès'
        ];
    }
}
?>