<?php
/**
 * Configuration Base de Données - Connexion PDO
 */

namespace backend\configs;

class DatabaseConfig {
    private static $instance = null;

    /**
     * Obtenir la connexion PDO singleton
     */
    public static function getConnection() {
        if (self::$instance === null) {
            self::$instance = self::createConnection();
        }
        return self::$instance;
    }

    /**
     * Créer une connexion PDO
     */
    private static function createConnection() {
        try {
            // Configuration de connexion (adapter selon votre environnement)
            $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            
            $options = [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $pdo = new \PDO($dsn, DB_USER, DB_PASSWORD, $options);
            return $pdo;
        } catch (\PDOException $e) {
            error_log('Erreur de connexion base de données: ' . $e->getMessage());
            die('Erreur de connexion à la base de données');
        }
    }
}

// Définir les constantes si non déjà définies
if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'gestion_stock');
    define('DB_USER', 'root');
    define('DB_PASSWORD', '');
}
?>
