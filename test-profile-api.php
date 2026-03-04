<?php
/**
 * Test script for update-profile.php endpoint
 */

// Simulate a user session
session_start();

// For testing, we'll simulate a logged-in user
$_SESSION['user_id'] = 1; // Assuming user ID 1 exists

require_once 'backend/bootstrap.php';

use backend\models\Database;
use backend\utils\Response;

echo "Testing update-profile.php endpoint\n";
echo "====================================\n\n";

// Test Database connection
echo "1. Testing Database connection...\n";
try {
    $db = Database::getInstance();
    if ($db) {
        echo "   ✓ Database instance created\n";
        $conn = $db->getConnection();
        echo "   ✓ PDO connection: " . get_class($conn) . "\n";
    } else {
        echo "   ✗ Failed to get Database instance\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Testing prepare method...\n";
try {
    $db = Database::getInstance();
    $stmt = $db->prepare("SELECT id, prenom, nom FROM utilisateurs WHERE id = ?");
    echo "   ✓ Prepared statement created\n";
} catch (Exception $e) {
    echo "   ✗ Error preparing statement: " . $e->getMessage() . "\n";
}

echo "\n3. Testing user fetch...\n";
try {
    $db = Database::getInstance();
    $stmt = $db->prepare("SELECT id, prenom, nom, telephone, email, photo FROM utilisateurs WHERE id = ?");
    $stmt->execute([1]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);
    if ($user) {
        echo "   ✓ User found: " . $user['prenom'] . " " . $user['nom'] . "\n";
        echo "   ✓ Email: " . $user['email'] . "\n";
    } else {
        echo "   ✗ User not found\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error fetching user: " . $e->getMessage() . "\n";
}

echo "\nTest completed!\n";
?>
