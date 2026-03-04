<?php
/**
 * Test E2E : Simulation complète du flux "mot de passe oublié"
 * 1. POST vers reset-password → récupère token de la DB (simule email)
 * 2. POST vers confirm-reset avec le token
 * 3. Vérifier que login fonctionne avec le nouveau mot de passe
 */

require_once __DIR__ . '/../bootstrap.php';

use backend\models\User;
use backend\utils\Security;

echo "[E2E] === TEST MDP OUBLIE COMPLET ===\n\n";

// Test email/user
$testEmail = 'kouadiofrejus777@gmail.com';
$newPassword = 'NewPassword123!';

try {
    echo "[1/4] Recherche utilisateur...\n";
    $userModel = new User();
    $userBefore = $userModel->getByEmail($testEmail);
    if (!$userBefore) {
        echo "[ERROR] Utilisateur non trouvé: $testEmail\n";
        exit(1);
    }
    echo "[OK] Utilisateur trouvé: ID={$userBefore['id']}, Email={$userBefore['email']}\n\n";

    // ===== ETAPE 2: Générer token (simule reset-password.php) =====
    echo "[2/4] Génération du token et sauvegarde en BD...\n";
    $resetToken = Security::generateToken(32);
    $expiresAt = time() + 3600;
    $userModel->setResetToken($userBefore['id'], $resetToken, $expiresAt);
    echo "[OK] Token généré et sauvegardé: " . substr($resetToken, 0, 20) . "…\n\n";

    // ===== ETAPE 3: Utiliser le token pour reset (simule confirm-reset.php) =====
    echo "[3/4] Réinitialisation du mot de passe avec le token...\n";
    $userModel->resetPasswordWithToken($resetToken, $newPassword);
    echo "[OK] Mot de passe réinitialisé\n\n";

    // ===== ETAPE 4: Vérifier qu'on peut se connecter avec le nouveau mot de passe =====
    echo "[4/4] Vérification login avec nouveau mot de passe...\n";
    $loginResult = $userModel->verifierIdentifiants($userBefore['telephone'], $newPassword);
    if ($loginResult['success']) {
        echo "[OK] Login réussi avec le nouveau mot de passe!\n";
        echo "[OK] === TEST E2E COMPLET: SUCCES ===\n";
    } else {
        echo "[ERROR] Login échoué: " . $loginResult['message'] . "\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "[FATAL] " . $e->getMessage() . "\n";
    exit(1);
}
?>
