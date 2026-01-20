<?php
/**
 * DELETE /Api/Products/delete.php
 * Supprimer un produit
 */

require_once __DIR__ . '/../../bootstrap.php';

use backend\models\Product;
use backend\utils\Response;

try {
    error_log("DELETE API: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD'] . ", GET=" . json_encode($_GET) . ", POST=" . json_encode($_POST));
    
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer l'ID du produit
    $id = $_GET['id'] ?? $_POST['id'] ?? null;
    error_log("DELETE API: ID récupéré = " . ($id ?? 'NULL'));
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID produit manquant']);
        exit;
    }

    // Vérifier que le produit existe
    $product = new Product();
    $existing = $product->getById($id);
    error_log("DELETE API: Produit existe? " . ($existing ? "OUI" : "NON"));
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
        exit;
    }

        // Mode de suppression: soft (par défaut) ou hard lorsque ?mode=hard ou POST mode=hard
        $mode = $_GET['mode'] ?? $_POST['mode'] ?? null;
        if ($mode === 'hard') {
            // suppression physique
            try {
                $rowCount = $product->forceDelete($id);
                error_log("DELETE API: forceDelete() retourné $rowCount lignes modifiées pour ID=$id");
                Response::success(null, 'Produit supprimé définitivement', 200);
            } catch (\Exception $e) {
                // Contrainte référentielle fréquente (SQLSTATE 23000 / code 1451)
                $msg = $e->getMessage();
                if (stripos($msg, '1451') !== false || stripos($msg, 'referential') !== false || stripos($msg, 'Integrity constraint') !== false) {
                    Response::error('Impossible de supprimer définitivement : contraintes référentielles existent (mouvements/ventes). Utilisez la suppression normale.', 400);
                } else {
                    Response::error($e->getMessage(), 400);
                }
            }
        } elseif ($mode === 'hard_cleanup') {
            // suppression physique après nettoyage des dépendances
            try {
                $rowCount = $product->forceDeleteWithDeps($id);
                error_log("DELETE API: forceDeleteWithDeps() retourné $rowCount lignes modifiées pour ID=$id");
                Response::success(null, 'Produit et dépendances supprimés définitivement', 200);
            } catch (\Exception $e) {
                Response::error($e->getMessage(), 400);
            <?php
            /**
             * DELETE /Api/Products/delete.php
             * Supprimer un produit (VRAIE SUPPRESSION par défaut)
             */

            require_once __DIR__ . '/../../bootstrap.php';

            use backend\models\Product;
            use backend\utils\Response;

            try {
                error_log("DELETE API: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD']);
                error_log("DELETE API: GET=" . json_encode($_GET));
                error_log("DELETE API: POST=" . json_encode($_POST));
    
                // Accepter POST et DELETE
                if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
                    Response::error('Méthode non autorisée', 405);
                }

                // ✅ Récupérer l'ID correctement
                $id = null;
                $mode = 'hard'; // PAR DÉFAUT: vraie suppression
    
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $id = $_POST['id'] ?? null;
                    $mode = $_POST['mode'] ?? 'hard';
                } else {
                    $id = $_GET['id'] ?? null;
                    $mode = $_GET['mode'] ?? 'hard';
                }
    
                error_log("DELETE API: ID=$id, Mode=$mode");
    
                if (!$id) {
                    Response::error('ID produit manquant', 400);
                }

                // Vérifier que le produit existe
                $product = new Product();
                $existing = $product->getById($id);
    
                if (!$existing) {
                    Response::error('Produit non trouvé (ID: ' . $id . ')', 404);
                }

                error_log("DELETE API: Produit trouvé - Nom: " . $existing['nom']);

                // ✅ Mode de suppression
                if ($mode === 'soft') {
                    // Suppression logique (actif = 0)
                    $rowCount = $product->delete($id);
                    error_log("DELETE API: soft delete - Lignes affectées: $rowCount");
        
                    if ($rowCount > 0) {
                        Response::success(null, 'Produit désactivé (soft delete)', 200);
                    } else {
                        Response::error('Aucune ligne modifiée', 500);
                    }
        
                } elseif ($mode === 'hard_cleanup') {
                    // Suppression physique + nettoyage dépendances
                    try {
                        $rowCount = $product->forceDeleteWithDeps($id);
                        error_log("DELETE API: hard_cleanup - Lignes affectées: $rowCount");
            
                        if ($rowCount > 0) {
                            Response::success(null, 'Produit et dépendances supprimés définitivement', 200);
                        } else {
                            Response::error('Aucune ligne supprimée', 500);
                        }
                    } catch (\Exception $e) {
                        Response::error('Erreur suppression: ' . $e->getMessage(), 500);
                    }
        
                } else {
                    // Suppression physique (DELETE FROM) - PAR DÉFAUT
                    try {
                        $rowCount = $product->forceDelete($id);
                        error_log("DELETE API: hard delete - Lignes affectées: $rowCount");
            
                        if ($rowCount > 0) {
                            Response::success(null, 'Produit supprimé définitivement de la base de données', 200);
                        } else {
                            Response::error('Aucune ligne supprimée', 500);
                        }
                    } catch (\Exception $e) {
                        $msg = $e->getMessage();
            
                        // Vérifier erreur de contrainte référentielle
                        if (stripos($msg, '1451') !== false || 
                            stripos($msg, 'foreign key') !== false || 
                            stripos($msg, 'constraint') !== false) {
                            Response::error('Impossible de supprimer : ce produit est lié à des ventes/mouvements. Contactez l\'administrateur.', 409);
                        } else {
                            Response::error('Erreur suppression: ' . $msg, 500);
                        }
                    }
                }

            } catch (\Exception $e) {
                error_log("DELETE API ERROR: " . $e->getMessage());
                error_log("DELETE API TRACE: " . $e->getTraceAsString());
                Response::error('Erreur serveur: ' . $e->getMessage(), 500);
            }
            ?>
