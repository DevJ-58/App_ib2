<?php
/**
 * Modèle User - Gestion des utilisateurs
 * 
 * Utilise la table `utilisateurs` avec les colonnes :
 * - id (INT) : Identifiant unique
 * - nom (VARCHAR) : Nom de l'utilisateur
 * - prenom (VARCHAR) : Prénom
 * - telephone (VARCHAR) : Téléphone unique (identifiant pour la connexion)
 * - email (VARCHAR) : Email unique
 * - mot_de_passe (VARCHAR) : Mot de passe haché BCRYPT
 * - role (ENUM) : 'admin' ou 'vendeur'
 * - photo (TEXT) : Photo de profil (optionnel)
 * - actif (BOOLEAN) : Compte actif ou non
 * - created_at (TIMESTAMP) : Date de création
 * - derniere_connexion (TIMESTAMP) : Dernière connexion
 */

namespace backend\models;

class User
{
    private $db;
    private $id;
    private $nom;
    private $prenom;
    private $telephone;
    private $email;
    private $motDePasse;
    private $role;
    private $photo;
    private $dateCreation;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function create($data)
    {
        try {
            $query = "INSERT INTO utilisateurs (nom, prenom, telephone, email, mot_de_passe, role, photo) 
                      VALUES (:nom, :prenom, :telephone, :email, :mot_de_passe, :role, :photo)";
            
            $params = [
                ':nom' => $data['nom'],
                ':prenom' => $data['prenom'],
                ':telephone' => $data['telephone'],
                ':email' => $data['email'],
                ':mot_de_passe' => password_hash($data['mot_de_passe'], PASSWORD_BCRYPT),
                ':role' => $data['role'] ?? 'vendeur',
                ':photo' => $data['photo'] ?? null
            ];

            $this->db->execute($query, $params);
            return [
                'success' => true,
                'id' => $this->db->lastInsertId(),
                'message' => 'Utilisateur créé avec succès'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public function getById($id)
    {
        try {
            $query = "SELECT id, nom, prenom, telephone, email, role, photo, created_at 
                      FROM utilisateurs WHERE id = :id";
            
            return $this->db->selectOne($query, [':id' => $id]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Récupérer un utilisateur par téléphone
     */
    public function getByTelephone($telephone)
    {
        try {
            $query = "SELECT id, nom, prenom, telephone, email, role, photo, mot_de_passe, created_at 
                      FROM utilisateurs WHERE telephone = :telephone";
            $res = $this->db->selectOne($query, [':telephone' => $telephone]);
            // error_log('User::getByTelephone SQL: ' . $query . ' -- param: ' . $telephone . ' -- result: ' . json_encode($res));
            return $res;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Récupérer un utilisateur par email
     */
    public function getByEmail($email)
    {
        try {
            $query = "SELECT id, nom, prenom, telephone, email, role, photo, created_at 
                      FROM utilisateurs WHERE email = :email";
            
            return $this->db->selectOne($query, [':email' => $email]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Vérifier les identifiants (connexion)
     */
    public function verifierIdentifiants($telephone, $motDePasse)
    {
        try {
            $utilisateur = $this->getByTelephone($telephone);
            
            if (!$utilisateur) {
                return [
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ];
            }

            if (!password_verify($motDePasse, $utilisateur['mot_de_passe'])) {
                return [
                    'success' => false,
                    'message' => 'Mot de passe incorrect'
                ];
            }

            // Retourner l'utilisateur sans le mot de passe
            unset($utilisateur['mot_de_passe']);
            
            return [
                'success' => true,
                'user' => $utilisateur,
                'message' => 'Authentification réussie'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Vérifier si un email existe déjà
     */
    public function emailExists($email)
    {
        $res = $this->getByEmail($email);
        $exists = ($res !== false && $res !== null);
        // error_log('User::emailExists: ' . $email . ' => ' . ($exists ? 'true' : 'false'));
        return $exists;
    }

    /**
     * Vérifier si un téléphone existe déjà
     */
    public function telephoneExists($telephone)
    {
        $res = $this->getByTelephone($telephone);
        $exists = ($res !== false && $res !== null);
        // error_log('User::telephoneExists: ' . $telephone . ' => ' . ($exists ? 'true' : 'false'));
        return $exists;
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update($id, $data)
    {
        try {
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['nom'])) {
                $fields[] = "nom = :nom";
                $params[':nom'] = $data['nom'];
            }
            if (isset($data['prenom'])) {
                $fields[] = "prenom = :prenom";
                $params[':prenom'] = $data['prenom'];
            }
            if (isset($data['email'])) {
                $fields[] = "email = :email";
                $params[':email'] = $data['email'];
            }
            if (isset($data['photo'])) {
                $fields[] = "photo = :photo";
                $params[':photo'] = $data['photo'];
            }
            if (isset($data['mot_de_passe'])) {
                $fields[] = "mot_de_passe = :mot_de_passe";
                $params[':mot_de_passe'] = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT);
            }

            if (empty($fields)) {
                return [
                    'success' => false,
                    'message' => 'Aucune donnée à mettre à jour'
                ];
            }

            $query = "UPDATE utilisateurs SET " . implode(', ', $fields) . " WHERE id = :id";

            $this->db->execute($query, $params);

            return [
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Supprimer un utilisateur
     */
    public function delete($id)
    {
        try {
            $query = "DELETE FROM utilisateurs WHERE id = :id";
            $this->db->execute($query, [':id' => $id]);

            return [
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public function getAll($limit = null, $offset = 0)
    {
        try {
            $query = "SELECT id, nom, prenom, telephone, email, role, photo, created_at 
                      FROM utilisateurs ORDER BY created_at DESC";
            
            if ($limit) {
                $query .= " LIMIT :limit OFFSET :offset";
                return $this->db->select($query, [':limit' => $limit, ':offset' => $offset]);
            }

            return $this->db->select($query);
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Compter le nombre d'utilisateurs
     */
    public function count()
    {
        try {
            $query = "SELECT COUNT(*) as total FROM utilisateurs";
            $result = $this->db->selectOne($query);
            return $result['total'] ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Enregistrer le token de réinitialisation pour un utilisateur
     */
    public function setResetToken($userId, $token, $expiresTimestamp)
    {
        $expires = date('Y-m-d H:i:s', $expiresTimestamp);
        $query = "UPDATE utilisateurs SET reset_token = :token, reset_token_expires = :expires WHERE id = :id";
        return $this->db->execute($query, [':token' => $token, ':expires' => $expires, ':id' => $userId]);
    }

    /**
     * Récupérer un utilisateur par token de réinitialisation valide
     */
    public function getByResetToken($token)
    {
        $query = "SELECT id, nom, prenom, telephone, email, role, photo, reset_token_expires FROM utilisateurs WHERE reset_token = :token AND reset_token_expires >= NOW()";
        return $this->db->selectOne($query, [':token' => $token]);
    }

    /**
     * Réinitialiser le mot de passe via token et supprimer le token
     */
    public function resetPasswordWithToken($token, $newPassword)
    {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $query = "UPDATE utilisateurs SET mot_de_passe = :pwd, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = :token";
        return $this->db->execute($query, [':pwd' => $hash, ':token' => $token]);
    }
}
?>
