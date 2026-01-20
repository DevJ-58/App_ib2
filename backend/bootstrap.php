<?php
/**
 * Bootstrap du Backend - Initialise les configurations et l'autoloader
 */

namespace backend;

// Définir les constantes de configuration si pas déjà définies
if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'gestion_stock');
    define('DB_USER', 'root');
    define('DB_PASSWORD', '');
}

// Définir le chemin racine
define('ROOT_PATH', __DIR__);
define('LOG_PATH', ROOT_PATH . '/logs');

// Configurer les erreurs
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Ne pas afficher les erreurs en production
ini_set('log_errors', '1');
ini_set('error_log', LOG_PATH . '/error.log');

// Configurer les sessions PHP
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '0'); // 0 pour HTTP local, 1 pour HTTPS production
ini_set('session.cookie_path', '/');
ini_set('session.cookie_domain', '');
ini_set('session.name', 'PHPSESSID');

// Démarrer la session
session_start();
error_log('SESSION: Session started. ID=' . session_id() . ', Session data=' . json_encode($_SESSION));

// Configurer CORS
require_once ROOT_PATH . '/configs/cors.php';
\backend\configs\CORS::configurer();

// Charger l'autoloader (si composer est utilisé)
if (file_exists(ROOT_PATH . '/vendor/autoload.php')) {
    require_once ROOT_PATH . '/vendor/autoload.php';
} else {
    // Charger les classes manuellement
    require_once ROOT_PATH . '/models/Database.php';
    require_once ROOT_PATH . '/models/User.php';
    require_once ROOT_PATH . '/models/Product.php';
    require_once ROOT_PATH . '/models/Category.php';
    require_once ROOT_PATH . '/models/Stock.php';
    require_once ROOT_PATH . '/models/Sale.php';
    require_once ROOT_PATH . '/models/Credit.php';
    require_once ROOT_PATH . '/models/Movement.php';
    require_once ROOT_PATH . '/utils/Response.php';
    require_once ROOT_PATH . '/utils/Security.php';
    require_once ROOT_PATH . '/utils/Validator.php';
    require_once ROOT_PATH . '/utils/JWT.php';
}
