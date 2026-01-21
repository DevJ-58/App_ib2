// ====================================================================
// INVENTAIRES-API.JS - Intégration API Inventaires Frontend
// ====================================================================

/**
 * Charger tous les inventaires depuis l'API
 */
async function chargerInventairesAPI() {
    console.log('📋 Chargement des inventaires depuis la base de données...');
    try {
        const response = await api.getAllInventories();
        
        if (!response.success) {
            console.error('❌ Erreur API inventaires:', response.message);
            return [];
        }
        
        console.log('✅ Inventaires chargés:', response.data.length, 'inventaires');
        return response.data || [];
    } catch (error) {
        console.error('❌ Erreur chargement inventaires:', error);
        return [];
    }
}

/**
 * Charger les détails d'un inventaire
 */
async function chargerDetailsInventaireAPI(inventaire_id) {
    console.log('📄 Chargement détails inventaire', inventaire_id);
    try {
        const response = await api.getInventoryDetails(inventaire_id);
        
        if (!response.success) {
            console.error('❌ Erreur API détails:', response.message);
            return [];
        }
        
        console.log('✅ Détails chargés:', response.data.length, 'articles');
        return response.data || [];
    } catch (error) {
        console.error('❌ Erreur chargement détails:', error);
        return [];
    }
}

/**
 * Créer un nouvel inventaire
 */
async function creerInventaireAPI() {
    console.log('🆕 Création d\'un nouvel inventaire');
    try {
        const response = await api.createInventory();
        
        if (!response.success) {
            console.error('❌ Erreur API création:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return null;
        }
        
        console.log('✅ Inventaire créé:', response.data);
        afficherNotification('Nouvel inventaire créé', 'success');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur création inventaire:', error);
        afficherNotification('Erreur lors de la création', 'error');
        return null;
    }
}

/**
 * Ajouter un produit à l'inventaire
 */
async function ajouterProduitInventaireAPI(inventaire_id, produit_id, stock_reel) {
    console.log('➕ Ajout produit inventaire:', {inventaire_id, produit_id, stock_reel});
    
    // ✅ VALIDATION: Le stock réel ne peut pas être négatif
    stock_reel = parseInt(stock_reel);
    if (stock_reel < 0) {
        console.error('❌ Stock réel négatif rejeté:', stock_reel);
        afficherNotification('❌ Le stock réel ne peut pas être négatif', 'error');
        return null;
    }
    
    try {
        const response = await api.addProductToInventory(inventaire_id, produit_id, stock_reel);
        
        if (!response.success) {
            console.error('❌ Erreur API ajout produit:', response.message);
            return null;
        }
        
        console.log('✅ Produit ajouté');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur ajout produit:', error);
        return null;
    }
}

/**
 * Terminer un inventaire
 */
async function terminerInventaireAPI(inventaire_id) {
    console.log('✔️ Fin d\'inventaire:', inventaire_id);
    try {
        const response = await api.completeInventory(inventaire_id);
        
        if (!response.success) {
            console.error('❌ Erreur API fin inventaire:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return null;
        }
        
        console.log('✅ Inventaire terminé');
        afficherNotification('Inventaire terminé avec succès', 'success');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur fin inventaire:', error);
        afficherNotification('Erreur lors de la fin de l\'inventaire', 'error');
        return null;
    }
}
