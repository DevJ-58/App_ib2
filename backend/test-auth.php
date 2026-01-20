<?php
/**
 * Test de Configuration - Vérification du système d'authentification
 * Accédez à: http://localhost/APP_IB/backend/test-auth.php
 */

// Démarrer la sortie buffering pour afficher des messages avant les headers
ob_start();

require_once __DIR__ . '/bootstrap.php';

// Arrêter la configuration CORS pour ce test
session_start();

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Configuration Authentification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .test-group {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
        }
        .test-group-header {
            background: #f5f5f5;
            padding: 15px;
            font-weight: bold;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .test-group-header .icon {
            font-size: 20px;
        }
        .test-item {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-label {
            flex: 1;
        }
        .test-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
        }
        .status-success {
            background: #c8e6c9;
            color: #2e7d32;
        }
        .status-error {
            background: #ffcdd2;
            color: #c62828;
        }
        .status-warning {
            background: #fff3cd;
            color: #856404;
        }
        .status-info {
            background: #bbdefb;
            color: #0d47a1;
        }
        .details {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            margin-top: 10px;
            color: #666;
        }
        .summary {
            background: #f0f7ff;
            border: 1px solid #667eea;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        .summary-value {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Configuration Authentification</h1>
            <p>Vérification du système avant utilisation en production</p>
        </div>
        
        <div class="content">
            <!-- Résumé -->
            <div class="summary">
                <h3>📊 Résumé</h3>
                <div class="summary-item">
                    <span>Date du test:</span>
                    <span class="summary-value"><?php echo date('d/m/Y H:i:s'); ?></span>
                </div>
                <div class="summary-item">
                    <span>Version PHP:</span>
                    <span class="summary-value"><?php echo phpversion(); ?></span>
                </div>
                <div class="summary-item">
                    <span>Serveur:</span>
                    <span class="summary-value"><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu'; ?></span>
                </div>
            </div>

            <!-- Test 1: Configuration PHP -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">⚙️</span>
                    <span>Configuration PHP</span>
                </div>
                
                <div class="test-item">
                    <div class="test-label">
                        <strong>Version PHP</strong>
                        <div class="details">Version minimale requise: 7.4</div>
                    </div>
                    <span class="test-status <?php echo version_compare(phpversion(), '7.4', '>=') ? 'status-success' : 'status-error'; ?>">
                        <?php echo version_compare(phpversion(), '7.4', '>=') ? '✓ OK' : '✗ NOK'; ?>
                    </span>
                </div>

                <div class="test-item">
                    <div class="test-label">
                        <strong>Extension PDO</strong>
                        <div class="details">Requise pour la connexion à la base de données</div>
                    </div>
                    <span class="test-status <?php echo extension_loaded('pdo') ? 'status-success' : 'status-error'; ?>">
                        <?php echo extension_loaded('pdo') ? '✓ OK' : '✗ NOK'; ?>
                    </span>
                </div>

                <div class="test-item">
                    <div class="test-label">
                        <strong>Extension PDO MySQL</strong>
                        <div class="details">Requise pour MySQL</div>
                    </div>
                    <span class="test-status <?php echo extension_loaded('pdo_mysql') ? 'status-success' : 'status-error'; ?>">
                        <?php echo extension_loaded('pdo_mysql') ? '✓ OK' : '✗ NOK'; ?>
                    </span>
                </div>

                <div class="test-item">
                    <div class="test-label">
                        <strong>Sessions</strong>
                        <div class="details">Requises pour l'authentification</div>
                    </div>
                    <span class="test-status <?php echo isset($_SESSION) ? 'status-success' : 'status-error'; ?>">
                        <?php echo isset($_SESSION) ? '✓ OK' : '✗ NOK'; ?>
                    </span>
                </div>
            </div>

            <!-- Test 2: Configuration Fichiers -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">📁</span>
                    <span>Fichiers Configuration</span>
                </div>
                
                <?php
                $files = [
                    'bootstrap.php' => __DIR__ . '/bootstrap.php',
                    'configs/cors.php' => __DIR__ . '/configs/cors.php',
                    'configs/database.php' => __DIR__ . '/configs/database.php',
                    'models/Database.php' => __DIR__ . '/models/Database.php',
                    'utils/Response.php' => __DIR__ . '/utils/Response.php',
                    'utils/Security.php' => __DIR__ . '/utils/Security.php',
                    'Api/Auth/login.php' => __DIR__ . '/Api/Auth/login.php',
                    'Api/Auth/register.php' => __DIR__ . '/Api/Auth/register.php',
                    'Api/Auth/check.php' => __DIR__ . '/Api/Auth/check.php',
                    'Api/Auth/logout.php' => __DIR__ . '/Api/Auth/logout.php',
                ];
                
                foreach ($files as $name => $path) {
                    $exists = file_exists($path);
                    $readable = is_readable($path);
                    $status = $exists && $readable ? 'status-success' : ($exists ? 'status-warning' : 'status-error');
                    $text = $exists && $readable ? '✓ OK' : ($exists ? '⚠ Non lisible' : '✗ Manquant');
                    
                    echo "<div class='test-item'>";
                    echo "<div class='test-label'><strong>$name</strong></div>";
                    echo "<span class='test-status $status'>$text</span>";
                    echo "</div>";
                }
                ?>
            </div>

            <!-- Test 3: Base de Données -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">🗄️</span>
                    <span>Base de Données</span>
                </div>
                
                <div class="test-item">
                    <div class="test-label">
                        <strong>Constantes Configuration</strong>
                        <div class="details">
                            DB_HOST: <?php echo defined('DB_HOST') ? DB_HOST : 'Non défini'; ?><br>
                            DB_NAME: <?php echo defined('DB_NAME') ? DB_NAME : 'Non défini'; ?><br>
                            DB_USER: <?php echo defined('DB_USER') ? DB_USER : 'Non défini'; ?>
                        </div>
                    </div>
                    <span class="test-status <?php echo defined('DB_HOST') && defined('DB_NAME') ? 'status-success' : 'status-error'; ?>">
                        <?php echo defined('DB_HOST') && defined('DB_NAME') ? '✓ OK' : '✗ NOK'; ?>
                    </span>
                </div>

                <div class="test-item">
                    <div class="test-label">
                        <strong>Connexion MySQL</strong>
                        <div class="details">Tentative de connexion avec les paramètres actuels</div>
                    </div>
                    <span class="test-status <?php
                        try {
                            if (defined('DB_HOST') && extension_loaded('pdo_mysql')) {
                                $dsn = 'mysql:host=' . DB_HOST . ';port=3306;dbname=' . DB_NAME;
                                $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
                                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                                ]);
                                echo 'status-success">✓ OK';
                            } else {
                                echo 'status-error">✗ NOK';
                            }
                        } catch (Exception $e) {
                            echo 'status-error">✗ Erreur: ' . substr($e->getMessage(), 0, 50);
                        }
                    ?>
                    </span>
                </div>
            </div>

            <!-- Test 4: Classes et Namespaces -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">📚</span>
                    <span>Classes et Namespaces</span>
                </div>
                
                <?php
                $classes = [
                    'backend\models\Database' => 'Database class',
                    'backend\utils\Response' => 'Response utility',
                    'backend\utils\Security' => 'Security utility',
                    'backend\configs\CORS' => 'CORS config',
                ];
                
                foreach ($classes as $class => $desc) {
                    $exists = class_exists($class);
                    echo "<div class='test-item'>";
                    echo "<div class='test-label'><strong>$class</strong><div class='details'>$desc</div></div>";
                    echo "<span class='test-status " . ($exists ? 'status-success' : 'status-error') . "'>";
                    echo $exists ? '✓ OK' : '✗ NOK';
                    echo "</span>";
                    echo "</div>";
                }
                ?>
            </div>

            <!-- Test 5: Permissions Fichiers -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">🔒</span>
                    <span>Permissions Fichiers</span>
                </div>
                
                <div class="test-item">
                    <div class="test-label">
                        <strong>Dossier logs</strong>
                        <div class="details">Doit être accessible en écriture</div>
                    </div>
                    <span class="test-status <?php 
                        $dir = __DIR__ . '/logs';
                        $writable = is_writable($dir) || (!is_dir($dir) && is_writable(dirname($dir)));
                        echo $writable ? 'status-success">✓ OK' : 'status-error">✗ NOK';
                    ?>
                    </span>
                </div>

                <div class="test-item">
                    <div class="test-label">
                        <strong>Fichier sessions</strong>
                        <div class="details">Sessions PHP en cours: <?php echo isset($_SESSION) ? '✓ Actives' : '✗ Inactives'; ?></div>
                    </div>
                    <span class="test-status <?php echo isset($_SESSION) ? 'status-success">✓ OK' : 'status-error">✗ NOK'; ?>
                    </span>
                </div>
            </div>

            <!-- Test 6: Endpoints -->
            <div class="test-group">
                <div class="test-group-header">
                    <span class="icon">🔗</span>
                    <span>Endpoints Disponibles</span>
                </div>
                
                <?php
                $endpoints = [
                    '/Api/Auth/login.php',
                    '/Api/Auth/register.php',
                    '/Api/Auth/check.php',
                    '/Api/Auth/logout.php',
                    '/Api/Auth/change-password.php',
                    '/Api/Auth/reset-password.php',
                ];
                
                foreach ($endpoints as $endpoint) {
                    $path = __DIR__ . $endpoint;
                    $exists = file_exists($path);
                    echo "<div class='test-item'>";
                    echo "<div class='test-label'><strong>$endpoint</strong></div>";
                    echo "<span class='test-status " . ($exists ? 'status-success' : 'status-error') . "'>";
                    echo $exists ? '✓ Présent' : '✗ Manquant';
                    echo "</span>";
                    echo "</div>";
                }
                ?>
            </div>

            <!-- Recommandations -->
            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">
                <h3 style="color: #856404; margin-bottom: 10px;">⚠️ Recommandations</h3>
                <ul style="color: #856404; margin-left: 20px; line-height: 1.8;">
                    <li>Assurez-vous que MySQL est démarré et accessible</li>
                    <li>Vérifiez les constantes DB dans bootstrap.php</li>
                    <li>Créez la base de données avec schema.sql</li>
                    <li>Testez avec le fichier test-authentification.html au front</li>
                    <li>Consultez les logs en cas d'erreur</li>
                    <li>En production, utilisez HTTPS</li>
                </ul>
            </div>

            <!-- Lien vers test frontend -->
            <div style="margin-top: 20px; text-align: center;">
                <a href="http://localhost/APP_IB/frontend/HTML/test-authentification.html" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; transition: background 0.3s;">
                    → Lancer Test Frontend →
                </a>
            </div>
        </div>
    </div>
</body>
</html>
<?php
// Flush output buffering
ob_end_flush();
?>
