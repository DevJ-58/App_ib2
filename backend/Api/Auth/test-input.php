<?php
/**
 * Test: Vérifier si php://input est accessible
 */

error_log("TEST INPUT: Method=" . $_SERVER['REQUEST_METHOD']);
error_log("TEST INPUT: Content-Type=" . ($_SERVER['CONTENT_TYPE'] ?? 'undefined'));

$input = file_get_contents('php://input');
error_log("TEST INPUT: Raw input length=" . strlen($input));
error_log("TEST INPUT: Raw input=" . $input);

$data = json_decode($input, true);
error_log("TEST INPUT: Decoded data=" . json_encode($data));

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'undefined',
    'input_length' => strlen($input),
    'raw_input' => $input,
    'decoded_data' => $data
]);
?>
