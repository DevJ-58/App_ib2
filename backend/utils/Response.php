<?php
/**
 * Classe Response - Gestion standardisée des réponses API
 */

namespace backend\utils;

class Response
{
    /**
     * Envoyer une réponse JSON de succès
     */
    public static function success($data = null, $message = 'Succès', $code = 200)
    {
        self::setHeaders();
        http_response_code($code);
        
        echo json_encode([
            'success' => true,
            'code' => $code,
            'message' => $message,
            'data' => $data
        ]);
        
        exit;
    }

    /**
     * Envoyer une réponse JSON d'erreur
     */
    public static function error($message = 'Erreur', $code = 400, $errors = null)
    {
        self::setHeaders();
        http_response_code($code);
        
        $response = [
            'success' => false,
            'code' => $code,
            'message' => $message
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        echo json_encode($response);
        exit;
    }

    /**
     * Envoyer une réponse de validation échouée
     */
    public static function validationError($errors, $message = 'Erreur de validation')
    {
        self::error($message, 422, $errors);
    }

    /**
     * Envoyer une réponse d'authentification échouée
     */
    public static function unauthorized($message = 'Non autorisé')
    {
        self::error($message, 401);
    }

    /**
     * Envoyer une réponse d'accès refusé
     */
    public static function forbidden($message = 'Accès refusé')
    {
        self::error($message, 403);
    }

    /**
     * Envoyer une réponse ressource non trouvée
     */
    public static function notFound($message = 'Ressource non trouvée')
    {
        self::error($message, 404);
    }

    /**
     * Envoyer une réponse erreur serveur
     */
    public static function serverError($message = 'Erreur serveur')
    {
        self::error($message, 500);
    }

    /**
     * Définir les headers HTTP appropriés
     */
    private static function setHeaders()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
        }
    }

    /**
     * Envoyer une réponse avec pagination
     */
    public static function paginated($data, $total, $page, $perPage, $message = 'Succès')
    {
        self::setHeaders();
        http_response_code(200);
        
        echo json_encode([
            'success' => true,
            'code' => 200,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage,
                'totalPages' => ceil($total / $perPage)
            ]
        ]);
        
        exit;
    }

    /**
     * Envoyer une réponse avec métadonnées
     */
    public static function withMetadata($data, $metadata = [], $message = 'Succès', $code = 200)
    {
        self::setHeaders();
        http_response_code($code);
        
        echo json_encode([
            'success' => true,
            'code' => $code,
            'message' => $message,
            'data' => $data,
            'metadata' => $metadata
        ]);
        
        exit;
    }
}
?>
