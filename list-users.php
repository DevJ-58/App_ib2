<?php
require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\User;

$userModel = new User();
$query = 'SELECT id, telephone, prenom, nom, role FROM users LIMIT 10';
$stmt = $userModel->getPDO()->prepare($query);
$stmt->execute();
$users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

echo "Utilisateurs trouvés: " . count($users) . "\n";
foreach ($users as $user) {
    echo "- ID: {$user['id']}, Tél: {$user['telephone']}, Nom: {$user['prenom']} {$user['nom']}, Role: {$user['role']}\n";
}
?>
