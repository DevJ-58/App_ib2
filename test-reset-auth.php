<?php
/**
 * TEST-RESET-AUTH.PHP - Test de réinitialisation avec session authentifiée
 */

// Démarrer la session AVANT d'envoyer des headers
session_start();

// Simuler une session admin authentifiée
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'admin';
$_SESSION['user_name'] = 'Test Admin';

// Maintenant on peut utiliser les headers
header('Content-Type: application/json');

// Inclure le bootstrap et les dépendances
require_once 'backend/bootstrap.php';

// Simuler la requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Inclure et exécuter le reset-system.php
include 'backend/Api/reset-system.php';
?>