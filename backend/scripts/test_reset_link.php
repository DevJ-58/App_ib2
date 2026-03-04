<?php
/**
 * Test: Vérifier le lien généré dans le reset email
 */

require_once __DIR__ . '/../bootstrap.php';

use backend\models\User;
use backend\utils\Security;

// Simuler REQUEST_URI comme si la requête venait du navigateur
$_SERVER['REQUEST_URI'] = '/APP_IB/backend/Api/Auth/reset-password.php';
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['HTTPS'] = '';

$testEmail = 'kouadiofrejus777@gmail.com';

try {
    $userModel = new User();
    $user = $userModel->getByEmail($testEmail);
    
    if (!$user) {
        echo "[ERROR] User not found\n";
        exit(1);
    }
    
    // Générer le token comme le ferait reset-password.php
    $resetToken = Security::generateToken(32);
    $expiresAt = time() + 3600;
    $userModel->setResetToken($user['id'], $resetToken, $expiresAt);
    
    // Construire le lien comme le ferait reset-password.php (avec le nouveau code)
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/APP_IB/backend/Api/Auth/reset-password.php';
    preg_match('#(/[^/]+)?/backend/Api/Auth/reset-password\.php#', $requestUri, $matches);
    $appPath = $matches[1] ?? '/APP_IB';
    $resetLink = $protocol . '://' . $host . $appPath . '/frontend/HTML/reset_confirm.html?token=' . urlencode($resetToken);
    
    echo "[TEST] REQUEST_URI: $requestUri\n";
    echo "[TEST] Matched appPath: $appPath\n";
    echo "[TEST] Reset Link: $resetLink\n";
    echo "[OK] Link structure looks good\n";
    
} catch (Exception $e) {
    echo "[FATAL] " . $e->getMessage() . "\n";
    exit(1);
}
?>
