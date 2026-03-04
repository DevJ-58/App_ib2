<?php
/**
 * Test local du flux complet reset-password + confirm
 * Usage: php backend/scripts/test_reset_flow.php
 */

require_once __DIR__ . '/../bootstrap.php';

use backend\models\User;
use backend\utils\Security;

$testEmail = 'kouadiofrejus777@gmail.com';

try {
    echo "[TEST] Cherche utilisateur avec email: $testEmail\n";
    $userModel = new User();
    $user = $userModel->getByEmail($testEmail);
    
    if (!$user) {
        echo "[ERROR] Utilisateur non trouvé!\n";
        exit(1);
    }
    
    echo "[OK] Utilisateur trouvé: ID={$user['id']}, Email={$user['email']}\n";
    
    // Génère un token
    $resetToken = Security::generateToken(32);
    $expiresAt = time() + 3600; // 1 heure
    
    echo "[TEST] Génère token: " . substr($resetToken, 0, 20) . "…\n";
    
    // Sauvegarde le token
    $userModel->setResetToken($user['id'], $resetToken, $expiresAt);
    echo "[OK] Token sauvegardé en BD\n";
    
    // Teste la lecture du token
    echo "[TEST] Cherche le token en BD...\n";
    $userFound = $userModel->getByResetToken($resetToken);
    
    if (!$userFound) {
        echo "[ERROR] Token non trouvé immédiatement après sauvegarde!\n";
        echo "[DEBUG] User ID: {$user['id']}, Reset Token: " . substr($resetToken, 0, 20) . "…\n";
        exit(1);
    }
    
    echo "[OK] Token trouvé en BD! Utilisateur: {$userFound['email']}\n";
    
    // Teste la réinitialisation du mot de passe
    $newPwd = 'TestPassword123';
    echo "[TEST] Teste resetPasswordWithToken avec nouveau mot: $newPwd\n";
    $userModel->resetPasswordWithToken($resetToken, $newPwd);
    echo "[OK] Mot de passe réinitialisé\n";
    
    // Vérifie que le token est maintenant NULL
    echo "[TEST] Vérifie que le token est effacé...\n";
    $userAfter = $userModel->getByResetToken($resetToken);
    if ($userAfter) {
        echo "[ERROR] Token n'a pas été effacé!\n";
        exit(1);
    }
    
    echo "[OK] Token correctement effacé\n";
    
    echo "[SUCCESS] Flux complet réussi!\n";

} catch (Exception $e) {
    echo "[FATAL] " . $e->getMessage() . "\n";
    exit(1);
}
?>