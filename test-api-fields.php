<?php
$json = json_decode(file_get_contents('http://localhost/APP_IB/backend/Api/Sales/list.php'), true);
echo "Champs disponibles:\n";
print_r(array_keys($json['data'][0]));
echo "\nPremière vente:\n";
print_r($json['data'][0]);
?>
