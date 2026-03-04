// ====================================================================
// CREDITS-API.JS - Intégration API Crédits Frontend
// ====================================================================

console.log('✅ credits-api.js chargé');

/**
 * Créer un crédit pour une vente
 */
async function creerCreditAPI(vente_id, client_nom, montant_total, type_client = 'AUTRE') {
    console.log('💳 Création crédit:', {vente_id, client_nom, montant_total, type_client});
    
    try {
        const response = await api.createCredit(vente_id, client_nom, montant_total, type_client);
        
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
            return [];
        }
        
        console.log('✅ Crédits chargés:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement crédits:', error);
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
        if (!creditsData || creditsData.length === 0) {
            console.log('📊 Pas de crédits à afficher');
            return;
        }
        
        console.log('📊 creditsData brut:', creditsData);
        console.log('📊 Premier crédit:', creditsData[0]);
        
        // Calculer les statistiques
        const totalCredits = creditsData.length;
        const creditsSoldes = creditsData.filter(c => c.statut === 'solde').length;
        const creditsEnCours = creditsData.filter(c => c.statut === 'en_cours').length;
        
        console.log('📊 Crédits en cours:', creditsEnCours, 'Crédits soldés:', creditsSoldes);
        
        // Convertir en nombres correctement
        let montantTotal = 0;
        let montantRembourse = 0;
        let montantRestant = 0;
        
        creditsData.forEach((c, i) => {
            const mt = parseFloat(c.montant_total);
            const mp = parseFloat(c.montant_paye);
            const mr = parseFloat(c.montant_restant);
            
            console.log(`Crédit ${i}: total=${mt}, payé=${mp}, restant=${mr}`);
            
            montantTotal += mt || 0;
            montantRembourse += mp || 0;
            montantRestant += mr || 0;
        });
        
        console.log('📊 Montants calculés:', {montantTotal, montantRembourse, montantRestant});
        
        const tauxRecouvrement = montantTotal > 0 ? Math.round((montantRembourse / montantTotal) * 100) : 0;
        
        console.log('📊 Taux recouvrement:', tauxRecouvrement + '%');
        
        // Mettre à jour les widgets
        document.getElementById('stat-total-montant').textContent = montantTotal.toLocaleString() + ' FCFA';
        document.getElementById('stat-total-nombre').textContent = totalCredits + ' crédit' + (totalCredits > 1 ? 's' : '');
        
        document.getElementById('stat-impayés-montant').textContent = montantRestant.toLocaleString() + ' FCFA';
        document.getElementById('stat-impayés-nombre').textContent = creditsEnCours + ' crédit' + (creditsEnCours > 1 ? 's' : '');
        
        document.getElementById('stat-remboursés-montant').textContent = montantRembourse.toLocaleString() + ' FCFA';
        document.getElementById('stat-remboursés-nombre').textContent = creditsSoldes + ' crédit' + (creditsSoldes > 1 ? 's' : '');
        
        document.getElementById('stat-taux-pourcent').textContent = tauxRecouvrement + '%';
        const tauxDescription = tauxRecouvrement >= 80 ? '✅ Excellent' : tauxRecouvrement >= 60 ? '⚠️ Correct' : '❌ À améliorer';
        document.getElementById('stat-taux-description').textContent = tauxDescription;
        
        console.log('✅ Dashboard crédits mis à jour');
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