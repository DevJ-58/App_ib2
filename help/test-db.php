<?php
/**
 * Fichier de test - Vérifier la connexion à la base de données
 * Ouvrir dans le navigateur : http://localhost/APP_IB/test-db.php
 */

require_once 'backend/bootstrap.php';
require_once 'backend/models/Database.php';
require_once 'backend/models/User.php';

use backend\models\Database;
use backend\models\User;

// Afficher les erreurs
ini_set('display_errors', 1);
error_reporting(E_ALL);

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - Connexion Base de Données</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .success { 
            color: #155724;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
        }
        .error { 
            color: #721c24;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
        }
        .info {
            color: #004085;
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
        }
        .test-item {
            margin: 15px 0;
            padding: 10px;
            border-left: 4px solid #ddd;
        }
        .test-item.pass {
            border-left-color: #28a745;
        }
        .test-item.fail {
            border-left-color: #dc3545;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        table th {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge.admin {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .badge.vendeur {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test - Connexion Base de Données</h1>
        
        <?php
        
        // Test 1 : Connexion à la base de données
        echo "<div class='test-item'>";
        try {
            $db = Database::getInstance();
            echo "<div class='success'>✅ Connexion à la base de données réussie</div>";
            $pass1 = true;
        } catch (Exception $e) {
            echo "<div class='error'>❌ Erreur de connexion : " . htmlspecialchars($e->getMessage()) . "</div>";
            $pass1 = false;
        }
        echo "</div>";
        
        if ($pass1) {
            // Test 2 : Vérifier les tables
            echo "<div class='test-item'>";
            try {
                $tables = [
                    'utilisateurs',
                    'categories',
                    'produits',
                    'ventes',
                    'credits',
                    'mouvements_stock'
                ];
                
                $result = $db->select("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'gestion_stock'");
                $existingTables = array_column($result, 'TABLE_NAME');
                
                $allExists = true;
                $html = "<table><tr><th>Table</th><th>État</th></tr>";
                
                foreach ($tables as $table) {
                    if (in_array($table, $existingTables)) {
                        $html .= "<tr><td>$table</td><td><span class='badge' style='background-color: #d4edda; color: #155724;'>✅ Existe</span></td></tr>";
                    } else {
                        $html .= "<tr><td>$table</td><td><span class='badge' style='background-color: #f8d7da; color: #721c24;'>❌ Manquante</span></td></tr>";
                        $allExists = false;
                    }
                }
                $html .= "</table>";
                
                if ($allExists) {
                    echo "<div class='success'>✅ Toutes les tables requises existent</div>";
                } else {
                    echo "<div class='error'>⚠️ Certaines tables sont manquantes. Exécutez database/schema.sql</div>";
                }
                
                echo $html;
            } catch (Exception $e) {
                echo "<div class='error'>❌ Erreur lors de la vérification : " . htmlspecialchars($e->getMessage()) . "</div>";
            }
            echo "</div>";
            
            // Test 3 : Compter les utilisateurs
            echo "<div class='test-item'>";
            try {
                $userModel = new User();
                $count = $userModel->count();
                
                if ($count > 0) {
                    echo "<div class='success'>✅ $count utilisateur(s) trouvé(s)</div>";
                    
                    // Afficher les utilisateurs
                    $users = $userModel->getAll();
                    $html = "<table>";
                    $html .= "<tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th><th>Rôle</th></tr>";
                    
                    foreach ($users as $user) {
                        $role = $user['role'];
                        $badgeClass = $role === 'admin' ? 'badge-admin' : 'badge-vendeur';
                        $html .= "<tr>";
                        $html .= "<td>" . htmlspecialchars($user['id']) . "</td>";
                        $html .= "<td>" . htmlspecialchars($user['nom']) . "</td>";
                        $html .= "<td>" . htmlspecialchars($user['prenom']) . "</td>";
                        $html .= "<td>" . htmlspecialchars($user['telephone']) . "</td>";
                        $html .= "<td>" . htmlspecialchars($user['email']) . "</td>";
                        $html .= "<td><span class='badge " . ($role === 'admin' ? 'admin' : 'vendeur') . "'>" . htmlspecialchars($role) . "</span></td>";
                        $html .= "</tr>";
                    }
                    $html .= "</table>";
                    
                    echo $html;
                } else {
                    echo "<div class='error'>⚠️ Aucun utilisateur trouvé. Exécutez database/schema.sql pour charger les données de test</div>";
                }
            } catch (Exception $e) {
                echo "<div class='error'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</div>";
            }
            echo "</div>";
            
            // Test 4 : Tester la connexion avec les identifiants de test
            echo "<div class='test-item'>";
            try {
                $userModel = new User();
                $result = $userModel->verifierIdentifiants('0123456789', '123456');
                
                if ($result['success']) {
                    echo "<div class='success'>✅ Authentification réussie</div>";
                    echo "<div class='info'>";
                    echo "👤 Utilisateur : " . htmlspecialchars($result['user']['prenom']) . " " . htmlspecialchars($result['user']['nom']) . "<br>";
                    echo "📱 Téléphone : " . htmlspecialchars($result['user']['telephone']) . "<br>";
                    echo "🔐 Rôle : <span class='badge " . ($result['user']['role'] === 'admin' ? 'admin' : 'vendeur') . "'>" . htmlspecialchars($result['user']['role']) . "</span>";
                    echo "</div>";
                } else {
                    echo "<div class='error'>❌ Authentification échouée : " . htmlspecialchars($result['message']) . "</div>";
                }
            } catch (Exception $e) {
                echo "<div class='error'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</div>";
            }
            echo "</div>";
            
            // Test 5 : Afficher les informations de configuration
            echo "<div class='test-item'>";
            echo "<h2>⚙️ Configuration</h2>";
            echo "<div class='info'>";
            echo "🖥️ Serveur : localhost<br>";
            echo "🗄️ Base de données : gestion_stock<br>";
            echo "👤 Utilisateur MySQL : root<br>";
            echo "🔧 PHP Version : " . phpversion() . "<br>";
            echo "🐬 Extension MySQL : " . (extension_loaded('pdo_mysql') ? '✅ Disponible' : '❌ Non disponible') . "<br>";
            echo "</div>";
            echo "</div>";
            
        } else {
            echo "<div class='test-item'>";
            echo "<div class='error'><strong>Configuration requise :</strong></div>";
            echo "<ul>";
            echo "<li>MySQL/MariaDB doit être en cours d'exécution</li>";
            echo "<li>Vérifiez les identifiants dans backend/models/Database.php</li>";
            echo "<li>Exécutez database/schema.sql pour créer la base de données</li>";
            echo "</ul>";
            echo "</div>";
        }
        ?>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h2>📝 Utilisateurs de test</h2>
            <table>
                <tr>
                    <th>Téléphone</th>
                    <th>Mot de passe</th>
                    <th>Rôle</th>
                    <th>Lien</th>
                </tr>
                <tr>
                    <td><code>0123456789</code></td>
                    <td><code>123456</code></td>
                    <td><span class='badge admin'>admin</span></td>
                    <td><a href="frontend/HTML/connexion.html">Aller à la connexion →</a></td>
                </tr>
                <tr>
                    <td><code>0987654321</code></td>
                    <td><code>123456</code></td>
                    <td><span class='badge vendeur'>vendeur</span></td>
                    <td><a href="frontend/HTML/connexion.html">Aller à la connexion →</a></td>
                </tr>
                <tr>
                    <td><code>0555555555</code></td>
                    <td><code>123456</code></td>
                    <td><span class='badge vendeur'>vendeur</span></td>
                    <td><a href="frontend/HTML/connexion.html">Aller à la connexion →</a></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
