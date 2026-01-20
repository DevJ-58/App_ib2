<?php
/**
 * Modèle Product - Gestion des produits
 */

namespace backend\models;

use backend\models\Database;

class Product
{
    private $db;
    private $id;
    private $code_barre;
    private $code_interne;
    private $nom;
    private $categorie_id;
    private $prix_achat;
    private $prix_vente;
    private $stock;
    private $seuil_alerte;
    private $icone;
    private $photo;
    private $actif;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouveau produit
     */
    public function create($data)
    {
        try {
            // Si code_barre n'est pas fourni, le générer automatiquement
            if (empty($data['code_barre'])) {
                // Générer un code-barre unique basé sur le timestamp et l'ID
                $data['code_barre'] = 'EAN' . time() . rand(1000, 9999);
            }
            
            // Si categorie_id n'est pas fourni, utiliser la première catégorie disponible
            if (empty($data['categorie_id'])) {
                $result = $this->db->selectOne("SELECT id FROM categories LIMIT 1");
                $data['categorie_id'] = $result['id'] ?? 1; // Utiliser ID 1 par défaut
            }
            
            $query = "INSERT INTO produits (code_barre, code_interne, nom, categorie_id, prix_achat, prix_vente, stock, seuil_alerte, icone, photo, actif) 
                      VALUES (:code_barre, :code_interne, :nom, :categorie_id, :prix_achat, :prix_vente, :stock, :seuil_alerte, :icone, :photo, :actif)";
            
            $params = [
                ':code_barre' => $data['code_barre'],
                ':code_interne' => $data['code_interne'] ?? null,
                ':nom' => $data['nom'] ?? null,
                ':categorie_id' => $data['categorie_id'],
                ':prix_achat' => $data['prix_achat'] ?? 0,
                ':prix_vente' => $data['prix_vente'] ?? null,
                ':stock' => $data['stock'] ?? 0,
                ':seuil_alerte' => $data['seuil_alerte'] ?? 5,
                ':icone' => $data['icone'] ?? 'fa-box',
                ':photo' => $data['photo'] ?? null,
                ':actif' => $data['actif'] ?? true
            ];

            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute($params);
            
            return $this->db->getConnection()->lastInsertId();
        } catch (\Exception $e) {
            throw new \Exception("Erreur création produit: " . $e->getMessage());
        }
    }

    /**
     * Récupérer tous les produits
     */
    public function getAll($actifOnly = true)
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id";
            
            if ($actifOnly) {
                $query .= " WHERE p.actif = true";
            }
            
            $query .= " ORDER BY p.nom ASC";
            
