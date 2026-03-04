<?php
// Test rapide sans bootstrap
require_once __DIR__ . '/../models/Database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Security.php';

use backend\models\User;
use backend\utils\Security;

$testEmail = 'kouadiofrejus777@gmail.com';

try {
    $userModel = new User();
    $user = $userModel->getByEmail($testEmail);
    if (!$user) { echo "USER_NOT_FOUND\n"; exit(1); }
    echo "FOUND USER ID={$user['id']}\n";
    $token = Security::generateToken(32);
    $expires = time() + 3600;
    $userModel->setResetToken($user['id'], $token, $expires);
    echo "TOKEN_SAVED " . substr($token,0,20) . "...\n";
    $found = $userModel->getByResetToken($token);
    echo "FOUND_BY_TOKEN: " . ($found ? $found['email'] : 'NO') . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>