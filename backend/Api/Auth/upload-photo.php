<?php
/**
 * Endpoint API - Upload Photo (Télécharger une photo de profil)
 * POST /Api/Auth/upload-photo.php
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\User;
use backend\utils\Response;
use backend\utils\Security;

error_log('UPLOAD_PHOTO: ===== UPLOAD PHOTO CALLED =====');
error_log('UPLOAD_PHOTO: PHPSESSID=' . session_id());
error_log('UPLOAD_PHOTO: user_id=' . ($_SESSION['user_id'] ?? 'null'));

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
}

// Vérifier si l'utilisateur est authentifié
if (!isset($_SESSION['user_id'])) {
    Response::unauthorized('Utilisateur non connecté');
}

// Vérifier qu'un fichier a été envoyé
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    Response::validationError([
        'photo' => 'Aucun fichier envoyé ou erreur lors du téléchargement'
    ]);
}

try {
    $userId = $_SESSION['user_id'];
    $file = $_FILES['photo'];
    
    error_log('UPLOAD_PHOTO: File received - name=' . $file['name'] . ', type=' . $file['type'] . ', size=' . $file['size']);
    
    // Valider le type de fichier (accepter tous les types image)
    if (strpos($file['type'], 'image/') !== 0) {
        error_log('UPLOAD_PHOTO: Type non autorisé: ' . $file['type']);
        Response::validationError([
            'photo' => 'Type de fichier non autorisé - veuillez envoyer une image'
        ]);
    }
    
    // Valider la taille (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        error_log('UPLOAD_PHOTO: Fichier trop volumineux: ' . $file['size']);
        Response::validationError([
            'photo' => 'Le fichier est trop volumineux (max 5MB)'
        ]);
    }
    
    // Créer le dossier s'il n'existe pas
    $uploads_dir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploads_dir)) {
        mkdir($uploads_dir, 0755, true);
    }
    
    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploads_dir . $filename;
    
    // Déplacer le fichier
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        Response::serverError('Erreur lors de la sauvegarde du fichier');
    }
    
    // URL relative accessible via le web
    $photo_url = '/APP_IB/backend/uploads/' . $filename;
    
    error_log('UPLOAD_PHOTO: Fichier sauvegardé: ' . $photo_url);
    
    // Mettre à jour la BD
    try {
        $userModel = new User();
        
        // Utiliser PDO directement via Database
        $db = \backend\models\Database::getInstance();
        $pdo = $db->getConnection();
        $query = "UPDATE utilisateurs SET photo = :photo WHERE id = :id";
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':photo' => $photo_url,
            ':id' => $userId
        ]);
        
        error_log('UPLOAD_PHOTO: BD mise à jour pour user_id=' . $userId);
        
        // Récupérer l'utilisateur mis à jour
        $user = $userModel->getById($userId);
        
        Response::success($user, 'Photo téléchargée avec succès');
    } catch (\Exception $e) {
        // Supprimer le fichier s'il y a une erreur BD
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        error_log('UPLOAD_PHOTO: Erreur BD - ' . $e->getMessage());
        Response::serverError('Erreur BD: ' . $e->getMessage());
    }
    
} catch (\Exception $e) {
    error_log('UPLOAD_PHOTO: Exception - ' . $e->getMessage());
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