            return $this->db->select($query);
        } catch (\Exception $e) {
            throw new \Exception("Erreur lecture produits: " . $e->getMessage());
        }
    }

    /**
     * Récupérer un produit par ID
     */
    public function getById($id)
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id 
                      WHERE p.id = :id";
            
            return $this->db->selectOne($query, [':id' => $id]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Récupérer un produit par code-barre
     */
    public function getByBarcode($code_barre)
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id 
                      WHERE p.code_barre = :code_barre";
            
            return $this->db->selectOne($query, [':code_barre' => $code_barre]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Récupérer les produits d'une catégorie
     */
    public function getByCategory($categorie_id)
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id 
                      WHERE p.categorie_id = :categorie_id AND p.actif = true 
                      ORDER BY p.nom ASC";
            
            return $this->db->select($query, [':categorie_id' => $categorie_id]);
        } catch (\Exception $e) {
            throw new \Exception("Erreur lecture produits par catégorie: " . $e->getMessage());
        }
    }

    /**
     * Récupérer les produits en alerte (stock faible)
     */
    public function getAlertes()
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id 
                      WHERE p.stock <= p.seuil_alerte AND p.actif = true 
                      ORDER BY p.stock ASC";
            
            return $this->db->select($query);
        } catch (\Exception $e) {
            throw new \Exception("Erreur lecture alertes: " . $e->getMessage());
        }
    }

    /**
     * Mettre à jour un produit
     */
    public function update($id, $data)
    {
        try {
            $fields = [];
            $params = [':id' => $id];

            foreach ($data as $key => $value) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }

            if (empty($fields)) {
                throw new \Exception("Aucune donnée à mettre à jour");
            }

            $query = "UPDATE produits SET " . implode(", ", $fields) . " WHERE id = :id";
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute($params);
            
            return $stmt->rowCount();
        } catch (\Exception $e) {
            throw new \Exception("Erreur mise à jour produit: " . $e->getMessage());
        }
    }

    /**
     * Supprimer un produit (soft delete)
     */
    public function delete($id)
    {
        try {
            // Soft delete: marquer comme inactif
            $query = "UPDATE produits SET actif = false WHERE id = :id";
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([':id' => intval($id)]);
            
            error_log("DELETE: Query=$query, ID=$id, RowCount=" . $stmt->rowCount());
            
            return $stmt->rowCount();
        } catch (\Exception $e) {
            error_log("DELETE ERROR: " . $e->getMessage());
            throw new \Exception("Erreur suppression produit: " . $e->getMessage());
        }
    }
    
    /**
     * Supprimer physiquement un produit (vrai DELETE, pas soft delete)
     */
    public function forceDelete($id)
    {
        try {
            // Hard delete: supprimer vraiment la ligne
            $query = "DELETE FROM produits WHERE id = :id";
            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([':id' => intval($id)]);
            
            error_log("FORCE_DELETE: Query=$query, ID=$id, RowCount=" . $stmt->rowCount());
            
            return $stmt->rowCount();
        } catch (\Exception $e) {
            error_log("FORCE_DELETE ERROR: " . $e->getMessage());
            throw new \Exception("Erreur suppression produit: " . $e->getMessage());
        }
    }

    /**
     * Supprimer physiquement un produit et ses dépendances (transactionnel)
     */
    public function forceDeleteWithDeps($id)
    {
        $conn = $this->db->getConnection();
        try {
            $conn->beginTransaction();

            // Supprimer les détails d'inventaire
            $q1 = "DELETE FROM details_inventaires WHERE produit_id = :id";
            $stmt1 = $conn->prepare($q1);
            $stmt1->execute([':id' => intval($id)]);

            // Supprimer les mouvements de stock
            $q2 = "DELETE FROM mouvements_stock WHERE produit_id = :id";
            $stmt2 = $conn->prepare($q2);
            $stmt2->execute([':id' => intval($id)]);

            // Supprimer les détails de ventes
            $q3 = "DELETE FROM details_ventes WHERE produit_id = :id";
            $stmt3 = $conn->prepare($q3);
            $stmt3->execute([':id' => intval($id)]);

            // Enfin supprimer le produit
            $q4 = "DELETE FROM produits WHERE id = :id";
            $stmt4 = $conn->prepare($q4);
            $stmt4->execute([':id' => intval($id)]);

            $conn->commit();

            $total = $stmt1->rowCount() + $stmt2->rowCount() + $stmt3->rowCount() + $stmt4->rowCount();
            error_log("FORCE_DELETE_WITH_DEPS: Deleted rows for ID=$id totals: " . $total);
            return $total;
        } catch (\Exception $e) {
            $conn->rollBack();
            error_log("FORCE_DELETE_WITH_DEPS ERROR: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Mettre à jour le stock
     */
    public function updateStock($id, $quantite, $operation = 'add')
    {
        try {
            if ($operation === 'add') {
                $query = "UPDATE produits SET stock = stock + :quantite WHERE id = :id";
            } else if ($operation === 'subtract') {
                $query = "UPDATE produits SET stock = stock - :quantite WHERE id = :id";
            } else if ($operation === 'set') {
                $query = "UPDATE produits SET stock = :quantite WHERE id = :id";
            } else {
                throw new \Exception("Opération non reconnue: $operation");
            }

            $stmt = $this->db->getConnection()->prepare($query);
            $stmt->execute([':id' => $id, ':quantite' => $quantite]);
            
            return $stmt->rowCount();
        } catch (\Exception $e) {
            throw new \Exception("Erreur mise à jour stock: " . $e->getMessage());
        }
    }

    /**
     * Chercher des produits
     */
    public function search($keyword)
    {
        try {
            $query = "SELECT p.*, c.nom as categorie_nom FROM produits p 
                      LEFT JOIN categories c ON p.categorie_id = c.id 
                      WHERE (p.nom LIKE :keyword OR p.code_barre LIKE :keyword OR p.code_interne LIKE :keyword) 
                      AND p.actif = true 
                      ORDER BY p.nom ASC";
            
            $keyword = "%$keyword%";
            return $this->db->select($query, [':keyword' => $keyword]);
        } catch (\Exception $e) {
            throw new \Exception("Erreur recherche: " . $e->getMessage());
        }
    }

    // Getters et Setters
    public function getId() { return $this->id; }
    public function setId($id) { $this->id = $id; return $this; }

    public function getCodeBarre() { return $this->code_barre; }
    public function setCodeBarre($code_barre) { $this->code_barre = $code_barre; return $this; }

    public function getNom() { return $this->nom; }
    public function setNom($nom) { $this->nom = $nom; return $this; }

    public function getPrixVente() { return $this->prix_vente; }
    public function setPrixVente($prix_vente) { $this->prix_vente = $prix_vente; return $this; }

    public function getStock() { return $this->stock; }
    public function setStock($stock) { $this->stock = $stock; return $this; }
}
?>
