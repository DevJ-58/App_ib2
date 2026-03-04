<?php
/**
 * Test du flux de connexion complet
 */

// Test 1: Vérifier que la session démarre correctement
echo "=== TEST 1: Session initiale ===\n";
session_start();
echo "PHPSESSID: " . session_id() . "\n";
echo "Session ID length: " . strlen(session_id()) . "\n";
echo "\n";

// Test 2: Simuler l'appel à login.php
echo "=== TEST 2: Simulation appel login.php ===\n";

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\User;
use backend\utils\Security;
use backend\utils\Response;

// Données de test
$testData = json_encode([
    'telephone' => '0123456789',
    'mot_de_passe' => 'test123'
]);

echo "Post data: $testData\n";

// Simuler la requête
$GLOBALS['HTTP_RAW_POST_DATA'] = $testData;

// Récupérer les données
$data = json_decode($testData, true);
$telephone = $data['telephone'] ?? null;
$motDePasse = $data['mot_de_passe'] ?? null;

echo "Téléphone reçu: $telephone\n";
echo "Mot de passe reçu: " . (strlen($motDePasse) > 0 ? "✓ Non vide" : "✗ Vide") . "\n\n";

// Chercher l'utilisateur
echo "=== TEST 3: Chercher utilisateur ===\n";
try {
    $userModel = new User();
    // Cherche tous les utilisateurs pour debug
    $query = "SELECT id, telephone, prenom, nom FROM users LIMIT 5";
    $stmt = $userModel->getPDO()->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    echo "Utilisateurs en BD:\n";
    foreach ($users as $user) {
        echo "  - ID: {$user['id']}, Téléphone: {$user['telephone']}, Nom: {$user['prenom']} {$user['nom']}\n";
    }
    echo "\n";
    
    // Cherche le user avec le téléphone
    $result = $userModel->verifierIdentifiants($telephone, $motDePasse);
    
    if ($result['success']) {
        echo "✅ Vérification identifiants: SUCCESS\n";
        echo "   User ID: " . $result['user']['id'] . "\n";
        echo "   Nom: " . $result['user']['prenom'] . ' ' . $result['user']['nom'] . "\n";
        
        // Créer la session comme le ferait login.php
        echo "\n=== TEST 4: Créer session PHP ===\n";
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['user_role'] = $result['user']['role'];
        $_SESSION['user_telephone'] = $result['user']['telephone'];
        $_SESSION['logged_in_at'] = time();
        
        echo "Variables de session définies:\n";
        echo "  user_id = " . $_SESSION['user_id'] . "\n";
        echo "  user_role = " . $_SESSION['user_role'] . "\n";
        echo "  user_telephone = " . $_SESSION['user_telephone'] . "\n";
        
        // Test de la vérification
        echo "\n=== TEST 5: Vérifier session ===\n";
        if (isset($_SESSION['user_id'])) {
            echo "✅ Session user_id EXISTS: " . $_SESSION['user_id'] . "\n";
        } else {
            echo "✗ Session user_id NOT FOUND\n";
        }
    } else {
        echo "✗ Vérification identifiants: FAILED - " . $result['message'] . "\n";
    }
} catch (\Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

?>
