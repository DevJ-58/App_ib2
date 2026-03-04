<?php
require_once __DIR__ . '/../bootstrap.php';

$cfgPath = __DIR__ . '/../configs/mail.php';
if (!file_exists($cfgPath)) {
    echo "Missing mail config at $cfgPath\n";
    exit(1);
}
$cfg = require $cfgPath;

if (!file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    echo "Composer autoload not found; cannot run PHPMailer test\n";
    exit(1);
}
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $cfg['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $cfg['smtp_user'];
    $mail->Password = $cfg['smtp_pass'];
    $mail->SMTPSecure = $cfg['smtp_secure'];
    $mail->Port = $cfg['smtp_port'];
    $mail->setFrom($cfg['from_email'], $cfg['from_name']);
    $mail->addAddress($cfg['from_email']);
    $mail->isHTML(true);
    $mail->Subject = 'Test PHPMailer';
    $mail->Body = 'Ceci est un test de PHPMailer.';
    $sent = $mail->send();
    echo "PHPMailer send returned: " . ($sent ? 'true' : 'false') . "\n";
} catch (Exception $e) {
    echo "PHPMailer exception: " . $e->getMessage() . "\n";
}
