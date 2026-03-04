<?php
/**
 * Test de l'endpoint update-profile
 */

// Simuler une session
session_start();
$_SESSION['user_id'] = 1;

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Créer des données de test
$testData = json_encode([
    'prenom' => 'Test',
    'nom' => 'User',
    'telephone' => '0123456789',
    'email' => 'test@test.com'
]);

// Créer un stream simulé
stream_context_set_default([
    "http" => [
        "method" => "POST",
        "header" => "Content-Type: application/json\r\n",
        "content" => $testData
    ]
]);

echo "===== Test Update Profile =====\n\n";
echo "Session user_id: " . ($_SESSION['user_id'] ?? 'null') . "\n";
echo "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Test data: " . $testData . "\n\n";

// Inclure le fichier
include 'backend/Api/Auth/update-profile.php';
?>
