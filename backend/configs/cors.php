<?php
/**
 * Configuration CORS - Gestion de l'accès cross-origin
 */

namespace backend\configs;

class CORS {
    /**
     * Configurer les headers CORS
     */
    public static function configurer() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $allowedOrigins = [
            'http://localhost',
            'http://localhost:8000',
            'http://localhost:3000',
            'http://127.0.0.1',
            'http://192.168.1.100',
            // Ajouter votre domaine local ou de production
        ];

        // Vérifier si l'origine est autorisée
        if (in_array($origin, $allowedOrigins) || $origin === '*') {
            header("Access-Control-Allow-Origin: $origin");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 3600');

        // Répondre aux requêtes preflight OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
?>
