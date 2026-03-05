// ====================================================================
// CREDITS-API.JS - Intégration API Crédits Frontend
// ====================================================================

console.log('✅ credits-api.js chargé');

/**
 * Créer un crédit pour une vente
 */
async function creerCreditAPI(vente_id, client_nom, montant_total, type_client = 'AUTRE', whatsapp = null, client_telephone = null) {
    console.log('💳 Création crédit:', {vente_id, client_nom, montant_total, type_client, whatsapp});
    
    try {
        const response = await api.createCredit(vente_id, client_nom, montant_total, type_client, whatsapp, client_telephone);
        
        if (!response.success) {
            console.error('❌ Erreur API crédit:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return false;
        }
        
        console.log('✅ Crédit créé avec ID:', response.data.credit_id);
        console.log('   Référence:', response.data.reference);
        
        afficherNotification(`Crédit ${response.data.reference} créé avec succès`, 'success');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur création crédit:', error);
        afficherNotification('Erreur lors de la création du crédit', 'error');
        return false;
    }
}

/**
 * Charger les crédits depuis l'API
 */
async function chargerCreditsAPI(limit = 50, offset = 0, status = null) {
    console.log('📋 Chargement des crédits...');
    try {
        console.log('   Appelant api.getAllCredits avec limit=' + limit + ', offset=' + offset + ', status=' + status);
        const response = await api.getAllCredits(limit, offset, status);
        
        console.log('   Réponse complète:', response);
        console.log('   response.success:', response.success);
        console.log('   response.data:', response.data);
        console.log('   response.data.length:', response.data?.length);
        
        if (!response.success) {
            console.error('❌ Erreur API crédits:', response.message);
            window.creditsData = [];
            return [];
        }
        
        // Assigner à la variable globale
        window.creditsData = response.data || [];
        console.log('✅ Crédits chargés:', window.creditsData.length);
        return window.creditsData;
    } catch (error) {
        console.error('❌ Erreur chargement crédits:', error);
        window.creditsData = [];
        return [];
    }
}

/**
 * Charger les crédits impayés
 */
async function chargerCreditsImpayésAPI() {
    return chargerCreditsAPI(1000, 0, 'en_cours');
}

/**
 * Enregistrer un remboursement
 */
async function enregistrerRemboursementAPI(credit_id, montant, mode_paiement = 'ESPECES') {
    console.log('💰 Remboursement crédit:', {credit_id, montant, mode_paiement});
    
    try {
        // Vérifier que l'utilisateur est authentifié
        if (!utilisateurConnecte || !utilisateurConnecte.id) {
            afficherNotification('Erreur: Utilisateur non authentifié', 'error');
            return false;
        }
        
        const response = await api.addCreditPayment(credit_id, montant, mode_paiement, utilisateurConnecte.id);
        
        if (!response.success) {
            console.error('❌ Erreur remboursement:', response.message);
            afficherNotification('Erreur: ' + response.message, 'error');
            return false;
        }
        
        console.log('✅ Remboursement enregistré');
        console.log('   Montant payé:', response.data.montant_paye);
        console.log('   Montant restant:', response.data.montant_restant);
        console.log('   Statut:', response.data.statut);
        
        const message = response.data.statut === 'solde' 
            ? `Crédit saldé! Montant restant: 0` 
            : `Remboursement reçu. Montant restant: ${response.data.montant_restant}`;
        
        afficherNotification(message, 'success');
        
        // Mettre à jour les badges d'alertes
        if (typeof mettreAJourBadgesAlertes === 'function') {
            mettreAJourBadgesAlertes();
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Erreur remboursement:', error);
        afficherNotification('Erreur lors du remboursement', 'error');
        return false;
    }
}

/**
 * Charger les statistiques des crédits
 */
async function chargerStatsCreditsAPI() {
    console.log('📊 Chargement stats crédits...');
    try {
        const response = await api.getCreditStats();
        
        if (!response.success) {
            console.error('❌ Erreur stats crédits:', response.message);
            return null;
        }
        
        console.log('✅ Stats crédits chargées:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur stats crédits:', error);
        return null;
    }
}

/**
 * Mettre à jour le dashboard des crédits
 */
async function mettreAJourDashboardCredits() {
    console.log('🔄 Mise à jour dashboard crédits...');

    try {
        // Charger les vraies statistiques depuis l'API
        const stats = await chargerStatsCreditsAPI();

        if (!stats) {
            console.log('📊 Aucune statistique disponible');
            return;
        }

        console.log('📊 Stats crédits API:', stats);

        // Mettre à jour les widgets avec les vraies données
        const totalCredits = parseInt(stats.nombre_credits) || 0;
        const creditsImpayes = parseInt(stats.credits_impayés) || 0;
        const creditsSaldés = parseInt(stats.credits_saldés) || 0;
        const montantTotalDu = parseFloat(stats.montant_total_dû) || 0;
        const montantRestantDu = parseFloat(stats.montant_restant_dû) || 0;
        const montantTotalPaye = parseFloat(stats.montant_total_payé) || 0;

        const tauxRecouvrement = montantTotalDu > 0 ? Math.round((montantTotalPaye / montantTotalDu) * 100) : 0;

        // Mettre à jour les widgets
        document.getElementById('stat-total-montant').textContent = montantTotalDu.toLocaleString() + ' FCFA';
        document.getElementById('stat-total-nombre').textContent = totalCredits + ' crédit' + (totalCredits > 1 ? 's' : '');

        document.getElementById('stat-impayés-montant').textContent = montantRestantDu.toLocaleString() + ' FCFA';
        document.getElementById('stat-impayés-nombre').textContent = creditsImpayes + ' crédit' + (creditsImpayes > 1 ? 's' : '');

        document.getElementById('stat-remboursés-montant').textContent = montantTotalPaye.toLocaleString() + ' FCFA';
        document.getElementById('stat-remboursés-nombre').textContent = creditsSaldés + ' crédit' + (creditsSaldés > 1 ? 's' : '');

        document.getElementById('stat-taux-pourcent').textContent = tauxRecouvrement + '%';
        const tauxDescription = tauxRecouvrement >= 80 ? '✅ Excellent' : tauxRecouvrement >= 60 ? '⚠️ Correct' : '❌ À améliorer';
        document.getElementById('stat-taux-description').textContent = tauxDescription;

        console.log('✅ Dashboard crédits mis à jour avec vraies données');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard:', error);
    }
}
/**
 * Charger et afficher les remboursements récents
 */
async function afficherRemboursementsRecents() {
    try {
        // Récupérer tous les remboursements depuis l'API
        const response = await api.request('/Api/Credits/stats.php');
        
        if (!response.success) {
            console.error('Erreur API remboursements:', response);
            return;
        }
        
        // Créer une liste de remboursements en parcourant les crédits
        const remboursements = [];
        
        if (creditsData && creditsData.length > 0) {
            creditsData.forEach(credit => {
                if (credit.montant_paye > 0) {
                    const montantRembourse = parseFloat(credit.montant_paye);
                    const statut = credit.montant_restant <= 0 ? 'Total' : 'Partiel';
                    
                    remboursements.push({
                        client: credit.client_nom,
                        montant: montantRembourse,
                        statut: statut,
                        date: new Date(credit.date_remboursement_complet || credit.date_credit)
                    });
                }
            });
        }
        
        // Trier par date décroissante et prendre les 5 derniers
        remboursements.sort((a, b) => b.date - a.date);
        const remboursementsRecents = remboursements.slice(0, 5);
        
        // Afficher
        const container = document.getElementById('listeRemboursements');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (remboursementsRecents.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Aucun remboursement</p>';
            return;
        }
        
        remboursementsRecents.forEach(r => {
            const item = document.createElement('div');
            item.className = 'remboursement-item';
            item.innerHTML = `
                <div class="remboursement-info">
                    <strong>${r.client}</strong>
                    <span class="remboursement-details">Remboursement ${r.statut.toLowerCase()}: ${parseFloat(r.montant).toLocaleString()} FCFA</span>
                    <span class="remboursement-date">
                        <i class="fa-regular fa-clock"></i> ${r.date.toLocaleDateString('fr-FR')} ${r.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                </div>
                <span class="badge-remboursement badge-${r.statut.toLowerCase()}">${r.statut}</span>
            `;
            container.appendChild(item);
        });
        
        console.log('✅ Remboursements récents affichés:', remboursementsRecents.length);
    } catch (error) {
        console.error('❌ Erreur affichage remboursements:', error);
    }
}

/**
 * Charger et afficher les top clients à crédit
 */
async function afficherTopClientsCredit() {
    try {
        if (!creditsData || creditsData.length === 0) return;
        
        // Grouper les crédits par client
        const clientsMap = {};
        
        creditsData.forEach(credit => {
            if (!clientsMap[credit.client_nom]) {
                clientsMap[credit.client_nom] = {
                    nom: credit.client_nom,
                    montantTotal: 0,
                    montantImpaye: 0,
                    nbCredits: 0
                };
            }
            clientsMap[credit.client_nom].montantTotal += parseFloat(credit.montant_total) || 0;
            clientsMap[credit.client_nom].montantImpaye += parseFloat(credit.montant_restant) || 0;
            clientsMap[credit.client_nom].nbCredits += 1;
        });
        
        // Convertir en array et trier par montant impayé décroissant
        const topClients = Object.values(clientsMap)
            .sort((a, b) => b.montantImpaye - a.montantImpaye)
            .slice(0, 5);
        
        // Afficher
        const container = document.getElementById('listeTopClientsCredit');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (topClients.length === 0) {
            container.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">Aucun client</li>';
            return;
        }
        
        topClients.forEach(client => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="client-info">
                    <strong>${client.nom}</strong>
                    <span>${client.nbCredits} crédit${client.nbCredits > 1 ? 's' : ''} ${client.montantImpaye > 0 ? 'actif' + (client.nbCredits > 1 ? 's' : '') : ''}</span>
                </div>
                <span class="montant-client">${parseFloat(client.montantImpaye).toLocaleString()} FCFA</span>
            `;
            container.appendChild(li);
        });
        
        console.log('✅ Top clients affichés:', topClients.length);
    } catch (error) {
        console.error('❌ Erreur affichage top clients:', error);
    }
}

/**
 * Relancer un client par WhatsApp avec un message de rappel
 */
function relancerClientWhatsapp(creditId, clientNom, montantRestant, whatsappNumber) {
    console.log('📱 Relance WhatsApp:', {creditId, clientNom, montantRestant, whatsappNumber});
    
    if (!whatsappNumber) {
        afficherNotification('Aucun numéro WhatsApp enregistré pour ce client', 'warning');
        return;
    }
    
    // Formater le montant
    const montantFormate = parseFloat(montantRestant).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    // Créer le message de rappel
    const messageWA = `Bonjour ${clientNom},\n\nNotre système indique que vous avez un solde impayé de ${montantFormate} en crédit.\n\nMerci de vous rapprocher pour effectuer le remboursement.\n\nCordialement.`;
    
    // Encoder le message pour l'URL
    const messageEncode = encodeURIComponent(messageWA);
    
    // Construire l'URL WhatsApp
    const urlWhatsapp = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${messageEncode}`;
    
    console.log('🔗 URL WhatsApp:', urlWhatsapp);
    
    // Ouvrir dans un nouvel onglet
    window.open(urlWhatsapp, '_blank');
}

/**
 * Afficher les WhatsApp des crédits
 */
function afficherWhatsappCredits() {
    console.log('📱 Affichage des numéros WhatsApp...');
    
    if (!creditsData || creditsData.length === 0) {
        console.log('❌ Aucun crédit à traiter');
        return;
    }
    
    // Filtrer les crédits avec WhatsApp et montant restant
    const creditsAvecWhatsapp = creditsData.filter(c => c.whatsapp && c.montant_restant > 0);
    console.log(`📱 ${creditsAvecWhatsapp.length}/${creditsData.length} crédits avec WhatsApp et solde impayé`);
    
    return creditsAvecWhatsapp;
}

// ====================================================================
// EXPORT DES FONCTIONS POUR LES AUTRES MODULES
// ====================================================================

window.chargerCreditsAPI = chargerCreditsAPI;
window.relancerClientWhatsapp = relancerClientWhatsapp;
window.afficherWhatsappCredits = afficherWhatsappCredits;
//  / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
//  / /   E X P O R T   D E S   F O N C T I O N S   P O U R   L E S   A U T R E S   M O D U L E S 
//  / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
//  
//  w i n d o w . c h a r g e r C r e d i t s A P I   =   c h a r g e r C r e d i t s A P I ; 
//  
//  