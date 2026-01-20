<?php
/**
 * Classe Database - Gestion de la connexion à la base de données
 * Utilise PDO pour une connexion sécurisée
 */

namespace backend\models;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;
    private $host = 'localhost';
    private $dbName = 'gestion_stock'; // À modifier selon votre base
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';

    /**
     * Constructeur privé (Singleton)
     */
    /**
     * Constructeur privé (Singleton)
     */
    private function __construct()
    {
        try {
            // Utiliser les constantes de configuration si disponibles
            $host = defined('DB_HOST') ? DB_HOST : $this->host;
            $dbName = defined('DB_NAME') ? DB_NAME : $this->dbName;
            $username = defined('DB_USER') ? DB_USER : $this->username;
            $password = defined('DB_PASSWORD') ? DB_PASSWORD : $this->password;

            $dsn = "mysql:host={$host};dbname={$dbName};charset={$this->charset}";
            
            $this->connection = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            die("Erreur de connexion à la base de données: " . $e->getMessage());
        }
    }

    /**
     * Récupère l'instance unique de la base de données (Singleton)
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Retourne la connexion PDO
     */
    public function getConnection()
    {
        return $this->connection;
    }

    /**
     * Exécute une requête SELECT
     */
    public function select($query, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \Exception("Erreur SELECT: " . $e->getMessage());
        }
    }

    /**
     * Exécute une requête SELECT et retourne une seule ligne
     */
    public function selectOne($query, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new \Exception("Erreur SELECT: " . $e->getMessage());
        }
    }

    /**
     * Exécute une requête INSERT, UPDATE ou DELETE
     */
    public function execute($query, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new \Exception("Erreur d'exécution: " . $e->getMessage());
        }
    }

    /**
     * Retourne l'ID du dernier enregistrement inséré
     */
    public function lastInsertId()
    {
        return $this->connection->lastInsertId();
    }

    /**
     * Commencer une transaction
     */
    public function beginTransaction()
    {
        return $this->connection->beginTransaction();
    }

    /**
     * Valider une transaction
     */
    public function commit()
    {
        return $this->connection->commit();
    }

    /**
     * Annuler une transaction
     */
    public function rollBack()
    {
        return $this->connection->rollBack();
    }
}
?>
