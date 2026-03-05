<?php
/**
 * Migration: Ajouter colonne whatsapp à la table credits
 */

require_once __DIR__ . '/backend/bootstrap.php';

use backend\models\Database;

try {
    $db = Database::getInstance();

    // Vérifier si la colonne whatsapp existe déjà
    $columns = $db->select("DESCRIBE credits");
    $whatsappExists = false;

    foreach ($columns as $column) {
        if ($column['Field'] === 'whatsapp') {
            $whatsappExists = true;
            break;
        }
    }

    if (!$whatsappExists) {
        // Ajouter d'abord la colonne client_telephone si elle n'existe pas
        $telephoneExists = false;
        foreach ($columns as $column) {
            if ($column['Field'] === 'client_telephone') {
                $telephoneExists = true;
                break;
            }
        }

        if (!$telephoneExists) {
            $db->execute("ALTER TABLE credits ADD COLUMN client_telephone VARCHAR(20) AFTER client_nom");
            echo "✅ Colonne 'client_telephone' ajoutée\n";
            $db->execute("ALTER TABLE credits ADD INDEX idx_client_telephone (client_telephone)");
            echo "✅ Index 'idx_client_telephone' ajouté\n";
        }

        // Ajouter la colonne whatsapp
        $db->execute("ALTER TABLE credits ADD COLUMN whatsapp VARCHAR(20) AFTER client_telephone");
        echo "✅ Colonne 'whatsapp' ajoutée\n";
        $db->execute("ALTER TABLE credits ADD INDEX idx_whatsapp (whatsapp)");
        echo "✅ Index 'idx_whatsapp' ajouté\n";
    } else {
        echo "ℹ️ La colonne 'whatsapp' existe déjà\n";
    }

    echo "✅ Migration terminée avec succès\n";

} catch (\Exception $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>