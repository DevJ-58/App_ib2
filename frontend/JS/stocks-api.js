// ====================================================================
// STOCKS-API.JS - Intégration API Stocks Frontend
// ====================================================================

/**
 * Charger tous les stocks depuis l'API et synchroniser avec produitsData
 */
async function chargerStocksAPI() {
    console.log('📦 Synchronisation des stocks avec l\'API...');
    try {
        const response = await api.getAllStocks(100, 0);
        
        if (!response.success) {
            console.error('❌ Erreur API stocks:', response.message);
            afficherNotification('Erreur: Impossible de charger les stocks', 'error');
            return false;
        }
        
        // Mettre à jour produitsData avec les stocks de l'API
        response.data.forEach(apiProduit => {
            const produit = produitsData.find(p => p.id == apiProduit.id);
            if (produit) {
                produit.stock = apiProduit.stock;
                produit.seuilAlerte = apiProduit.seuil_alerte;
                produit.prix = apiProduit.prix_vente; // Mettre à jour le prix
            }
        });
        
        console.log('✅ Stocks synchronisés pour', response.data.length, 'produits');
        return true;
    } catch (error) {
        console.error('❌ Erreur synchronisation stocks:', error);
        afficherNotification('Erreur lors de la synchronisation des stocks', 'error');
        return false;
    }
}

/**
 * Charger les alertes stocks
 */
async function chargerAlertesAPI() {
    console.log('⚠️ Chargement des alertes stocks...');
    try {
        const response = await api.getStockAlerts();
        
        if (!response.success) {
            console.error('❌ Erreur API alertes:', response.message);
            return [];
        }
        
        console.log('✅ Alertes chargées:', response.summary);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement alertes:', error);
        return [];
    }
}

/**
 * Charger les mouvements récents
 */
async function chargerMouvementsAPI(limit = 10) {
    console.log('📊 Chargement des mouvements récents...');
    try {
        const response = await api.getMovementHistory(null, limit);
        
        if (!response.success) {
            console.error('❌ Erreur API mouvements:', response.message);
            return [];
        }
        
        console.log('✅ Mouvements chargés:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement mouvements:', error);
        return [];
    }
}

/**
 * Charger l'historique pour un produit spécifique
 */
async function chargerHistoriqueProduitAPI(produit_id) {
    console.log('📜 Chargement historique produit', produit_id);
    try {
        const response = await api.getMovementHistory(produit_id, 50);
        
        if (!response.success) {
            console.error('❌ Erreur API historique:', response.message);
            afficherNotification('Erreur: Impossible de charger l\'historique', 'error');
            return [];
        }
        
        console.log('✅ Historique chargé:', response.data.length, 'mouvements');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement historique:', error);
        afficherNotification('Erreur lors du chargement de l\'historique', 'error');
        return [];
    }
}

/**
 * Enregistrer un mouvement de stock (Entrée/Sortie/Perte)
 */
async function enregistrerMouvementAPI(produit_id, type, quantite, motif = '', commentaire = '') {
    console.log('💾 Enregistrement mouvement:', {produit_id, type, quantite, motif});
    
    try {
        const response = await api.recordMovement({
            produit_id: parseInt(produit_id),
            type: type,
            quantite: parseInt(quantite),
            motif: motif,
            commentaire: commentaire,
            utilisateur_id: utilisateurConnecte?.id || 1
        });
        
        if (!response.success) {
            console.error('❌ Erreur enregistrement:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return false;
        }
        
        console.log('✅ Mouvement enregistré avec ID:', response.data.mouvement_id);
        console.log('   Nouveau stock:', response.data.nouveau_stock);
        
        // Mettre à jour le stock local
        const produit = produitsData.find(p => p.id == produit_id);
        if (produit) {
            produit.stock = response.data.nouveau_stock;
        }
        
        afficherNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} de ${quantite} unité(s) enregistrée`, 'success');
        return true;
    } catch (error) {
        console.error('❌ Erreur mouvement:', error);
        afficherNotification('Erreur lors de l\'enregistrement du mouvement', 'error');
        return false;
    }
}

/**
 * Charger les statistiques de stocks
 */
async function chargerStatsStockAPI(date_debut = null, date_fin = null) {
    console.log('📈 Chargement des stats stocks...');
    try {
        const response = await api.getStockStats(date_debut, date_fin);
        
        if (!response.success) {
            console.error('❌ Erreur API stats:', response.message);
            return null;
        }
        
        console.log('✅ Stats chargées:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
        return null;
    }
}

/**
 * Mettre à jour la section Stocks du dashboard en temps réel
 */
async function mettreAJourStocksDashboard() {
    console.log('🔄 Mise à jour du dashboard stocks...');
    
    try {
        // Charger les alertes
        const alertes = await chargerAlertesAPI();
        const stats = await chargerStatsStockAPI();
        const mouvements = await chargerMouvementsAPI(5);
        
        // Mettre à jour les cartes de statistiques
        const container = document.querySelector('[data-section="stocks"]');
        if (container) {
            // Mettre à jour les nombres d'alertes
            const nbAlertes = document.querySelector('[data-stat="total-alertes"]');
            if (nbAlertes && stats) {
                nbAlertes.textContent = stats.resume?.nombre_alertes || 0;
            }
            
            const nbRuptures = document.querySelector('[data-stat="ruptures"]');
            if (nbRuptures && stats) {
                nbRuptures.textContent = stats.resume?.ruptures || 0;
            }
        }
        
        console.log('✅ Dashboard stocks mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard:', error);
    }
}

/**
 * Initialiser la section Stocks - appeler au démarrage
 */
async function initialiserStocksAPI() {
    console.log('🚀 Initialisation stocks API...');
    
    try {
        // Charger les stocks
        await chargerStocksAPI();
        
        // Mettre à jour le dashboard
        await mettreAJourStocksDashboard();
        
        console.log('✅ Stocks initialisés');
    } catch (error) {
        console.error('❌ Erreur initialisation stocks:', error);
    }
}
