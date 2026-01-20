<?php
/**
 * Test direct API Register - Voir l'erreur PHP
 */

// Simule une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// JSON de test
$json = json_encode([
    'nom' => 'Test',
    'prenom' => 'User',
    'telephone' => '0123456789',
    'email' => 'test@example.com',
    'mot_de_passe' => 'Test1234',
    'confirm_mot_de_passe' => 'Test1234'
]);

// Remplacer php://input
$GLOBALS['test_input'] = $json;

// Capturer les erreurs
ob_start();
echo "=== TEST DIRECT REGISTER ===\n\n";

try {
    echo "1. Chargement bootstrap...\n";
    require_once 'backend/bootstrap.php';
    echo "   ✅ Bootstrap chargé\n\n";
    
    echo "2. Vérification des classes...\n";
    echo "   - Database exists: " . (class_exists('backend\models\Database') ? '✅' : '❌') . "\n";
    echo "   - User exists: " . (class_exists('backend\models\User') ? '✅' : '❌') . "\n";
    echo "   - Security exists: " . (class_exists('backend\utils\Security') ? '✅' : '❌') . "\n";
    echo "   - Response exists: " . (class_exists('backend\utils\Response') ? '✅' : '❌') . "\n\n";
    
    echo "3. Test Database connection...\n";
    $db = \backend\models\Database::getInstance();
    echo "   ✅ BD connectée\n\n";
    
    echo "4. Test User model...\n";
    $user = new \backend\models\User();
    echo "   ✅ User model instantié\n\n";
    
    echo "5. Maintenant, exécuter register.php...\n\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "\nTrace:\n";
    echo $e->getTraceAsString();
}

// Afficher les erreurs
$output = ob_get_clean();
echo "<pre>" . htmlspecialchars($output) . "</pre>";
?>
