<?php
// Test de la redirection vers le dashboard après connexion
// avec les 3 utilisateurs de test

require_once 'backend/bootstrap.php';

use backend\models\User;

$users = [
    ['telephone' => '0123456789', 'password' => '123456'],
    ['telephone' => '0987654321', 'password' => '123456'],
    ['telephone' => '0555555555', 'password' => '123456']
];

echo "=== TEST CONNEXION UTILISATEURS ===\n\n";

foreach ($users as $user) {
    echo "Test avec: {$user['telephone']}\n";
    
    $userModel = new User();
    $userData = $userModel->verifierIdentifiants($user['telephone'], $user['password']);
    
    if ($userData) {
        echo "✅ Authentification réussie\n";
        echo "   Utilisateur: {$userData['prenom']} {$userData['nom']}\n";
        echo "   Rôle: {$userData['role']}\n";
    } else {
        echo "❌ Authentification échouée\n";
    }
    echo "\n";
}

echo "\n=== TEST API PRODUITS ===\n\n";

// Test API liste produits
$ch = curl_init("http://localhost/APP_IB/backend/Api/Products/list.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data['success']) {
    echo "✅ API liste produits: " . count($data['message']) . " produits\n";
} else {
    echo "❌ Erreur API: " . $data['message'] . "\n";
}

curl_close($ch);
?>
