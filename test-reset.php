<?php
/**
 * TEST-RESET.PHP - Test de l'endpoint de réinitialisation
 */

echo "Test de l'endpoint reset-system.php\n";
echo "=====================================\n";

// Simuler une session admin
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'admin';
$_SESSION['user_name'] = 'Test Admin';

echo "Session simulée: Admin ID=1\n";

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Inclure le fichier de réinitialisation
include 'backend/Api/reset-system.php';
?>