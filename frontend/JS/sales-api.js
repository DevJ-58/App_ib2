// ====================================================================
// SALES-API.JS - Intégration API Ventes Frontend
// ====================================================================

/**
 * Enregistrer une vente complète
 */
async function enregistrerVenteAPI(client_nom, total, type_paiement, items, montant_recu = 0, montant_rendu = 0) {
    console.log('💾 Enregistrement vente:', {client_nom, total, type_paiement, items_count: items.length, montant_recu, montant_rendu});
    
    try {
        const response = await api.createSale(client_nom, total, type_paiement, items, montant_recu, montant_rendu);
        
        if (!response.success) {
            console.error('❌ Erreur API vente:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return false;
        }
        
        console.log('✅ Vente enregistrée avec ID:', response.data.vente_id);
        console.log('   Numéro vente:', response.data.numero_vente);
        
        afficherNotification(`Vente ${response.data.numero_vente} enregistrée avec succès`, 'success');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur enregistrement vente:', error);
        afficherNotification('Erreur lors de l\'enregistrement de la vente', 'error');
        return false;
    }
}

/**
 * Charger les ventes depuis l'API
 */
async function chargerVentesAPI(limit = 50, offset = 0) {
    console.log('📦 Chargement des ventes...');
    try {
        const response = await api.getAllSales(limit, offset);
        
        if (!response.success) {
            console.error('❌ Erreur API ventes:', response.message);
            return [];
        }
        
        console.log('✅ Ventes chargées:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement ventes:', error);
        return [];
    }
}

/**
 * Charger les détails d'une vente
 */
async function chargerDetailsVenteAPI(vente_id) {
    console.log('📄 Chargement détails vente', vente_id);
    try {
        const response = await api.getSaleDetails(vente_id);
        
        if (!response.success) {
            console.error('❌ Erreur API détails vente:', response.message);
            afficherNotification('Erreur: Impossible de charger les détails', 'error');
            return [];
        }
        
        console.log('✅ Détails chargés:', response.data.length, 'articles');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement détails:', error);
        afficherNotification('Erreur lors du chargement des détails', 'error');
        return [];
    }
}

/**
 * Charger les statistiques des ventes
 */
async function chargerStatsVentesAPI(date_debut = null, date_fin = null) {
    console.log('📊 Chargement stats ventes...');
    try {
        const response = await api.getSalesStats(date_debut, date_fin);
        
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
 * Mettre à jour le dashboard ventes
 */
async function mettreAJourVentesDashboard() {
    console.log('🔄 Mise à jour dashboard ventes...');
    
    try {
        // Charger les ventes récentes
        const ventes = await chargerVentesAPI(5);
        
        // Charger les statistiques
        const stats = await chargerStatsVentesAPI();
        
        // Mettre à jour les widgets
        if (stats) {
            const nbVentes = document.querySelector('[data-stat="nombre-ventes"]');
            if (nbVentes) {
                nbVentes.textContent = stats.nombre_ventes || 0;
            }
            
            const montantTotal = document.querySelector('[data-stat="montant-total-ventes"]');
            if (montantTotal) {
                montantTotal.textContent = (stats.total_montant || 0).toLocaleString() + ' FCFA';
            }
        }
        
        console.log('✅ Dashboard ventes mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard:', error);
    }
}
