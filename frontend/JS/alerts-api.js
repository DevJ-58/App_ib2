// ====================================================================
// ALERTS-API.JS - Intégration API Alertes Frontend
// ====================================================================

console.log('✅ alerts-api.js chargé');

// ====================================================================
// GESTION DES PARAMÈTRES D'ALERTES
// ====================================================================

/**
 * Paramètres d'alertes par défaut
 */
const PARAMETRES_ALERTES_DEFAULT = {
    stock: true,
    credits: true,
    inventaire: false,
    peremption: false
};

/**
 * Charger les paramètres d'alertes depuis le localStorage
 */
function chargerParametresAlertes() {
    const stored = localStorage.getItem('parametresAlertes');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn('⚠️ Erreur parsing parametres alertes:', e);
            return PARAMETRES_ALERTES_DEFAULT;
        }
    }
    return PARAMETRES_ALERTES_DEFAULT;
}

/**
 * Sauvegarder les paramètres d'alertes dans le localStorage
 */
function sauvegarderParametresAlertes(parametres) {
    try {
        localStorage.setItem('parametresAlertes', JSON.stringify(parametres));
        console.log('✅ Paramètres d\'alertes sauvegardés:', parametres);
    } catch (e) {
        console.error('❌ Erreur sauvegarde paramètres:', e);
    }
}

/**
 * Enregistrer les paramètres d'alertes depuis les checkboxes
 */
function enregistrerParametresAlertes() {
    const parametres = {};
    
    // Récupérer les valeurs des checkboxes
    document.querySelectorAll('#parametresAlertes input[type="checkbox"]').forEach(checkbox => {
        const type = checkbox.getAttribute('data-type');
        if (type) {
            parametres[type] = checkbox.checked;
        }
    });
    
    // Sauvegarder
    sauvegarderParametresAlertes(parametres);
    afficherNotification('✅ Paramètres d\'alertes enregistrés', 'success');
    console.log('📋 Paramètres sauvegardés:', parametres);
}

/**
 * Charger les paramètres d'alertes dans les checkboxes
 */
function chargerParametresCheckboxes() {
    const parametres = chargerParametresAlertes();
    
    document.querySelectorAll('#parametresAlertes input[type="checkbox"]').forEach(checkbox => {
        const type = checkbox.getAttribute('data-type');
        if (type && type in parametres) {
            checkbox.checked = parametres[type];
        }
    });
    
    console.log('✅ Paramètres chargés dans les checkboxes:', parametres);
}

/**
 * Charger toutes les alertes (stocks + crédits en retard)
 */
async function chargerToutesAlertes() {
    try {
        // Charger les paramètres d'alertes
        const parametres = chargerParametresAlertes();
        console.log('⚙️ Paramètres d\'alertes actifs:', parametres);
        
        const alertes = {
            stock: [],
            credits: [],
            toutes: []
        };
        
        // Charger les stocks critiques (si activés)
        if (parametres.stock) {
            if (produitsData && produitsData.length > 0) {
                console.log('📦 Vérification stocks critiques dans produitsData:', produitsData.length, 'produits');
                produitsData.forEach(p => {
                    // Gérer les deux formats de propriété (camelCase et snake_case)
                    const seuil = p.seuil_alerte || p.seuilAlerte || 0;
                    const stock = p.stock || 0;
                    
                    if (stock <= seuil) {
                        console.log('🚨 Stock critique détecté:', p.nom, 'stock:', stock, 'seuil:', seuil);
                        alertes.stock.push({
                            id: p.id,
                            type: 'stock',
                            titre: `Stock Critique - ${p.nom}`,
                            description: `Le stock est passé sous le seuil d'alerte (${stock}/${seuil} unités)`,
                            severite: stock === 0 ? 'critique' : 'warning',
                            produit_id: p.id,
                            produit_nom: p.nom,
                            stock_actuel: stock,
                            seuil_alerte: seuil,
                            date: new Date().toISOString()
                        });
                    }
                });
            } else {
                console.warn('⚠️ produitsData not available, fetching from API');
                const produitsResponse = await api.getAllProducts(1000);
                if (produitsResponse.success && produitsResponse.data) {
                    produitsResponse.data.forEach(p => {
                        const seuil = p.seuil_alerte || 0;
                        const stock = p.stock || 0;
                        
                        if (stock <= seuil) {
                            alertes.stock.push({
                                id: p.id,
                                type: 'stock',
                                titre: `Stock Critique - ${p.nom}`,
                                description: `Le stock est passé sous le seuil d'alerte (${stock}/${seuil} unités)`,
                                severite: stock === 0 ? 'critique' : 'warning',
                                produit_id: p.id,
                                produit_nom: p.nom,
                                stock_actuel: stock,
                                seuil_alerte: seuil,
                                date: new Date().toISOString()
                            });
                        }
                    });
                }
            }
        }
        
        // Charger les crédits en retard (si activés)
        if (parametres.credits) {
            if (creditsData && creditsData.length > 0) {
                console.log('💳 Vérification crédits en retard dans creditsData:', creditsData.length, 'crédits');
                creditsData.forEach(c => {
                    if (c.statut !== 'solde' && c.montant_restant > 0) {
                        const dateCredit = new Date(c.date_credit);
                        const joursEcoules = Math.floor((new Date() - dateCredit) / (1000 * 60 * 60 * 24));
                        
                        if (joursEcoules > 7) {
                            console.log('🚨 Crédit en retard détecté:', c.client_nom, 'jours:', joursEcoules, 'restant:', c.montant_restant);
                            alertes.credits.push({
                                id: 'credit_' + c.id,
                                type: 'credits',
                                titre: `Crédit en retard - ${c.client_nom}`,
                                description: `Crédit #${c.reference} en retard de ${joursEcoules} jours. Montant restant: ${parseFloat(c.montant_restant).toLocaleString()} FCFA`,
                                severite: joursEcoules > 30 ? 'critique' : 'warning',
                                credit_id: c.id,
                                client_nom: c.client_nom,
                                montant_restant: c.montant_restant,
                                jours_retard: joursEcoules,
                                date: c.date_credit
                            });
                        }
                    }
                });
            } else {
                console.warn('⚠️ creditsData not available yet');
            }
        }
        
        // Combiner toutes les alertes
        alertes.toutes = [...alertes.stock, ...alertes.credits];
        
        console.log('📊 Alertes chargées (après filtrage):', {
            stock: alertes.stock.length,
            credits: alertes.credits.length,
            total: alertes.toutes.length
        });
        
        return alertes;
    } catch (error) {
        console.error('❌ Erreur chargement alertes:', error);
        return { stock: [], credits: [], toutes: [] };
    }
}

