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
 * Charger les ventes depuis l'API ET remplir ventesData global
 */
async function chargerVentesAPI(limit = 1000, offset = 0) {
    console.log('📦 Chargement des ventes depuis la base de données...');
    try {
        const response = await api.getAllSales();
        
        if (!response.success) {
            console.error('❌ Erreur API ventes:', response.message);
            ventesData = [];
            return [];
        }
        
        // Remplir la variable globale ventesData avec TOUTES les ventes de la DB
        ventesData = response.data || [];
        console.log('✅ Ventes chargées depuis DB:', ventesData.length, 'ventes');
        return ventesData;
    } catch (error) {
        console.error('❌ Erreur chargement ventes:', error);
        ventesData = [];
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
/**
 * Charger et afficher le résumé du jour
 */
async function afficherResumeDuJour() {
    try {
        // Charger les ventes du jour
        const ventes = await chargerVentesAPI(1000, 0);
        const statsVentes = await chargerStatsVentesAPI();
        
        // Charger les crédits
        const creditsApi = await api.getAllCredits();
        const creditsData = creditsApi.data || [];
        
        // Aujourd'hui en format YYYY-MM-DD
        const aujourd_hui = new Date().toISOString().split('T')[0];
        
        // Filtrer les ventes d'aujourd'hui
        const ventesAujourdhui = ventes.filter(v => v.date_vente.startsWith(aujourd_hui));
        
        // Crédits accordés aujourd'hui
        const creditsAujourdhui = creditsData.filter(c => c.date_credit.startsWith(aujourd_hui));
        
        // Calculer les montants
        let recettesTotal = 0;
        let ventesComptant = 0;
        let creditsAccordes = 0;
        let remboursements = 0;
        
        // Ventes d'aujourd'hui
        ventesAujourdhui.forEach(v => {
            recettesTotal += parseFloat(v.montant_total) || 0;
            if (v.type_paiement === 'comptant' || v.type_paiement === 'COMPTANT') {
                ventesComptant += parseFloat(v.montant_total) || 0;
            }
        });
        
        // Crédits accordés aujourd'hui
        creditsAujourdhui.forEach(c => {
            creditsAccordes += parseFloat(c.montant_total) || 0;
        });
        
        // Remboursements (fictif: on compte les montants payés sur les crédits)
        creditsData.forEach(c => {
            if (c.date_remboursement_complet && c.date_remboursement_complet.startsWith(aujourd_hui)) {
                remboursements += parseFloat(c.montant_paye) || 0;
            }
        });
        
        console.log('📊 Résumé du jour calculé:', {recettesTotal, ventesComptant, creditsAccordes, remboursements});
        
        // Mettre à jour les affichages
        const elem1 = document.getElementById('resumeRecettesTotal');
        if (elem1) elem1.textContent = recettesTotal.toLocaleString() + ' FCFA';
        
        const elem2 = document.getElementById('resumeVentesComptant');
        if (elem2) elem2.textContent = ventesComptant.toLocaleString() + ' FCFA';
        
        const elem3 = document.getElementById('resumeCreditsAccordes');
        if (elem3) elem3.textContent = creditsAccordes.toLocaleString() + ' FCFA';
        
        const elem4 = document.getElementById('resumeRemboursements');
        if (elem4) elem4.textContent = remboursements.toLocaleString() + ' FCFA';
        
        console.log('✅ Résumé du jour affiché');
    } catch (error) {
        console.error('❌ Erreur affichage résumé:', error);
    }
}