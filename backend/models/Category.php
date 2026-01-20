<?php
/**
 * Model Category
 * Gestion des catégories de produits
 */

namespace backend\models;

use backend\models\Database;
use \PDO;
use \Exception;

class Category
{
    private $db;
    private $table = 'categories';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Lister toutes les catégories actives
     */
    public function getAll($includeInactive = false)
    {
        $sql = "SELECT id, nom, actif FROM {$this->table}";
        
        if (!$includeInactive) {
            $sql .= " WHERE actif = 1";
        }
        
        $sql .= " ORDER BY nom ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer une catégorie par ID
     */
    public function getById($id)
    {
        $sql = "SELECT id, nom, actif FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer une catégorie par nom
     */
    public function getByNom($nom)
    {
        $sql = "SELECT id, nom, actif FROM {$this->table} WHERE nom = :nom";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':nom' => $nom]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Créer une nouvelle catégorie
     */
    public function create($nom)
    {
        if (empty($nom)) {
            throw new Exception("Le nom de la catégorie est obligatoire");
        }

        // Vérifier si la catégorie existe déjà
        if ($this->getByNom($nom)) {
            throw new Exception("Une catégorie avec ce nom existe déjà");
        }

        $sql = "INSERT INTO {$this->table} (nom, actif) VALUES (:nom, 1)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':nom' => $nom]);

        return $this->db->lastInsertId();
    }

    /**
     * Mettre à jour une catégorie
     */
    public function update($id, $nom)
    {
        if (empty($nom)) {
            throw new Exception("Le nom de la catégorie est obligatoire");
        }

        // Vérifier que la catégorie existe
        if (!$this->getById($id)) {
            throw new Exception("Catégorie non trouvée");
        }

        // Vérifier que le nouveau nom n'existe pas déjà (sauf pour la même catégorie)
        $existing = $this->getByNom($nom);
        if ($existing && $existing['id'] != $id) {
            throw new Exception("Une autre catégorie avec ce nom existe déjà");
        }

        $sql = "UPDATE {$this->table} SET nom = :nom WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':nom' => $nom, ':id' => $id]);
    }

    /**
     * Soft delete: marquer une catégorie comme inactive
     */
    public function delete($id)
    {
        if (!$this->getById($id)) {
            throw new Exception("Catégorie non trouvée");
        }

        $sql = "UPDATE {$this->table} SET actif = 0 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Hard delete: supprimer physiquement une catégorie
     * Échoue s'il y a des produits dépendants
     */
    public function forceDelete($id)
    {
        if (!$this->getById($id)) {
            throw new Exception("Catégorie non trouvée");
        }

        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Hard delete avec nettoyage: supprimer physiquement une catégorie
     * Supprime d'abord tous les produits dépendants (et leurs mouvements/ventes)
     */
    public function forceDeleteWithDeps($id)
    {
        if (!$this->getById($id)) {
            throw new Exception("Catégorie non trouvée");
        }

        try {
            // Démarrer une transaction
            $this->db->beginTransaction();

            // 1. Récupérer les IDs de tous les produits de cette catégorie
            $sql = "SELECT id FROM produits WHERE categorie_id = :categorie_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':categorie_id' => $id]);
            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalDeleted = 0;

            // 2. Pour chaque produit, supprimer ses dépendances
            foreach ($produits as $produit) {
                $produitId = $produit['id'];

                // Supprimer les mouvements_stock
                $sql = "DELETE FROM mouvements_stock WHERE produit_id = :produit_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':produit_id' => $produitId]);
                $totalDeleted += $stmt->rowCount();

                // Supprimer les details_inventaires (si la table existe)
                $sql = "DELETE FROM details_inventaires WHERE produit_id = :produit_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':produit_id' => $produitId]);
                $totalDeleted += $stmt->rowCount();

                // Supprimer les details_ventes
                $sql = "DELETE FROM details_ventes WHERE produit_id = :produit_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':produit_id' => $produitId]);
                $totalDeleted += $stmt->rowCount();

                // Supprimer le produit lui-même
                $sql = "DELETE FROM produits WHERE id = :produit_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':produit_id' => $produitId]);
                $totalDeleted += $stmt->rowCount();
            }

            // 3. Supprimer la catégorie
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $totalDeleted += $stmt->rowCount();

            // Valider la transaction
            $this->db->commit();

            return $totalDeleted;

        } catch (Exception $e) {
            // Annuler la transaction en cas d'erreur
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Compter les produits dépendants d'une catégorie
     */
    public function countDependents($id)
    {
        $sql = "SELECT COUNT(*) as count FROM produits WHERE categorie_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }
}
