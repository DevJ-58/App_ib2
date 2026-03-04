<?php
/**
 * Test the update-profile.php endpoint
 * This simulates a POST request from the frontend
 */

session_start();
$_SESSION['user_id'] = 1; // Simulate logged-in user

// Set up environment for POST simulation
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Create test data
$testData = [
    'prenom' => 'Frejus',
    'nom' => 'Kouadio',
    'telephone' => '0123456789',
    'email' => 'test@example.com'
];

// Create a request body
$jsonData = json_encode($testData);

// Mock the php://input stream
$inputStream = fopen('php://memory', 'r+');
fwrite($inputStream, $jsonData);
rewind($inputStream);

// Replace php://input with our mock
if (function_exists('stream_wrapper_unregister')) {
    // For actual testing, we need to mock the file_get_contents('php://input')
}

require_once 'backend/bootstrap.php';
require_once 'backend/Api/Auth/update-profile.php';

echo "\n\nNote: Due to PHP's file stream handling, actual endpoint testing\n";
echo "requires a real HTTP request. Use curl or frontend to test.\n";
?>
