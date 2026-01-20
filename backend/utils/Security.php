<?php
/**
 * Classe Security - Gestion de la sécurité (hachage, validation, sanitization)
 */

namespace backend\utils;

class Security
{
    /**
     * Hacher un mot de passe
     */
    public static function hashPassword($password)
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Vérifier un mot de passe
     */
    public static function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    /**
     * Générer un token aléatoire sécurisé
     */
    public static function generateToken($length = 32)
    {
        return bin2hex(random_bytes($length));
    }

    /**
     * Sanitizer une entrée (protection XSS)
     */
    public static function sanitize($input)
    {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Valider une adresse email
     */
    public static function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Valider un numéro de téléphone (10 chiffres)
     */
    public static function validatePhone($phone)
    {
        return preg_match('/^[0-9]{10}$/', $phone) === 1;
    }

    /**
     * Valider la force d'un mot de passe
     * Min 6 caractères, au moins 1 chiffre et 1 lettre
     */
    public static function validatePassword($password)
    {
        $errors = [];

        if (strlen($password) < 6) {
            $errors[] = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins 1 chiffre';
        }

        if (!preg_match('/[a-zA-Z]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins 1 lettre';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * CSRF Token - Générer et valider les tokens CSRF
     */
    public static function generateCSRFToken()
    {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = self::generateToken();
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Valider un CSRF token
     */
    public static function validateCSRFToken($token)
    {
        return isset($_SESSION['csrf_token']) && $_SESSION['csrf_token'] === $token;
    }

    /**
     * Récupérer un paramètre de manière sécurisée
     */
    public static function getParam($name, $default = null, $type = 'string')
    {
        $value = $_REQUEST[$name] ?? $default;

        if ($value === null) {
            return null;
        }

        switch ($type) {
            case 'int':
                return (int)$value;
            case 'float':
                return (float)$value;
            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'email':
                return filter_var($value, FILTER_SANITIZE_EMAIL);
            default:
                return self::sanitize($value);
        }
    }

    /**
     * Récupérer des données JSON POST de manière sécurisée
     */
    public static function getJSONInput()
    {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        return $data ? self::sanitize($data) : [];
    }

    /**
     * Logger un événement de sécurité
     */
    public static function logSecurityEvent($event, $details = [])
    {
        $logFile = __DIR__ . '/../logs/security.log';
        $message = date('Y-m-d H:i:s') . ' | ' . $event . ' | ' . json_encode($details) . "\n";
        error_log($message, 3, $logFile);
    }
}
?>