/**
 * Afficher les alertes filtrées
 */
async function afficherAlertes(typeFiltre = 'toutes') {
    try {
        const alertes = await chargerToutesAlertes();
        const container = document.querySelector('.liste-alertes-detaillees');
        
        if (!container) {
            console.error('Container alertes introuvable');
            return;
        }
        
        // Filtrer les alertes
        let alertesAffichees = alertes.toutes;
        if (typeFiltre !== 'toutes') {
            alertesAffichees = alertes[typeFiltre] || [];
        }
        
        console.log(`📊 Affichage ${alertesAffichees.length} alerte(s) de type '${typeFiltre}'`);
        
        // Vider le container
        container.innerHTML = '';
        
        if (alertesAffichees.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Aucune alerte</p>';
            return;
        }
        
        // Afficher chaque alerte
        alertesAffichees.forEach((alerte, idx) => {
            const div = document.createElement('div');
            div.className = `alerte-detaillee ${alerte.severite} non-lue`;
            div.innerHTML = `
                <div class="alerte-icon">
                    <i class="fa-solid ${alerte.type === 'stock' ? 'fa-triangle-exclamation' : 'fa-clock'}"></i>
                </div>
                <div class="alerte-contenu">
                    <div class="alerte-header">
                        <h4>${alerte.titre}</h4>
                        <span class="alerte-temps">Maintenant</span>
                    </div>
                    <p>${alerte.description}</p>
                    <div class="alerte-actions">
                        ${alerte.type === 'stock' ? `
                            <button class="btn-action-alerte primaire" onclick="approvisionner(${alerte.produit_id})">
                                <i class="fa-solid fa-truck"></i> Approvisionner
                            </button>
                        ` : `
                            <button class="btn-action-alerte primaire" onclick="ouvrirModalRemboursement(${alerte.credit_id})">
                                <i class="fa-solid fa-money-bill"></i> Relancer
                            </button>
                        `}
                        <button class="btn-action-alerte secondaire" onclick="marquerLue(this)">
                            Marquer comme lu
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        
    } catch (error) {
        console.error('❌ Erreur affichage alertes:', error);
    }
}

/**
 * Mettre à jour les compteurs de filtres
 */
async function mettreAJourCompteursFiltres() {
    try {
        const alertes = await chargerToutesAlertes();
        
        const btnToutes = document.querySelector('button[onclick="filtrerAlertes(\'toutes\')"]');
        const btnStock = document.querySelector('button[onclick="filtrerAlertes(\'stock\')"]');
        const btnCredits = document.querySelector('button[onclick="filtrerAlertes(\'credits\')"]');
        
        if (btnToutes) btnToutes.innerHTML = `<i class="fa-solid fa-bell"></i> Toutes (${alertes.toutes.length})`;
        if (btnStock) btnStock.innerHTML = `<i class="fa-solid fa-cubes"></i> Stock (${alertes.stock.length})`;
        if (btnCredits) btnCredits.innerHTML = `<i class="fa-solid fa-credit-card"></i> Crédits (${alertes.credits.length})`;
        
        // Mettre à jour le compteur dans le header
        const compteur = document.getElementById('compteurNotifications');
        if (compteur) {
            if (alertes.toutes.length > 0) {
                compteur.textContent = alertes.toutes.length;
                compteur.style.display = 'flex';
            } else {
                compteur.style.display = 'none';
            }
        }
        
        console.log('✅ Compteurs filtres mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour compteurs:', error);
    }
}

/**
 * Filtrer les alertes
 */
async function filtrerAlertes(type) {
    console.log('🔍 Filtrage alertes par type:', type);
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.btn-filtre').forEach(btn => btn.classList.remove('actif'));
    if (event && event.target) {
        const btnActif = event.target.closest('.btn-filtre');
        if (btnActif) {
            btnActif.classList.add('actif');
        }
    }
    
    // Afficher les alertes filtrées
    await afficherAlertes(type);
}

/**
 * Marquer une alerte comme lue
 */
function marquerLue(btn) {
    const alerte = btn.closest('.alerte-detaillee');
    if (alerte) {
        alerte.classList.remove('non-lue');
        btn.textContent = '✓ Marquée comme lue';
        btn.disabled = true;
    }
}

/**
 * Marquer toutes les alertes comme lues
 */
function marquerToutesLues() {
    document.querySelectorAll('.alerte-detaillee').forEach(alerte => {
        alerte.classList.remove('non-lue');
    });
    afficherNotification('Toutes les alertes marquées comme lues', 'success');
}

/**
 * Approvisionner un produit (redirige vers section stocks)
 */
function approvisionner(produitId) {
    console.log('🛒 Approvisionnement produit:', produitId);
    afficherSection('stocks');
    afficherNotification('Direction stocks - Sélectionnez le produit à approvisionner', 'info');
}
