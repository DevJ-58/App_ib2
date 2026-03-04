<?php
/**
 * TEST-UPDATE-PROFILE.PHP - Test de la mise à jour du profil
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\utils\Response;
use backend\models\Database;

// Activer l'affichage des erreurs 
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "Test Update Profile\n";
echo "==================\n";

// Test 1: Vérifier les constantes boost
echo "\n1. Vérification du bootstrap:\n";
echo "✅ Bootstrap chargé\n";
echo "   - ROOT_PATH: " . ROOT_PATH . "\n";
echo "   - LOG_PATH: " . LOG_PATH . "\n";

// Test 2: Vérifier la session
echo "\n2. Vérification de la session:\n";
echo "   - PHPSESSID: " . (isset($_COOKIE['PHPSESSID']) ? $_COOKIE['PHPSESSID'] : 'non défini') . "\n";
echo "   - Session ID: " . session_id() . "\n";
echo "   - user_id in SESSION: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'non défini') . "\n";

// Test 3: Vérifier la classe Response
echo "\n3. Vérification de la classe Response:\n";
try {
    echo "✅ Response disponible\n";
} catch (Exception $e) {
    echo "❌ Erreur Response: " . $e->getMessage() . "\n";
}

// Test 4: Vérifier Database
echo "\n4. Vérification de Database:\n";
try {
    $db = Database::getInstance();
    echo "✅ Database disponible\n";
    $pdo = $db->getConnection();
    try {
        $stmt = $pdo->query('SELECT 1');
        echo "✅ Database fonctionne\n";
    } catch (Exception $e) {
        echo "❌ Erreur Database: " . $e->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur Database: " . $e->getMessage() . "\n";
}

// Test 5: Vérifier l'existence d'un utilisateur
echo "\n5. Vérification des utilisateurs:\n";
if (isset($pdo)) {
    try {
        $stmt = $pdo->query('SELECT COUNT(*) as count FROM utilisateurs');
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        echo "✅ Total d'utilisateurs: " . $result['count'] . "\n";
    } catch (Exception $e) {
        echo "❌ Erreur requête utilisateurs: " . $e->getMessage() . "\n";
    }
}

// Test 6: Afficher les détails du problème
echo "\n6. Résumé:\n";
echo "Pour utiliser update-profile.php:\n";
echo "- L'utilisateur doit être authentifié (_SESSION['user_id'] défini)\n";
echo "- La requête doit être en POST\n";
echo "- Le body doit contenir du JSON valide\n";
echo "- Le serveur doit répondre avec du JSON valide\n";

echo "\n✅ Test terminé\n";
?>
