<?php
/**
 * Test API Register - Simuler une requête d'inscription
 */

require_once 'backend/bootstrap.php';

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Définir les données JSON
$json = json_encode([
    'nom' => 'Dupont',
    'prenom' => 'Jean',
    'telephone' => '0612345678',
    'email' => 'jean@example.com',
    'mot_de_passe' => 'Test1234',
    'confirm_mot_de_passe' => 'Test1234'
]);

// Remplacer l'input
global $GLOBALS;
$GLOBALS['_test_json_input'] = $json;

// Inclure et exécuter l'endpoint
echo "<h2>Test Inscription</h2>\n";
echo "<pre>\n";

// Capturer les modifications de superglobales
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Créer les variables d'environnement pour la requête
$_POST = json_decode($json, true);

echo "Données envoyées:\n";
echo json_encode($_POST, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

require_once 'backend/Api/Auth/register.php';

echo "</pre>\n";
?>
