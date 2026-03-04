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
/**
 * Charger les mouvements depuis l'API ET remplir mouvementsData global
 */
async function chargerMouvementsAPI(limit = 1000) {
    console.log('📊 Chargement des mouvements depuis la base de données...');
    try {
        const response = await api.getMovementHistory(null, limit);
        
        if (!response.success) {
            console.error('❌ Erreur API mouvements:', response.message);
            mouvementsData = [];
            return [];
        }
        
        // Remplir la variable globale mouvementsData avec TOUS les mouvements de la DB
        mouvementsData = response.data || [];
        console.log('✅ Mouvements chargés depuis DB:', mouvementsData.length, 'mouvements');
        return mouvementsData;
    } catch (error) {
        console.error('❌ Erreur chargement mouvements:', error);
        mouvementsData = [];
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
        // Vérifier que l'utilisateur est authentifié
        if (!utilisateurConnecte || !utilisateurConnecte.id) {
            afficherNotification('Erreur: Utilisateur non authentifié', 'error');
            return false;
        }
        
        const response = await api.recordMovement({
            produit_id: parseInt(produit_id),
            type: type,
            quantite: parseInt(quantite),
            motif: motif,
            commentaire: commentaire,
            utilisateur_id: utilisateurConnecte.id
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
 * Mettre à jour les widgets de statistiques des stocks avec les vraies données
 */
function mettreAJourStatistiquesStocks() {
    console.log('📊 Mise à jour des statistiques stocks...');
    
    try {
        // 1. Valeur totale du stock
        let valeurTotalStock = 0;
        let nombreProduits = 0;
        
        produitsData.forEach(p => {
            const stock = p.stock || 0;
            const prix = parseFloat(p.prix) || 0;
            valeurTotalStock += stock * prix;
            nombreProduits++;
        });
        
        const elemValeur = document.getElementById('stat-stock-valeur');
        if (elemValeur) {
            elemValeur.textContent = valeurTotalStock.toLocaleString('fr-FR') + ' FCFA';
        }
        
        const elemNb = document.getElementById('stat-stock-nb');
        if (elemNb) {
            elemNb.textContent = nombreProduits + ' produits';
        }
        
        // 2. Entrées du mois
        const maintenant = new Date();
        const debut_mois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        
        let entreesTotal = 0;
        if (mouvementsData && mouvementsData.length > 0) {
            mouvementsData.forEach(m => {
                const dateMouvement = new Date(m.date_mouvement);
                // Vérifier que la date est dans le mois courant
                if (dateMouvement.getFullYear() === maintenant.getFullYear() && 
                    dateMouvement.getMonth() === maintenant.getMonth() &&
                    m.type === 'entree') {
                    entreesTotal += parseInt(m.quantite) || 0;
                }
            });
        }
        
        const elemEntrees = document.getElementById('stat-entrees-mois');
        if (elemEntrees) {
            elemEntrees.textContent = entreesTotal + ' unités';
        }
        
        const elemPourcentageEntrees = document.getElementById('stat-entrees-pourcentage');
        if (elemPourcentageEntrees) {
            elemPourcentageEntrees.textContent = '(mois en cours)';
        }
        
        // 3. Sorties du mois (ventes + pertes)
        let sortiesTotal = 0;
        if (mouvementsData && mouvementsData.length > 0) {
            mouvementsData.forEach(m => {
                const dateMouvement = new Date(m.date_mouvement);
                // Vérifier que la date est dans le mois courant
                if (dateMouvement.getFullYear() === maintenant.getFullYear() && 
                    dateMouvement.getMonth() === maintenant.getMonth() &&
                    (m.type === 'sortie' || m.type === 'perte')) {
                    sortiesTotal += parseInt(m.quantite) || 0;
                }
            });
        }
        
        const elemSorties = document.getElementById('stat-sorties-mois');
        if (elemSorties) {
            elemSorties.textContent = sortiesTotal + ' unités';
        }
        
        // 4. Produits critiques
        let produitsCritiques = 0;
        produitsData.forEach(p => {
            const seuil = p.seuil_alerte || p.seuilAlerte || 0;
            const stock = p.stock || 0;
            if (stock <= seuil && stock > 0) {
                produitsCritiques++;
            }
        });
        
        const elemCritiques = document.getElementById('stat-produits-critiques');
        if (elemCritiques) {
            elemCritiques.textContent = produitsCritiques;
        }
        
        const elemCritiquesLabel = document.getElementById('stat-critiques-label');
        if (elemCritiquesLabel) {
            elemCritiquesLabel.textContent = produitsCritiques === 0 ? 
                'Aucun stock critique' : 
                produitsCritiques + ' produit(s) critique(s)';
        }
        
        console.log('✅ Statistiques stocks mises à jour:', {
            valeurTotal: valeurTotalStock,
            nombreProduits: nombreProduits,
            entreesTotal: entreesTotal,
            sortiesTotal: sortiesTotal,
            produitsCritiques: produitsCritiques
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour statistiques stocks:', error);
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
