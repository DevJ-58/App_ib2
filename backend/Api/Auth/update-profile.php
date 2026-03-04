<?php
/**
 * UPDATE-PROFILE.PHP - Mise à jour du profil utilisateur
 * POST /backend/Api/Auth/update-profile.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\utils\Response;
use backend\models\Database;

header('Content-Type: application/json');

try {
    // Vérifier l'authentification
    if (!isset($_SESSION['user_id'])) {
        Response::error('Authentification requise', 401);
    }
    
    // Vérifier que c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Méthode non autorisée', 405);
    }
    
    // Récupérer les données JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        Response::error('Données JSON invalides', 400);
    }
    
    // Obtenir la connexion à la base de données
    $db = Database::getInstance();
    
    $userId = $_SESSION['user_id'];
    $prenom = trim($data['prenom'] ?? '');
    $nom = trim($data['nom'] ?? '');
    $telephone = trim($data['telephone'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? null;
    $oldPassword = $data['oldPassword'] ?? null;
    
    // Validation
    if (!$prenom || !$nom) {
        Response::error('Le prénom et le nom sont obligatoires', 400);
    }
    
    // Si l'utilisateur veut changer le mot de passe
    if ($password && $oldPassword) {
        // Vérifier la longueur du mot de passe
        if (strlen($password) < 6) {
            Response::error('Le mot de passe doit contenir au moins 6 caractères', 400);
        }
        
        // Récupérer l'utilisateur actuel
        $stmt = $db->prepare('SELECT password FROM utilisateurs WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$user) {
            Response::error('Utilisateur non trouvé', 404);
        }
        
        // Vérifier l'ancien mot de passe
        if (!password_verify($oldPassword, $user['password'])) {
            Response::error('Mot de passe actuel incorrect', 401);
        }
        
        // Mettre à jour avec le nouveau mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare('UPDATE utilisateurs SET prenom = ?, nom = ?, telephone = ?, email = ?, password = ? WHERE id = ?');
        $stmt->execute([$prenom, $nom, $telephone, $email, $hashedPassword, $userId]);
    } else {
        // Mise à jour sans changement de mot de passe
        $stmt = $db->prepare('UPDATE utilisateurs SET prenom = ?, nom = ?, telephone = ?, email = ? WHERE id = ?');
        $stmt->execute([$prenom, $nom, $telephone, $email, $userId]);
    }
    
    // Récupérer l'utilisateur mis à jour
    $stmt = $db->prepare('SELECT id, prenom, nom, telephone, email, photo FROM utilisateurs WHERE id = ?');
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch(\PDO::FETCH_ASSOC);
    
    Response::success($updatedUser, 'Profil mis à jour avec succès');

} catch (Exception $e) {
    error_log('Erreur update-profile: ' . $e->getMessage());
    Response::error('Erreur serveur: ' . $e->getMessage(), 500);
}
?>
