// ====================================================================
// SALES-API.JS - Intégration API Ventes Frontend
// ====================================================================

/**
 * Enregistrer une vente complète
 */
async function enregistrerVenteAPI(client_nom, total, type_paiement, items, montant_recu = 0, montant_rendu = 0) {
    console.log('💾 Enregistrement vente:', {client_nom, total, type_paiement, items_count: items.length, montant_recu, montant_rendu});
    
    try {
        // Vérifier que les items sont valides
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ Items invalides:', items);
            afficherNotification('Erreur: Panier vide ou invalide', 'error');
            return false;
        }

        // Formater les items pour l'API
        const itemsFormates = items.map(item => ({
            produit_id: item.id,
            quantite: item.quantite,
            prix_vente: item.prix_vente
        }));

        const data = {
            client_nom: client_nom,
            total: total,
            type_paiement: type_paiement,
            items: itemsFormates,
            montant_recu: montant_recu,
            montant_rendu: montant_rendu
        };

        console.log('📤 Données envoyées à l\'API:', data);

        const response = await api.createSaleWithData(data);
        
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
 * Enregistrer une vente avec numéro WhatsApp (pour crédits)
 */
async function enregistrerVenteAPIAvecWhatsapp(client_nom, total, type_paiement, items, montant_recu = 0, montant_rendu = 0, whatsapp = null) {
    console.log('💾 Enregistrement vente avec WhatsApp:', {client_nom, total, type_paiement, items_count: items.length, whatsapp});
    console.log('� Valeurs des paramètres:');
    console.log('  client_nom:', client_nom, 'type:', typeof client_nom);
    console.log('  total:', total, 'type:', typeof total);
    console.log('  type_paiement:', type_paiement, 'type:', typeof type_paiement);
    console.log('  montant_recu:', montant_recu, 'type:', typeof montant_recu);
    console.log('  montant_rendu:', montant_rendu, 'type:', typeof montant_rendu);
    console.log('  whatsapp:', whatsapp, 'type:', typeof whatsapp);
    console.log('�📦 Items bruts du panier:', items);

    try {
        // Vérifier que les items sont valides
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ Items invalides:', items);
            afficherNotification('Erreur: Panier vide ou invalide', 'error');
            return false;
        }

        console.log('🔍 Vérification des items du panier:');
        items.forEach((item, index) => {
            console.log(`   Item ${index}:`, {
                id: item.id,
                type_id: typeof item.id,
                nom: item.nom,
                quantite: item.quantite,
                prix_vente: item.prix_vente,
                keys: Object.keys(item)
            });
        });

        const itemsFormates = items.map(item => ({
            produit_id: item.id,  // L'ID du produit depuis le panier
            quantite: item.quantite,  // La quantité depuis le panier
            prix_vente: item.prix_vente  // Le prix depuis le panier
        }));

        console.log('📦 Items formatés pour l\'API:', itemsFormates);
        console.log('🔍 Vérification items formatés:');
        itemsFormates.forEach((item, index) => {
            console.log(`   Item formaté ${index}:`, {
                produit_id: item.produit_id,
                type_produit_id: typeof item.produit_id,
                quantite: item.quantite,
                prix_vente: item.prix_vente
            });
        });

        // Vérifier que tous les items ont un ID valide
        const itemSansId = itemsFormates.find(item => !item.produit_id || item.produit_id === '');
        if (itemSansId) {
            console.error('❌ Item sans ID valide trouvé:', itemSansId);
            afficherNotification('Erreur: Produit sans ID valide dans le panier', 'error');
            return false;
        }

        // Vérifier que tous les IDs sont numériques
        const itemIdNonNumerique = itemsFormates.find(item => isNaN(item.produit_id));
        if (itemIdNonNumerique) {
            console.error('❌ Item avec ID non numérique trouvé:', itemIdNonNumerique);
            afficherNotification('Erreur: ID de produit invalide dans le panier', 'error');
            return false;
        }

        const data = {
            client_nom: client_nom,
            total: total,
            type_paiement: type_paiement,
            items: itemsFormates,
            montant_recu: montant_recu,
            montant_rendu: montant_rendu,
            whatsapp: whatsapp
        };

        console.log('📤 Données envoyées à l\'API:', data);
        console.log('📤 Type de data:', typeof data);
        console.log('📤 JSON stringifié:', JSON.stringify(data));

        const response = await api.createSaleWithData(data);
        
        if (!response.success) {
            console.error('❌ Erreur API vente:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return false;
        }
        
        console.log('✅ Vente enregistrée avec ID:', response.data.vente_id);
        console.log('   Numéro vente:', response.data.numero_vente);
        if (whatsapp) {
            console.log('   WhatsApp enregistré:', whatsapp);
        }
        
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
            window.ventesData = [];
            return [];
        }
        
        // Remplir la variable globale ventesData avec TOUTES les ventes de la DB
        window.ventesData = response.data || [];
        console.log('✅ Ventes chargées depuis DB:', window.ventesData.length, 'ventes');
        return window.ventesData;
    } catch (error) {
        console.error('❌ Erreur chargement ventes:', error);
        window.ventesData = [];
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

// ====================================================================
// EXPORT DES FONCTIONS POUR LES AUTRES MODULES
// ====================================================================

window.chargerVentesAPI = chargerVentesAPI;