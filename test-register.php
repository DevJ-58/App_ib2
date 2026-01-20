<?php
/**
 * Test de l'API d'inscription
 */

require_once __DIR__ . '/backend/bootstrap.php';

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Données de test
$testData = [
    'nom' => 'TestUser',
    'prenom' => 'John',
    'telephone' => '0102030405',
    'email' => 'testuser' . time() . '@example.com',
    'mot_de_passe' => 'Password123!',
    'confirm_mot_de_passe' => 'Password123!'
];

// Simuler l'input JSON
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode($testData);

// Ouvrir le fichier et capturer la sortie
ob_start();
include __DIR__ . '/backend/Api/Auth/register.php';
$output = ob_get_clean();

echo "=== Test Inscription API ===\n";
echo "Données envoyées:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";
echo "Réponse API:\n";
echo $output . "\n";
?>
