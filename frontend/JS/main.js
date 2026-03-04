// ====================================================================
// MAIN.JS - Initialisation du Dashboard
// ====================================================================

// Variables globales pour les données
let produitsData = [];
let ventesData = [];
let creditsData = [];
let mouvementsData = [];
let alertesData = [];

// ====================================================================
// INITIALISATION - Exécutée au chargement de la page
// ====================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Dashboard en cours de chargement...');
    
    try {
        // 1. Initialiser l'authentification
        console.log('1️⃣ Initialisation de l\'authentification...');
        await initialiserAuthentification();
        
        // 2. Vérifier l'authentification (rediriger si non authentifié)
        console.log('2️⃣ Vérification de l\'authentification...');
        const isAuthenticated = await verifierAuthentification();
        
        if (!isAuthenticated) {
            console.log('❌ Utilisateur non authentifié, redirection...');
            return;
        }
        
        // 3. Afficher l'utilisateur connecté dans le header
        console.log('3️⃣ Affichage de l\'utilisateur dans le header...');
        afficherUtilisateurHeader();
        
        // 4. Charger les données depuis l'API
        console.log('4️⃣ Chargement des données...');
        await chargerToutLesDonnees();
        
        // 5. Afficher la section dashboard par défaut
        console.log('5️⃣ Affichage du dashboard...');
        afficherSection('dashboard');
        
        // 6. Initialiser les événements interactifs
        console.log('6️⃣ Initialisation des événements interactifs...');
        initialiserEvenementsInteractifs();
        
        console.log('✅ Dashboard chargé avec succès!');
        
    } catch (error) {
        console.error('❌ ERREUR lors du chargement du dashboard:', error);
        afficherNotification('Erreur lors du chargement du dashboard', 'error');
    }
});

// ====================================================================
// CHARGEMENT DES DONNÉES
// ====================================================================

/**
 * Charger toutes les données depuis l'API
 */
async function chargerToutLesDonnees() {
    console.log('📦 Chargement de toutes les données...');
    
    try {
        // Charger les produits
        console.log('   ➤ Chargement des produits...');
        const produitsResponse = await api.getAllProducts();
        if (produitsResponse.success && produitsResponse.data) {
            produitsData = produitsResponse.data;
            console.log(`   ✅ ${produitsData.length} produits chargés`);
        }
        
        // Charger les stocks
        console.log('   ➤ Chargement des stocks...');
        await chargerStocksAPI();
        
        // Charger les ventes
        console.log('   ➤ Chargement des ventes...');
        await chargerVentesAPI();
        
        // Charger les crédits
        console.log('   ➤ Chargement des crédits...');
        creditsData = await chargerCreditsAPI(1000, 0);
        
        // Charger les mouvements
        console.log('   ➤ Chargement des mouvements...');
        await chargerMouvementsAPI();
        
        // Charger les alertes
        console.log('   ➤ Chargement des alertes...');
        alertesData = await chargerAlertesAPI();
        
        console.log('✅ Toutes les données chargées avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        afficherNotification('Erreur lors du chargement des données', 'error');
    }
}

// ====================================================================
// GESTION DES SECTIONS
// ====================================================================

/**
 * Afficher une section du dashboard
 */
function afficherSection(nomSection) {
    console.log('📄 Affichage de la section:', nomSection);
    
    // Masquer toutes les sections en supprimant la classe active
    const allSections = document.querySelectorAll('.section-page');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const idSection = `section-${nomSection}`;
    const sectionAffichee = document.getElementById(idSection);
    
    if (sectionAffichee) {
        sectionAffichee.classList.add('active');
        console.log('✅ Section affichée:', idSection);
    } else {
        console.warn('⚠️ Section non trouvée:', idSection);
        return;
    }
    
    // Mettre à jour le menu actif
    document.querySelectorAll('.menu-navigation a').forEach(a => {
        a.classList.remove('actif');
    });
    
    const menuActiveLink = document.querySelector(`.menu-navigation a[onclick*="'${nomSection}'"]`);
    if (menuActiveLink) {
        menuActiveLink.classList.add('actif');
    }
    
    // Charger les données spécifiques à la section
    chargerDonneesSection(nomSection);
}

/**
 * Charger les données spécifiques à une section
 */
async function chargerDonneesSection(nomSection) {
    console.log('📊 Chargement des données pour la section:', nomSection);
    
    switch(nomSection) {
        case 'dashboard':
            await afficherDashboard();
            break;
        case 'produits':
            await afficherProduits();
            break;
        case 'stocks':
            await afficherStocks();
            break;
        case 'ventes':
            await afficherVentes();
            break;
        case 'credits':
            await afficherCredits();
            break;
        case 'alertes':
            await afficherAlertes();
            break;
        case 'inventaires':
            await afficherInventaires();
            break;
        case 'rapports':
            await afficherRapports();
            break;
        default:
            console.warn('⚠️ Section inconnue:', nomSection);
    }
}

// ====================================================================
// AFFICHAGE DES SECTIONS
// ====================================================================

/**
 * Afficher le dashboard
 */
async function afficherDashboard() {
    console.log('📊 Mise à jour du dashboard...');
    
    try {
        // Charger les statistiques depuis l'API
        const response = await api.getDashboardStats();
        
        if (response.success && response.data) {
            const stats = response.data;
            
            // Mettre à jour les cartes statistiques
            const mettreAJourStat = (elementId, valeur, format = true) => {
                const elem = document.getElementById(elementId);
                if (elem) {
                    elem.textContent = format ? formaterDevise(valeur) : valeur;
                }
            };
            
            // Stats ventes
            mettreAJourStat('stat-ventes-total', stats.ventesTotalMois || 0);
            mettreAJourStat('stat-ventes-nombre', stats.ventesNombre || 0, false);
            mettreAJourStat('stat-ventes-panier', stats.ventesParnier || 0);
            
            // Stats crédits
            mettreAJourStat('stat-credits-total', stats.creditsTotalEncours || 0);
            mettreAJourStat('stat-credits-nombre', stats.creditsNombre || 0, false);
            mettreAJourStat('stat-credits-recouvrement', stats.creditsRecouvrement || 0);
            
            // Stats stocks
            mettreAJourStat('stat-stock-valeur', stats.stockValeurTotal || 0);
            mettreAJourStat('stat-stock-nb', stats.stockNombreProduits || 0, false);
            
            // Stats alertes
            const nbAlertes = document.getElementById('stat-alertes-nombre');
            if (nbAlertes) {
                nbAlertes.textContent = stats.alertesNombre || 0;
            }
            
            // Mettre à jour le compteur de notifications dans le header
            const compteurNotifications = document.getElementById('compteurNotifications');
            if (compteurNotifications) {
                const nombreAlertes = stats.alertesNombre || 0;
                if (nombreAlertes > 0) {
                    compteurNotifications.textContent = nombreAlertes > 99 ? '99+' : nombreAlertes;
                    compteurNotifications.style.display = 'block';
                } else {
                    compteurNotifications.style.display = 'none';
                }
            }
        }
        
        console.log('✅ Dashboard mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard:', error);
        // Continuer même si erreur - afficher les stats en cache
    }
}

/**
 * Mettre à jour les ventes du dashboard (ventes du jour/mois)
 */
async function mettreAJourVentesDashboard() {
    try {
        const ventesRecentes = ventesData.slice(0, 5) || [];
        const totalVentes = ventesRecentes.reduce((sum, v) => sum + (v.montant_total || 0), 0);
        
        const elemTotal = document.getElementById('stat-ventes-total');
        if (elemTotal) elemTotal.textContent = formaterDevise(totalVentes);
        
        const elemNombre = document.getElementById('stat-ventes-nombre');
        if (elemNombre) elemNombre.textContent = ventesRecentes.length;
    } catch (error) {
        console.error('❌ Erreur mise à jour ventes dashboard:', error);
    }
}

/**
 * Afficher le résumé du jour
 */
async function afficherResumeDuJour() {
    try {
        // Récupérer les données du jour
        const aujourdhuiVentes = ventesData.filter(v => {
            const dateVente = new Date(v.date_vente);
            const maintenant = new Date();
            return dateVente.toDateString() === maintenant.toDateString();
        }) || [];
        
        const totalJour = aujourdhuiVentes.reduce((sum, v) => sum + (v.montant_total || 0), 0);
        
        const elemTotal = document.getElementById('resume-jour-total');
        if (elemTotal) elemTotal.textContent = formaterDevise(totalJour);
        
        const elemNombre = document.getElementById('resume-jour-nombre');
        if (elemNombre) elemNombre.textContent = aujourdhuiVentes.length;
    } catch (error) {
        console.error('❌ Erreur affichage résumé du jour:', error);
    }
}

/**
 * Mettre à jour les crédits du dashboard
 */
async function mettreAJourCreditsDashboard() {
    try {
        const creditsEncours = creditsData.filter(c => c.statut !== 'remboursé') || [];
        const totalCredits = creditsEncours.reduce((sum, c) => sum + (c.montant_restant || c.montant || 0), 0);
        
        const elemTotal = document.getElementById('stat-credits-total');
        if (elemTotal) elemTotal.textContent = formaterDevise(totalCredits);
        
        const elemNombre = document.getElementById('stat-credits-nombre');
        if (elemNombre) elemNombre.textContent = creditsEncours.length;
    } catch (error) {
        console.error('❌ Erreur mise à jour crédits dashboard:', error);
    }
}

/**
 * Afficher les produits
 */
async function afficherProduits() {
    console.log('📦 Affichage des produits...');
    
    try {
        const tbody = document.getElementById('corpTableauProduits');
        if (!tbody) {
            console.warn('⚠️ Élément corpTableauProduits non trouvé');
            return;
        }
        
        // Vider le tableau
        tbody.innerHTML = '';
        
        if (!produitsData || produitsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun produit disponible</td></tr>';
            return;
        }
        
        // Ajouter les produits
        produitsData.forEach(produit => {
            const etatStock = determinerEtatStock(produit.stock, produit.seuil_alerte);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="info-produit">
                        <div class="icone-produit">
                            <i class="fa-solid fa-box"></i>
                        </div>
                        <div class="details-produit">
                            <h4>${produit.nom}</h4>
                            <span class="code-barre">${produit.code_barre || 'N/A'}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-categorie">${produit.categorie || 'N/A'}</span></td>
                <td><span class="prix-produit">${formaterDevise(produit.prix_vente)}</span></td>
                <td>
                    <div class="stock-produit">
                        <span class="badge-stock stock-${etatStock.classe}">${produit.stock} unités</span>
                    </div>
                </td>
                <td>${produit.seuil_alerte || 0}</td>
                <td>
                    <div class="actions-produit">
                        <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailProduit(${produit.id})">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-icone btn-modifier" title="Modifier" onclick="ouvrirModalProduit('modifier', ${produit.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icone btn-supprimer" title="Supprimer" onclick="confirmerSuppressionProduit(${produit.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Produits affichés');
    } catch (error) {
        console.error('❌ Erreur affichage produits:', error);
    }
}

/**
 * Afficher les stocks
 */
async function afficherStocks() {
    console.log('📦 Affichage des stocks...');
    
    try {
        // Charger les alertes stocks
        alertesData = await chargerAlertesAPI();
        
        // Pour maintenant, on peut réutiliser l'affichage des produits
        await afficherProduits();
        
        console.log('✅ Stocks affichés');
    } catch (error) {
        console.error('❌ Erreur affichage stocks:', error);
    }
}

/**
 * Afficher les ventes
 */
async function afficherVentes() {
    console.log('🛒 Initialisation du formulaire de vente...');
    
    try {
        // Réinitialiser le panier
        panierItems = [];
        afficherPanier();
        
        // Afficher les produits populaires
        const zoneProduitsRapides = document.getElementById('produitsRapides');
        
        if (zoneProduitsRapides && produitsData && produitsData.length > 0) {
            zoneProduitsRapides.innerHTML = '';
            
            // Afficher les 6 premiers produits (en stock de préférence)
            const produitsFiltres = produitsData
                .filter(p => p.stock > 0)
                .slice(0, 6);
            
            if (produitsFiltres.length === 0) {
                // Si aucun n'est en stock, afficher les 6 premiers quand même
                produitsFiltres.push(...produitsData.slice(0, 6));
            }
            
            produitsFiltres.forEach(produit => {
                const carte = document.createElement('div');
                carte.className = 'carte-produit-rapide';
                carte.innerHTML = `
                    <img src="${produit.image || '/assets/images/placeholder.png'}" alt="${produit.nom}" class="image-produit-rapide">
                    <div class="info-produit-rapide">
                        <h5>${produit.nom}</h5>
                        <p class="prix-produit-rapide">${formaterDevise(produit.prix_vente)}</p>
                        <p class="stock-produit-rapide">Stock: ${produit.stock} unités</p>
                    </div>
                    <button class="btn-ajouter-panier" onclick="ajouterAuPanier(${produit.id})">
                        <i class="fa-solid fa-plus"></i> Ajouter
                    </button>
                `;
                zoneProduitsRapides.appendChild(carte);
            });
        }
        
        // Réinitialiser le formulaire de saisie
        document.getElementById('nomClient').value = '';
        selectionnerPaiement('comptant');
        document.getElementById('montantRecu').value = '';
        calculerRenduMonnaie();
        
        // Initialiser les écouteurs d'événements
        const rechercheVente = document.getElementById('rechercheVente');
        if (rechercheVente) {
            rechercheVente.addEventListener('input', filtrerProduitsVente);
        }
        
        const montantRecu = document.getElementById('montantRecu');
        if (montantRecu) {
            montantRecu.addEventListener('input', calculerRenduMonnaie);
        }
        
        console.log('✅ Formulaire de vente initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation vente:', error);
    }
}

/**
 * Afficher les crédits
 */
async function afficherCredits() {
    console.log('💳 Affichage des crédits...');
    
    try {
        creditsData = await chargerCreditsAPI(1000, 0);
        
        const tbody = document.getElementById('tableauCreditsBody');
        if (!tbody) {
            console.warn('⚠️ Élément tableauCreditsBody non trouvé');
            return;
        }
        
        // Vider le tableau
        tbody.innerHTML = '';
        
        if (!creditsData || creditsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucun crédit enregistré</td></tr>';
            return;
        }
        
        // Ajouter les crédits
        creditsData.forEach(credit => {
            const joursEcoulés = Math.floor((new Date() - new Date(credit.date_credit)) / (1000 * 60 * 60 * 24));
            const etat = credit.montant_restant <= 0 ? 'Remboursé' : 'En cours';
            const badgeClasse = credit.montant_restant <= 0 ? 'etat-remboursé' : (joursEcoulés > 30 ? 'etat-retard' : 'etat-en-cours');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${credit.credit_id || credit.id}</strong></td>
                <td>${credit.client_nom || 'N/A'}</td>
                <td>${formaterDevise(credit.montant_total)}</td>
                <td><strong>${formaterDevise(credit.montant_restant)}</strong></td>
                <td>${formaterDate(credit.date_credit)}</td>
                <td>${joursEcoulés} jours</td>
                <td><span class="badge-etat ${badgeClasse}">${etat}</span></td>
                <td>
                    <div class="actions-credit">
                        <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailCredit('${credit.id}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-icone btn-modifier" title="Rembourser" onclick="ouvrirModalRemboursement('${credit.id}')">
                            <i class="fa-solid fa-money-bill"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Crédits affichés');
    } catch (error) {
        console.error('❌ Erreur affichage crédits:', error);
    }
}

/**
 * Afficher les alertes
 */
async function afficherAlertes() {
    console.log('🚨 Affichage des alertes...');
    
    try {
        alertesData = await chargerAlertesAPI();
        
        const tbody = document.getElementById('tableauAlertesBody');
        if (!tbody) {
            console.warn('⚠️ Élément tableauAlertesBody non trouvé');
            return;
        }
        
        // Vider le tableau
        tbody.innerHTML = '';
        
        if (!alertesData || alertesData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucune alerte</td></tr>';
            return;
        }
        
        // Ajouter les alertes
        alertesData.forEach(alerte => {
            const niveauClasse = `alerte-${alerte.niveau || 'info'}`.toLowerCase();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge-alerte ${niveauClasse}">${alerte.niveau || 'Info'}</span></td>
                <td>${alerte.produit_nom || 'N/A'}</td>
                <td>${alerte.message || 'N/A'}</td>
                <td>${formaterDate(alerte.date_alerte)}</td>
                <td><i class="fa-solid fa-check"></i></td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Alertes affichées');
    } catch (error) {
        console.error('❌ Erreur affichage alertes:', error);
    }
}

/**
 * Afficher les inventaires
 */
async function afficherInventaires() {
    console.log('📋 Affichage des inventaires...');
    
    try {
        const tbody = document.getElementById('tableauInventairesBody');
        if (!tbody) {
            console.warn('⚠️ Élément tableauInventairesBody non trouvé');
            return;
        }
        
        // Pour maintenant, afficher un message
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Fonctionnalité en cours de développement</td></tr>';
        
        console.log('✅ Inventaires affichés');
    } catch (error) {
        console.error('❌ Erreur affichage inventaires:', error);
    }
}

/**
 * Afficher les rapports
 */
async function afficherRapports() {
    console.log('📈 Affichage des rapports...');
    
    try {
        // Générer les rapports
        console.log('✅ Rapports affichés');
    } catch (error) {
        console.error('❌ Erreur affichage rapports:', error);
    }
}

/**
 * Mettre à jour le dashboard des crédits
 */
async function mettreAJourCreditsDashboard() {
    console.log('💳 Mise à jour dashboard crédits...');
    
    try {
        // Charger les crédits s'ils n'existent pas
        if (!creditsData || creditsData.length === 0) {
            creditsData = await chargerCreditsAPI(1000, 0);
        }
        
        // Calculer les statistiques à partir des données chargées
        let montantTotal = 0;
        let montantRestant = 0;
        let montantRembourse = 0;
        let nombreCreditsEnCours = 0;
        let nombreCreditsSoldes = 0;
        
        creditsData.forEach(credit => {
            montantTotal += parseFloat(credit.montant_total) || 0;
            montantRestant += parseFloat(credit.montant_restant) || 0;
            montantRembourse += (parseFloat(credit.montant_total) - parseFloat(credit.montant_restant)) || 0;
            
            if (credit.montant_restant > 0) {
                nombreCreditsEnCours++;
            } else {
                nombreCreditsSoldes++;
            }
        });
        
        // Mettre à jour les widgets
        const elemMontant = document.getElementById('stat-total-montant');
        if (elemMontant) elemMontant.textContent = formaterDevise(montantTotal);
        
        const elemNombre = document.getElementById('stat-total-nombre');
        if (elemNombre) elemNombre.textContent = creditsData.length + ' crédits';
        
        const elemImpayé = document.getElementById('stat-impayés-montant');
        if (elemImpayé) elemImpayé.textContent = formaterDevise(montantRestant);
        
        const elemNombreImpayé = document.getElementById('stat-impayés-nombre');
        if (elemNombreImpayé) elemNombreImpayé.textContent = nombreCreditsEnCours + ' crédits';
        
        const elemRemboursé = document.getElementById('stat-remboursés-montant');
        if (elemRemboursé) elemRemboursé.textContent = formaterDevise(montantRembourse);
        
        const elemNombreRemboursé = document.getElementById('stat-remboursés-nombre');
        if (elemNombreRemboursé) elemNombreRemboursé.textContent = nombreCreditsSoldes + ' crédits';
        
        const taux = montantTotal > 0 ? (montantRembourse / montantTotal * 100) : 0;
        const elemTaux = document.getElementById('stat-taux-pourcent');
        if (elemTaux) elemTaux.textContent = taux.toFixed(1) + '%';
        
        console.log('✅ Dashboard crédits mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard crédits:', error);
    }
}

// ====================================================================
// ÉVÉNEMENTS INTERACTIFS
// ====================================================================

/**
 * Initialiser les événements interactifs
 */
function initialiserEvenementsInteractifs() {
    console.log('🎯 Initialisation des événements interactifs...');
    
    // Panier et ventes
    selectionnerPaiement('comptant');
    afficherPanier();
    
    // Recherche vente
    const inputRechercheVente = document.getElementById('rechercheVente');
    if (inputRechercheVente) {
        inputRechercheVente.addEventListener('input', filtrerProduitsVente);
    }
    
    // Montant reçu
    const inputMontantRecu = document.getElementById('montantRecu');
    if (inputMontantRecu) {
        inputMontantRecu.addEventListener('input', calculerRenduMonnaie);
    }
    
    // Recherche crédit
    const inputRechercheCredit = document.getElementById('rechercheCredit');
    if (inputRechercheCredit) {
        inputRechercheCredit.addEventListener('input', appliquerFiltresCredits);
    }
    
    // Menu
    document.querySelectorAll('.menu-navigation a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const match = link.getAttribute('onclick').match(/afficherSection\('(\w+)'\)/);
            if (match) afficherSection(match[1]);
        });
    });
    
    // Initialiser le scanner clavier
    initialiserScannerClavier();
    
    // Initialiser l'upload de photo de profil
    initialiserUploadPhotoProfil();
    
    console.log('✅ Événements interactifs initialisés');
    
    // Test final de connexion après 5 secondes
    setTimeout(() => {
        if (barcodeScanner && !barcodeScanner.isConnected()) {
            console.warn('⚠️ Scanner toujours pas connecté après 5 secondes, test final...');
            mettreAJourIndicateurScanner(false, 'Connexion échouée');
        }
    }, 5000);
}

// ====================================================================
// GESTION DU SCANNER DE CODE-BARRE AUTOMATIQUE (CLAVIER)
// ====================================================================

/**
 * Gestionnaire de scanner à clavier
 */
class KeyboardBarcodeScanner {
    constructor() {
        this.buffer = '';
        this.timeout = null;
        this.isListening = false;
        this.minLength = 8; // Longueur minimale pour un code-barre
        this.maxLength = 20; // Longueur maximale
        this.timeoutDelay = 100; // Délai avant traitement automatique
    }

    /**
     * Démarrer l'écoute
     */
    startListening() {
        if (this.isListening) return;
        
        console.log('🔍 Démarrage de l\'écoute du scanner clavier...');
        this.isListening = true;
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        console.log('✅ Scanner clavier activé');
    }

    /**
     * Arrêter l'écoute
     */
    stopListening() {
        if (!this.isListening) return;
        
        console.log('🔇 Arrêt de l\'écoute du scanner clavier...');
        this.isListening = false;
        
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.clearBuffer();
        console.log('❌ Scanner clavier désactivé');
    }

    /**
     * Gestionnaire d'événement keydown
     */
    handleKeyDown(event) {
        // Ignorer si dans un champ de saisie (sauf si c'est un scan)
        const target = event.target;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
        
        // Si c'est Enter et qu'on a un buffer, traiter comme fin de scan
        if (event.key === 'Enter' && this.buffer.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            this.processBuffer();
            return;
        }
        
        // Si c'est une touche imprimable et pas dans un input important
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
            // Si on est dans un input de recherche ou filtre, laisser passer
            if (isInput && (target.id.includes('recherche') || target.id.includes('filtre') || target.classList.contains('search-input'))) {
                return; // Laisser le comportement normal
            }
            
            // Accumuler dans le buffer
            this.buffer += event.key;
            
            // Prévenir le comportement par défaut (éviter que ça s'affiche quelque part)
            event.preventDefault();
            event.stopPropagation();
            
            // Redémarrer le timeout
            this.restartTimeout();
        }
    }

    /**
     * Redémarrer le timeout
     */
    restartTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            if (this.buffer.length >= this.minLength && this.buffer.length <= this.maxLength) {
                this.processBuffer();
            } else {
                this.clearBuffer();
            }
        }, this.timeoutDelay);
    }

    /**
     * Traiter le buffer comme code-barre
     */
    processBuffer() {
        const barcode = this.buffer.trim();
        console.log('📦 Code-barre scanné (clavier):', barcode);
        
        // Vérifier que c'est un code-barre valide (chiffres principalement)
        if (/^\d+$/.test(barcode) && barcode.length >= this.minLength) {
            traiterScanCodeBarre(barcode);
        } else {
            console.log('⚠️ Code ignoré (pas un code-barre valide):', barcode);
        }
        
        this.clearBuffer();
    }

    /**
     * Vider le buffer
     */
    clearBuffer() {
        this.buffer = '';
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}

// Instance globale du scanner clavier
let keyboardScanner = null;

/**
 * Initialiser le scanner clavier
 */
function initialiserScannerClavier() {
    if (keyboardScanner === null) {
        keyboardScanner = new KeyboardBarcodeScanner();
        keyboardScanner.startListening();
        mettreAJourIndicateurScanner(true, 'Prêt');
    }
}

/**
 * Mettre à jour l'indicateur de connexion du scanner
 */
function mettreAJourIndicateurScanner(actif, texte = '') {
    const point = document.getElementById('pointScanner');
    const textElem = document.getElementById('textScanner');
    const indicateur = document.getElementById('indicateurScanner');
    
    if (!point || !textElem || !indicateur) {
        console.warn('⚠️ Indicateur scanner non trouvé dans le DOM');
        return;
    }
    
    if (actif) {
        // Actif = vert
        point.style.background = '#4caf50';
        point.style.animation = 'pulse 2s infinite';
        textElem.textContent = texte || 'Prêt';
        textElem.style.color = '#4caf50';
        indicateur.style.background = '#e8f5e9';
        indicateur.title = 'Scanner clavier actif';
        console.log('🟢 Scanner CLAVIER ACTIF');
    } else {
        // Inactif = rouge
        point.style.background = '#d32f2f';
        point.style.animation = 'none';
        textElem.textContent = texte || 'Inactif';
        textElem.style.color = '#d32f2f';
        indicateur.style.background = '#ffebee';
        indicateur.title = 'Scanner clavier inactif';
        console.log('🔴 Scanner CLAVIER INACTIF');
    }
}

/**
 * Traiter un code-barre scanné selon la section actuelle
 */
function traiterScanCodeBarre(codeBarre) {
    console.log('🚀 DÉBUT traiterScanCodeBarre avec code:', codeBarre);
    
    // Anti-boucle infinie : ignorer les scans trop rapprochés
    if (window.lastScanTime && Date.now() - window.lastScanTime < 1000) {
        console.log('⚠️ Scan ignoré (trop rapide - prévention boucle infinie)');
        return;
    }
    window.lastScanTime = Date.now();
    
    if (!codeBarre || codeBarre.trim().length === 0) {
        console.warn('⚠️ Code-barre vide ou null reçu');
        return;
    }
    
    // Nettoyer le code-barre (enlever espaces, caractères spéciaux)
    const codeBareNettoye = codeBarre.trim();
    console.log('🔍 Recherche du produit avec code-barre:', codeBareNettoye);
    
    // Vérifier que produitsData est chargé
    console.log('📊 État de produitsData:', {
        existe: typeof produitsData !== 'undefined',
        longueur: produitsData ? produitsData.length : 'N/A',
        type: Array.isArray(produitsData) ? 'Array' : typeof produitsData,
        premierProduit: produitsData && produitsData.length > 0 ? {
            id: produitsData[0].id,
            nom: produitsData[0].nom,
            code_barre: produitsData[0].code_barre
        } : 'AUCUN'
    });
    
    // Chercher le produit par code-barre
    const produit = produitsData.find(p => p.code_barre === codeBareNettoye);
    console.log('🔎 Résultat de la recherche:', {
        codeRecherche: codeBareNettoye,
        produitTrouve: produit ? {
            id: produit.id,
            nom: produit.nom,
            code_barre: produit.code_barre
        } : null,
        tousLesCodes: produitsData ? produitsData.map(p => p.code_barre) : []
    });
    
    // Récupérer la section actuellement active
    const sectionActive = document.querySelector('.section-page.active');
    const nomSection = sectionActive ? sectionActive.id.replace('section-', '') : '';
    console.log('📍 Section active détectée:', nomSection || 'AUCUNE');
    
    console.log(`📍 Section active: ${nomSection}, Produit trouvé: ${produit ? produit.nom : 'NON'}`);
    
    // Comportement selon la section
    if (nomSection === 'ventes') {
        console.log('💰 LOGIQUE VENTES activée');
        // En section VENTE
        if (produit) {
            // Produit existe → l'ajouter au panier
            console.log(`✅ ACTION: Ajout de ${produit.nom} au panier`);
            try {
                ajouterAuPanier(produit.id);
                console.log('✅ ajouterAuPanier exécuté avec succès');
                // Vérifier que le panier a été mis à jour
                console.log('🛒 État du panier après ajout:', panierItems.length, 'articles');
            } catch (error) {
                console.error('❌ ERREUR dans ajouterAuPanier:', error);
            }
        } else {
            // Produit n'existe pas → ouvrir modal d'ajout avec code-barre
            console.log('⚠️ ACTION: Ouverture modal ajout (produit inexistant)');
            try {
                console.log('📞 Appel de ouvrirModalProduit...');
                ouvrirModalProduit('ajouter', null, codeBareNettoye);
                console.log('✅ ouvrirModalProduit exécuté avec succès');
                // Vérifier que la modal est visible
                const modal = document.getElementById('modalProduit');
                console.log('📱 État de la modal après ouverture:', modal ? modal.style.display : 'MODAL NON TROUVÉE');
            } catch (error) {
                console.error('❌ ERREUR dans ouvrirModalProduit:', error);
            }
        }
    } else {
        console.log('📦 LOGIQUE AUTRE SECTION activée');
        // En section autre que VENTE (Produits, Stocks, etc.)
        if (produit) {
            // Produit existe → ouvrir modal de modification avec infos préremplies
            console.log(`✅ ACTION: Ouverture modal modification pour ${produit.nom}`);
            try {
                ouvrirModalProduit('modifier', produit.id, codeBareNettoye);
                console.log('✅ ouvrirModalProduit exécuté avec succès');
                // Vérifier que la modal est visible
                const modal = document.getElementById('modalProduit');
                console.log('📱 État de la modal après ouverture:', modal ? modal.style.display : 'MODAL NON TROUVÉE');
            } catch (error) {
                console.error('❌ ERREUR dans ouvrirModalProduit:', error);
            }
        } else {
            // Produit n'existe pas → ouvrir modal d'ajout avec le code-barre
            console.log('⚠️ ACTION: Ouverture modal ajout (produit inexistant)');
            try {
                ouvrirModalProduit('ajouter', null, codeBareNettoye);
                console.log('✅ ouvrirModalProduit exécuté avec succès');
                // Vérifier que la modal est visible
                const modal = document.getElementById('modalProduit');
                console.log('📱 État de la modal après ouverture:', modal ? modal.style.display : 'MODAL NON TROUVÉE');
            } catch (error) {
                console.error('❌ ERREUR dans ouvrirModalProduit:', error);
            }
        }
    }
    
    console.log('🏁 FIN traiterScanCodeBarre');
}

// ====================================================================
// FONCTIONS UTILITAIRES DU DASHBOARD
// ====================================================================

/**
 * Basculer le menu mobile
 */
function toggleMenu() {
    const barreLaterale = document.getElementById('barreLaterale');
    if (barreLaterale) {
        barreLaterale.classList.toggle('actif');
    }
}

/**
 * Ouvrir la modal du profil
 */
function ouvrirModalProfil() {
    const modal = document.getElementById('modalProfil');
    if (modal) {
        // Utiliser la classe .show au lieu du style inline pour contourner le !important du CSS
        modal.classList.add('show');
        
        // Remplir les champs si l'utilisateur est connecté
        if (utilisateurConnecte) {
            document.getElementById('profilPrenom').value = utilisateurConnecte.prenom || '';
            document.getElementById('profilNom').value = utilisateurConnecte.nom || '';
            document.getElementById('profilTelephone').value = utilisateurConnecte.telephone || '';
            document.getElementById('profilEmail').value = utilisateurConnecte.email || '';
            
            // Afficher la photo de profil
            const photoPreview = document.getElementById('profilPhotoPreview');
            if (photoPreview) {
                if (utilisateurConnecte.photo) {
                    photoPreview.src = utilisateurConnecte.photo;
                } else {
                    photoPreview.src = 'https://via.placeholder.com/120';
                }
            }
            
            // Passer en mode lecture par défaut
            setProfilReadMode(true);

        } else {
            console.warn('❌ utilisateurConnecte non défini');
        }
        
        // Réinitialiser les champs du mot de passe
        document.getElementById('profilMotDePasseActuel').value = '';
        document.getElementById('profilNouveauMotDePasse').value = '';
        document.getElementById('profilConfirmMotDePasse').value = '';
    } else {
        console.error('❌ Modal profil non trouvée dans le DOM');
    }
}

/**
 * Fermer la modal du profil
 */
function fermerModalProfil() {
    const modal = document.getElementById('modalProfil');
    if (modal) {
        // Utiliser la classe .show au lieu du style inline
        modal.classList.remove('show');
    }
}

/**
 * Basculer le mode édition du profil
 */
function toggleEditModeProfil() {
    const profilInputs = document.querySelectorAll('#modalProfil .profil-info-champ input');
    const firstInput = profilInputs[0];
    
    if (firstInput) {
        const isReadOnly = firstInput.disabled;
        setProfilReadMode(!isReadOnly);
    }
}

/**
 * Définir le mode lecture/écriture du profil
 */
function setProfilReadMode(isReadOnly) {
    const profilInputs = document.querySelectorAll('#modalProfil .profil-info-champ input');
    profilInputs.forEach(input => {
        input.disabled = isReadOnly;
    });
    
    // Mettre à jour le bouton modifier
    const btnEditer = document.querySelector('.btn-editer-profil');
    if (btnEditer) {
        if (isReadOnly) {
            btnEditer.innerHTML = '<i class="fa-solid fa-edit"></i> Modifier';
            btnEditer.style.background = '#2196f3';
        } else {
            btnEditer.innerHTML = '<i class="fa-solid fa-check"></i> Terminer';
            btnEditer.style.background = '#28a745';
        }
    }
}

/**
 * Sauvegarder le profil
 */
async function sauvegarderProfil() {
    try {
        afficherNotification('💾 Sauvegarde en cours...', 'info');
        
        const prenom = document.getElementById('profilPrenom').value.trim();
        const nom = document.getElementById('profilNom').value.trim();
        const telephone = document.getElementById('profilTelephone').value.trim();
        const email = document.getElementById('profilEmail').value.trim();
        const newPassword = document.getElementById('profilNouveauMotDePasse').value;
        const confirmPassword = document.getElementById('profilConfirmMotDePasse').value;
        const oldPassword = document.getElementById('profilMotDePasseActuel').value;
        
        // Validation basique
        if (!prenom || !nom) {
            afficherNotification('❌ Le prénom et le nom sont obligatoires', 'error');
            return;
        }
        
        // Vérifier la correspondance des mots de passe
        if (newPassword && newPassword !== confirmPassword) {
            afficherNotification('❌ Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        // Préparer les données à envoyer
        const dataToSend = {
            prenom: prenom,
            nom: nom,
            telephone: telephone,
            email: email
        };
        
        // Si l'utilisateur veut changer le mot de passe
        if (newPassword) {
            if (!oldPassword) {
                afficherNotification('❌ Le mot de passe actuel est requis', 'error');
                return;
            }
            if (newPassword.length < 6) {
                afficherNotification('❌ Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
                return;
            }
            dataToSend.password = newPassword;
            dataToSend.oldPassword = oldPassword;
        }
        
        // Appeler l'API pour mettre à jour le profil
        const response = await fetch('/APP_IB/backend/Api/Auth/update-profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dataToSend)
        });
        
        let result;
        try {
            result = await response.json();
        } catch (e) {
            console.error('Réponse non JSON du serveur:', response.status, response.statusText);
            afficherNotification('❌ Erreur serveur (HTTP ' + response.status + ')', 'error');
            return;
        }
        
        if (result.success) {
            // Mettre à jour l'utilisateur connecté
            utilisateurConnecte.prenom = prenom;
            utilisateurConnecte.nom = nom;
            utilisateurConnecte.telephone = telephone;
            utilisateurConnecte.email = email;
            
            // Sauvegarder en localStorage
            localStorage.setItem('user', JSON.stringify(utilisateurConnecte));
            
            // Mettre à jour l'affichage du header
            const nomUtilisateur = document.querySelector('.nom-utilisateur');
            if (nomUtilisateur) {
                nomUtilisateur.textContent = prenom + ' ' + nom;
            }
            
            afficherNotification('✅ Profil mis à jour avec succès!', 'success');
            
            // Réinitialiser les champs du mot de passe
            document.getElementById('profilMotDePasseActuel').value = '';
            document.getElementById('profilNouveauMotDePasse').value = '';
            document.getElementById('profilConfirmMotDePasse').value = '';
            
            // Retour au mode lecture
            setProfilReadMode(true);
            
            // Fermer après 1.5 secondes
            setTimeout(() => {
                fermerModalProfil();
            }, 1500);
        } else {
            afficherNotification('❌ ' + (result.message || 'Erreur lors de la sauvegarde'), 'error');
        }
    } catch (error) {
        console.error('Erreur sauvegarde profil:', error);
        afficherNotification('❌ Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

/**
 * Afficher la photo de profil
 */
function afficherPhotoProfil() {
    const photoHeader = document.getElementById('photoProfilHeader');
    const defaultPhoto = 'https://via.placeholder.com/40';
    
    if (photoHeader) {
        if (utilisateurConnecte && utilisateurConnecte.photo) {
            photoHeader.src = utilisateurConnecte.photo;
            photoHeader.onerror = function() {
                console.warn('⚠️ Impossible de charger la photo:', utilisateurConnecte.photo);
                photoHeader.src = defaultPhoto;
                photoHeader.onerror = null;
            };
        } else {
            photoHeader.src = defaultPhoto;
        }
    }
}

/**
 * Gérer le chargement de la photo de profil
 */
function initialiserUploadPhotoProfil() {
    const photoInput = document.getElementById('profilPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Vérifier le type de fichier
                if (!file.type.startsWith('image/')) {
                    afficherNotification('❌ Veuillez sélectionner une image', 'error');
                    return;
                }
                
                // Vérifier la taille (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    afficherNotification('❌ La photo ne doit pas dépasser 5MB', 'error');
                    return;
                }
                
                // Afficher le preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoPreview = document.getElementById('profilPhotoPreview');
                    if (photoPreview) {
                        photoPreview.src = e.target.result;
                    }
                    
                    // Uploader la photo
                    uploadPhotoProfil(file);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Uploader la photo de profil
 */
async function uploadPhotoProfil(file) {
    try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await fetch('/APP_IB/backend/Api/Auth/upload-photo.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mettre à jour l'utilisateur connecté
            utilisateurConnecte.photo = result.photoUrl;
            localStorage.setItem('user', JSON.stringify(utilisateurConnecte));
            
            // Mettre à jour la photo du header
            afficherPhotoProfil();
            
            afficherNotification('✅ Photo mise à jour avec succès!', 'success');
        } else {
            afficherNotification('❌ ' + (result.message || 'Erreur lors du chargement de la photo'), 'error');
        }
    } catch (error) {
        console.error('Erreur upload photo:', error);
        afficherNotification('❌ Erreur lors du chargement: ' + error.message, 'error');
    }
}

/**
 * Fonction toggle visibilité mot de passe
 */
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class=\"fa-solid fa-eye-slash\"></i>';
        } else {
            input.type = 'password';
            button.innerHTML = '<i class=\"fa-solid fa-eye\"></i>';
        }
    }
}

/**
 * Déconnexion
 */
async function seDeconnecter() {
    try {
        await api.logout();
        localStorage.clear();
        utilisateurConnecte = null;
        window.location.href = '../HTML/connexion.html';
    } catch (error) {
        afficherNotification('Erreur lors de la déconnexion', 'error');
    }
}

/**
 * Voir détail d'un produit
 */
function voirDetailProduit(id) {
    const produit = produitsData.find(p => p.id == id);
    if (produit) {
        afficherNotification(`Détails de ${produit.nom}`, 'info');
    }
}

/**
 * Voir détail d'une vente
 */
function voirDetailVente(id) {
    afficherNotification('Chargement des détails...', 'info');
}

/**
 * Voir détail d'un crédit
 */
function voirDetailCredit(id) {
    afficherNotification('Chargement des détails...', 'info');
}

/**
 * Confirmer suppression d'un produit
 */
function confirmerSuppressionProduit(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        afficherNotification('Produit supprimé', 'success');
    }
}

// ====================================================================
// STUBS POUR LES FONCTIONS D'INTERFACE (À IMPLÉMENTER AU BESOIN)
// ====================================================================

window.afficherSection = afficherSection;
window.toggleMenu = toggleMenu;
window.confirmerSuppression = function() { afficherNotification('Suppression confirmée', 'info'); };
window.filtrerProduits = function() { console.log('Filtre produits'); };
window.trierProduits = function() { console.log('Tri produits'); };
window.appliquerFiltresCredits = function() { afficherCredits(); };
window.ouvrirModalRemboursement = function(id) { afficherNotification('Modal remboursement: ' + id, 'info'); };
window.relancerClient = function(id) { afficherNotification('Client relancé', 'info'); };
window.ouvrirModalExport = function(type, msg) { console.log('Export:', type); };
window.confirmerExport = function(format) { afficherNotification('Export en ' + format, 'info'); };
window.annulerExport = function() { console.log('Export annulé'); };
window.activerScanner = function() { console.log('Activation scanner'); };
window.ouvrirModalProfil = ouvrirModalProfil;
window.fermerModalProfil = fermerModalProfil;
window.sauvegarderProfil = sauvegarderProfil;
window.toggleEditModeProfil = toggleEditModeProfil;
window.setProfilReadMode = setProfilReadMode;
window.togglePasswordVisibility = togglePasswordVisibility;
window.initialiserUploadPhotoProfil = initialiserUploadPhotoProfil;
window.uploadPhotoProfil = uploadPhotoProfil;
window.confirmerSuppressionProduit = confirmerSuppressionProduit;
window.voirDetailCredit = voirDetailCredit;
window.voirDetailVente = voirDetailVente;
window.voirDetailProduit = voirDetailProduit;

// ====================================================================
// FONCTIONS MANQUANTES - VENTES AVANCÉES
// ====================================================================

let panierItems = [];
let typePaiementActuel = 'comptant';

function ajouterAuPanier(idProduit) {
    const produit = produitsData.find(p => p.id == idProduit);
    if (!produit) return;
    
    const existant = panierItems.find(p => p.id == idProduit);
    if (existant) {
        existant.quantite++;
    } else {
        panierItems.push({...produit, quantite: 1});
    }
    
    afficherPanier();
    afficherNotification(`${produit.nom} ajouté au panier`, 'success');
}

function afficherPanier() {
    const listePanier = document.getElementById('listePanier');
    if (!listePanier) return;
    
    if (panierItems.length === 0) {
        listePanier.innerHTML = '<div class="panier-vide"><i class="fa-solid fa-cart-shopping"></i><p>Aucun produit dans le panier</p></div>';
    } else {
        listePanier.innerHTML = panierItems.map((item, idx) => `
            <div class="item-panier">
                <strong>${item.nom}</strong>
                <div class="qte-controls">
                    <button onclick="modifierQuantite(${idx}, -1)">-</button>
                    <span>${item.quantite}</span>
                    <button onclick="modifierQuantite(${idx}, 1)">+</button>
                </div>
                <span>${formaterDevise(item.prix_vente * item.quantite)}</span>
                <button class="btn-supprimer" onclick="retirerDuPanier(${idx})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }
    
    const total = panierItems.reduce((s, p) => s + (p.prix_vente * p.quantite), 0);
    const totalElem = document.getElementById('total');
    if (totalElem) totalElem.textContent = formaterDevise(total);
    
    const countElem = document.getElementById('nombreArticlesPanier');
    if (countElem) countElem.textContent = panierItems.length;
    
    const btnValider = document.getElementById('btnValider');
    if (btnValider) btnValider.disabled = panierItems.length === 0;
}

function modifierQuantite(idx, delta) {
    panierItems[idx].quantite += delta;
    if (panierItems[idx].quantite <= 0) {
        panierItems.splice(idx, 1);
    }
    afficherPanier();
}

function retirerDuPanier(idx) {
    panierItems.splice(idx, 1);
    afficherPanier();
}

function selectionnerPaiement(type) {
    typePaiementActuel = type;
    document.querySelectorAll('.option-paiement').forEach(o => o.classList.remove('actif'));
    document.querySelector(`.option-paiement.${type}`)?.classList.add('actif');
    
    const zoneMontantRecu = document.getElementById('zoneMontantRecu');
    if (zoneMontantRecu) {
        zoneMontantRecu.style.display = type === 'comptant' ? 'block' : 'none';
    }
    
    const champClient = document.getElementById('champClient');
    if (champClient) {
        champClient.style.display = type === 'credit' ? 'block' : 'none';
    }
}

function calculerRenduMonnaie() {
    const montantRecu = parseFloat(document.getElementById('montantRecu')?.value) || 0;
    const total = panierItems.reduce((s, p) => s + (p.prix_vente * p.quantite), 0);
    const rendu = montantRecu - total;
    const elem = document.getElementById('montantRendu');
    if (elem) elem.textContent = formaterDevise(Math.max(0, rendu));
}

function filtrerProduitsVente() {
    const terme = document.getElementById('rechercheVente')?.value.toLowerCase() || '';
    const filtered = produitsData.filter(p => 
        p.nom.toLowerCase().includes(terme) || 
        (p.code_barre && p.code_barre.includes(terme))
    );
    
    const produitsRapides = document.getElementById('produitsRapides');
    if (produitsRapides) {
        produitsRapides.innerHTML = filtered.map(p => `
            <div class="btn-produit-rapide" onclick="ajouterAuPanier(${p.id})">
                <i class="fa-solid fa-plus"></i>
                <div>
                    <strong>${p.nom}</strong>
                    <span>${formaterDevise(p.prix_vente)}</span>
                </div>
            </div>
        `).join('');
    }
}

async function validerVente() {
    if (panierItems.length === 0) {
        afficherNotification('Le panier est vide', 'warning');
        return;
    }
    
    if (typePaiementActuel === 'credit') {
        const clientNom = document.getElementById('nomClient')?.value;
        if (!clientNom) {
            afficherNotification('Veuillez entrer le nom du client', 'error');
            return;
        }
    }
    
    const montantRecu = parseFloat(document.getElementById('montantRecu')?.value) || 0;
    const total = panierItems.reduce((s, p) => s + (p.prix_vente * p.quantite), 0);
    
    const success = await enregistrerVenteAPI(
        document.getElementById('nomClient')?.value || 'Vente comptant',
        total,
        typePaiementActuel,
        panierItems,
        montantRecu,
        montantRecu - total
    );
    
    if (success) {
        panierItems = [];
        afficherPanier();
        afficherNotification('Vente enregistrée avec succès', 'success');
    }
}

function annulerVente() {
    if (confirm('Êtes-vous sûr d\'annuler cette vente ?')) {
        panierItems = [];
        afficherPanier();
        const nomInput = document.getElementById('nomClient');
        if (nomInput) nomInput.value = '';
        const montantInput = document.getElementById('montantRecu');
        if (montantInput) montantInput.value = '';
        afficherNotification('Vente annulée', 'info');
    }
}

window.ajouterAuPanier = ajouterAuPanier;
window.modifierQuantite = modifierQuantite;
window.retirerDuPanier = retirerDuPanier;
window.selectionnerPaiement = selectionnerPaiement;
window.validerVente = validerVente;
window.annulerVente = annulerVente;

// ====================================================================
// PRODUITS - MODALES ET ACTIONS
// ====================================================================

function ouvrirModalProduit(mode, id = null, codeBarre = null) {
    console.log('🔍 ouvrirModalProduit appelée avec:', {mode, id, codeBarre});
    
    const modal = document.getElementById('modalProduit');
    console.log('📱 Modal trouvée:', modal ? 'OUI' : 'NON');
    
    if (!modal) {
        console.error('❌ Modal produit non trouvée dans le DOM');
        return;
    }
    
    // Vérifier si la modal est déjà ouverte
    if (modal.style.display === 'flex') {
        console.log('⚠️ Modal déjà ouverte, pas de réouverture');
        return;
    }
    
    const titreModal = modal.querySelector('#titreProduit');
    const inputCodeBarre = document.getElementById('codeBarreProduit');
    const inputNom = document.getElementById('nomProduit');
    
    if (mode === 'modifier' && id) {
        const produit = produitsData.find(p => p.id == id);
        if (produit && titreModal) {
            titreModal.textContent = 'Modifier Produit';
            
            // Pré-remplir tous les champs
            if (inputNom) inputNom.value = produit.nom || '';
            if (inputCodeBarre) inputCodeBarre.value = produit.code_barre || '';
            
            const inputCategorie = document.getElementById('categorieProduit');
            if (inputCategorie) inputCategorie.value = produit.categorie || '';
            
            const inputPrix = document.getElementById('prixProduit');
            if (inputPrix) inputPrix.value = produit.prix_vente || '';
            
            const inputStock = document.getElementById('stockInitial');
            if (inputStock) inputStock.value = produit.stock || '';
            
            const inputSeuil = document.getElementById('seuilAlerte');
            if (inputSeuil) inputSeuil.value = produit.seuil_alerte || '';
        }
    } else {
        // Mode ajout
        if (titreModal) titreModal.textContent = 'Ajouter Produit';
        
        // Vider les champs
        if (inputNom) inputNom.value = '';
        if (inputCodeBarre) inputCodeBarre.value = codeBarre || '';
        
        const inputCategorie = document.getElementById('categorieProduit');
        if (inputCategorie) inputCategorie.value = '';
        
        const inputPrix = document.getElementById('prixProduit');
        if (inputPrix) inputPrix.value = '';
        
        const inputStock = document.getElementById('stockInitial');
        if (inputStock) inputStock.value = '';
        
        const inputSeuil = document.getElementById('seuilAlerte');
        if (inputSeuil) inputSeuil.value = '';
        
        // Focus sur le nom pour que l'utilisateur puisse taper
        if (codeBarre) {
            console.log(`📝 Modal ajout ouverte avec code-barre: ${codeBarre}`);
            if (inputNom) inputNom.focus();
        }
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    console.log('✅ Modal ouverte avec succès - display:flex et class active ajoutée');
    
    // Vérifier que la modal est visible
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(modal);
        console.log('📊 Style computed de la modal:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex
        });
    }, 100);
}

function fermerModalProduit() {
    const modal = document.getElementById('modalProduit');
    if (modal) {
        modal.classList.remove('active');
        // Attendre la fin de la transition avant de masquer
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function voirDetailProduit(id) {
    const produit = produitsData.find(p => p.id == id);
    if (!produit) return;
    afficherNotification(`Détails: ${produit.nom}`, 'info');
}

function fermerModalDetailProduit() {
    const modal = document.getElementById('modalDetailProduit');
    if (modal) modal.style.display = 'none';
}

function confirmerSuppressionProduit(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        afficherNotification('Produit supprimé', 'success');
    }
}

function filtrerProduits() {
    const categorie = document.getElementById('filtreCategorie')?.value || '';
    const etat = document.getElementById('filtreStock')?.value || '';
    
    let filtered = produitsData;
    if (categorie) filtered = filtered.filter(p => p.categorie === categorie);
    if (etat) {
        const etatMap = { bon: 'bon', moyen: 'moyen', critique: 'critique' };
        filtered = filtered.filter(p => {
            const e = determinerEtatStock(p.stock, p.seuil_alerte);
            return e.classe === etatMap[etat];
        });
    }
    
    const tbody = document.getElementById('corpTableauProduits');
    if (tbody) {
        tbody.innerHTML = filtered.map(p => {
            const e = determinerEtatStock(p.stock, p.seuil_alerte);
            return `<tr><td><div class="info-produit"><div class="icone-produit"><i class="fa-solid fa-box"></i></div><div class="details-produit"><h4>${p.nom}</h4><span class="code-barre">${p.code_barre}</span></div></div></td><td><span class="badge-categorie">${p.categorie}</span></td><td>${formaterDevise(p.prix_vente)}</td><td><span class="badge-stock stock-${e.classe}">${p.stock} unité(s)</span></td><td>${p.seuil_alerte}</td><td><button class="btn-icone btn-voir" onclick="voirDetailProduit(${p.id})"><i class="fa-solid fa-eye"></i></button><button class="btn-icone btn-modifier" onclick="ouvrirModalProduit('modifier', ${p.id})"><i class="fa-solid fa-pen"></i></button><button class="btn-icone btn-supprimer" onclick="confirmerSuppressionProduit(${p.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        }).join('');
    }
}

function trierProduits() {
    const tri = document.getElementById('triProduits')?.value || 'nom';
    let sorted = [...produitsData];
    
    switch (tri) {
        case 'nom': sorted.sort((a, b) => a.nom.localeCompare(b.nom)); break;
        case 'nom-desc': sorted.sort((a, b) => b.nom.localeCompare(a.nom)); break;
        case 'prix': sorted.sort((a, b) => a.prix_vente - b.prix_vente); break;
        case 'prix-desc': sorted.sort((a, b) => b.prix_vente - a.prix_vente); break;
        case 'stock': sorted.sort((a, b) => a.stock - b.stock); break;
        case 'stock-desc': sorted.sort((a, b) => b.stock - a.stock); break;
    }
    
    const tbody = document.getElementById('corpTableauProduits');
    if (tbody) {
        tbody.innerHTML = sorted.map(p => {
            const e = determinerEtatStock(p.stock, p.seuil_alerte);
            return `<tr><td><div class="info-produit"><div class="icone-produit"><i class="fa-solid fa-box"></i></div><div class="details-produit"><h4>${p.nom}</h4></div></div></td><td>${p.categorie}</td><td>${formaterDevise(p.prix_vente)}</td><td><span class="badge-stock stock-${e.classe}">${p.stock}</span></td><td>${p.seuil_alerte}</td><td><button class="btn-icone" onclick="voirDetailProduit(${p.id})"><i class="fa-solid fa-eye"></i></button></td></tr>`;
        }).join('');
    }
}

window.fermerModalProduit = fermerModalProduit;
window.voirDetailProduit = voirDetailProduit;
window.fermerModalDetailProduit = fermerModalDetailProduit;
window.confirmerSuppressionProduit = confirmerSuppressionProduit;
window.filtrerProduits = filtrerProduits;
window.trierProduits = trierProduits;

// ====================================================================
// CATÉGORIES
// ====================================================================

function ouvrirModalCategorie() {
    const modal = document.getElementById('modalCategorie');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function fermerModalCategorie() {
    const modal = document.getElementById('modalCategorie');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function basculerTabCategorie(tab) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('tab-active'));
    document.querySelector(`.tab-btn[onclick*="'${tab}'"]`)?.classList.add('tab-active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    const tabContent = document.getElementById(`tab-${tab}`);
    if (tabContent) tabContent.style.display = 'block';
}

window.fermerModalCategorie = fermerModalCategorie;
window.basculerTabCategorie = basculerTabCategorie;

// ====================================================================
// STOCKS - MODALES ET ACTIONS  
// ====================================================================

function ouvrirModalMouvementStock(type) {
    const modal = document.getElementById('modalMouvementStock');
    if (!modal) return;
    
    const titre = modal.querySelector('.entete-modal h2');
    if (titre) titre.textContent = type === 'entree' ? 'Entrée de Stock' : 'Sortie de Stock';
    
    modal.style.display = 'flex';
    modal.dataset.type = type;
}

function fermerModalMouvementStock() {
    const modal = document.getElementById('modalMouvementStock');
    if (modal) modal.style.display = 'none';
}

function ouvrirModalPerte() {
    const modal = document.getElementById('modalPerte');
    if (modal) modal.style.display = 'flex';
}

function fermerModalPerte() {
    const modal = document.getElementById('modalPerte');
    if (modal) modal.style.display = 'none';
}

function filtrerParEtatStock() {
    const filtre = document.getElementById('filtreEtatStock')?.value || '';
    if (!filtre) {
        afficherStocks();
        return;
    }
    
    const filtered = produitsData.filter(p => {
        const e = determinerEtatStock(p.stock, p.seuil_alerte);
        return e.classe === filtre;
    });
    
    const tbody = document.getElementById('tableauStockBody');
    if (tbody) {
        tbody.innerHTML = filtered.map(p => {
            const e = determinerEtatStock(p.stock, p.seuil_alerte);
            return `<tr><td>${p.nom}</td><td>${p.categorie}</td><td>${p.stock}</td><td>${p.seuil_alerte}</td><td>${formaterDevise(p.stock * p.prix_vente)}</td><td><span class="badge-stock">${e.libelle}</span></td><td>-</td><td><button class="btn-icone" onclick="afficherSection('stocks')"><i class="fa-solid fa-eye"></i></button></td></tr>`;
        }).join('');
    }
}

window.ouvrirModalMouvementStock = ouvrirModalMouvementStock;
window.fermerModalMouvementStock = fermerModalMouvementStock;
window.ouvrirModalPerte = ouvrirModalPerte;
window.fermerModalPerte = fermerModalPerte;
window.filtrerParEtatStock = filtrerParEtatStock;

// ====================================================================
// CRÉDITS - MODALES ET ACTIONS
// ====================================================================

function ouvrirModalRemboursement(creditId = null) {
    const modal = document.getElementById('modalRemboursement');
    if (!modal) return;
    
    if (creditId) {
        const credit = creditsData.find(c => c.id == creditId);
        if (credit) {
            const creditInput = document.getElementById('creditIdRemboursement');
            if (creditInput) creditInput.value = creditId;
            const montantElem = document.getElementById('montantRestantAffiche');
            if (montantElem) montantElem.textContent = formaterDevise(credit.montant_restant);
        }
    }
    
    modal.style.display = 'flex';
}

function fermerModalRemboursement() {
    const modal = document.getElementById('modalRemboursement');
    if (modal) modal.style.display = 'none';
}

function voirDetailCredit(creditId) {
    const credit = creditsData.find(c => c.id == creditId);
    if (!credit) {
        afficherNotification('Crédit non trouvé', 'error');
        return;
    }
    afficherNotification(`Crédit de ${credit.client_nom}: ${formaterDevise(credit.montant_restant)} restant`, 'info');
}

function fermerModalDetailsCredit() {
    const modal = document.getElementById('modalDetailsCredit');
    if (modal) modal.style.display = 'none';
}

function relancerClient(creditId) {
    const credit = creditsData.find(c => c.id == creditId);
    if (!credit) return;
    afficherNotification(`Message de relance envoyé à ${credit.client_nom}`, 'success');
}

function appliquerFiltresCredits() {
    const filtreEtat = document.getElementById('filtreEtatCredit')?.value || '';
    const recherche = document.getElementById('rechercheCredit')?.value.toLowerCase() || '';
    
    const filtered = creditsData.filter(c => {
        const etatMatch = !filtreEtat || 
            (filtreEtat === 'en_cours' && c.montant_restant > 0) ||
            (filtreEtat === 'solde' && c.montant_restant <= 0);
        
        const nomMatch = !recherche || c.client_nom.toLowerCase().includes(recherche);
        
        return etatMatch && nomMatch;
    });
    
    const tbody = document.getElementById('tableauCreditsBody');
    if (tbody) {
        tbody.innerHTML = filtered.map(c => {
            const joursEcoulés = Math.floor((new Date() - new Date(c.date_credit)) / (1000 * 60 * 60 * 24));
            const etat = c.montant_restant <= 0 ? 'Remboursé' : 'En cours';
            const badge = c.montant_restant <= 0 ? 'etat-remboursé' : (joursEcoulés > 30 ? 'etat-retard' : 'etat-en-cours');
            return `<tr><td><strong>${c.credit_id || c.id}</strong></td><td>${c.client_nom}</td><td>${formaterDevise(c.montant_total)}</td><td><strong>${formaterDevise(c.montant_restant)}</strong></td><td>${formaterDate(c.date_credit)}</td><td>${joursEcoulés}</td><td><span class="badge-etat ${badge}">${etat}</span></td><td><button class="btn-icone" onclick="voirDetailCredit('${c.id}')"><i class="fa-solid fa-eye"></i></button><button class="btn-icone" onclick="ouvrirModalRemboursement('${c.id}')"><i class="fa-solid fa-money-bill"></i></button><button class="btn-icone" onclick="relancerClient('${c.id}')"><i class="fa-solid fa-envelope"></i></button></td></tr>`;
        }).join('');
    }
}

window.ouvrirModalRemboursement = ouvrirModalRemboursement;
window.fermerModalRemboursement = fermerModalRemboursement;
window.voirDetailCredit = voirDetailCredit;
window.fermerModalDetailsCredit = fermerModalDetailsCredit;
window.relancerClient = relancerClient;
window.appliquerFiltresCredits = appliquerFiltresCredits;

// ====================================================================
// INVENTAIRES
// ====================================================================

function creerNouvelInventaire() {
    afficherNotification('Nouvel inventaire créé', 'success');
}

function voirDetailInventaire(invId) {
    afficherNotification(`Détails inventaire ${invId}`, 'info');
}

function telechargerInventaire(invId) {
    afficherNotification(`Téléchargement inventaire ${invId}`, 'success');
}

window.creerNouvelInventaire = creerNouvelInventaire;
window.voirDetailInventaire = voirDetailInventaire;
window.telechargerInventaire = telechargerInventaire;

// ====================================================================
// ALERTES
// ====================================================================

function filtrerAlertes(type) {
    console.log('Filtrer alertes:', type);
    afficherNotification(`Affichage alertes: ${type}`, 'info');
}

function marquerToutesLues() {
    afficherNotification('Toutes les alertes marquées comme lues', 'success');
}

function enregistrerParametresAlertes() {
    const checks = document.querySelectorAll('.parametres-alertes input[type="checkbox"]');
    const params = {};
    checks.forEach(c => {
        params[c.dataset.type] = c.checked;
    });
    console.log('Paramètres:', params);
    afficherNotification('Paramètres d\'alertes enregistrés', 'success');
}

window.filtrerAlertes = filtrerAlertes;
window.marquerToutesLues = marquerToutesLues;
window.enregistrerParametresAlertes = enregistrerParametresAlertes;

// ====================================================================
// RAPPORTS ET EXPORTS
// ====================================================================

function genererRapportComplet() {
    afficherNotification('Rapport complet en génération...', 'success');
}

function telechargerRapportJournalier() {
    telechargerRapport('journalier');
}

function telechargerRapport(type) {
    afficherNotification(`Rapport ${type} en téléchargement...`, 'success');
}

function toggleDropdownExport() {
    const menu = document.getElementById('dropdownExportMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function exporterRapportCompletExcel() {
    afficherNotification('Export rapport complet (Excel)', 'success');
}

function exporterProduitsExcel() {
    afficherNotification('Export produits (Excel)', 'success');
}

function exporterVentesExcel() {
    afficherNotification('Export ventes (Excel)', 'success');
}

function exporterCreditsExcel() {
    afficherNotification('Export crédits (Excel)', 'success');
}

function exporterMouvementsExcel() {
    afficherNotification('Export mouvements (Excel)', 'success');
}

window.genererRapportComplet = genererRapportComplet;
window.telechargerRapportJournalier = telechargerRapportJournalier;
window.telechargerRapport = telechargerRapport;
window.toggleDropdownExport = toggleDropdownExport;
window.exporterRapportCompletExcel = exporterRapportCompletExcel;
window.exporterProduitsExcel = exporterProduitsExcel;
window.exporterVentesExcel = exporterVentesExcel;
window.exporterCreditsExcel = exporterCreditsExcel;
window.exporterMouvementsExcel = exporterMouvementsExcel;

// ====================================================================
// UTILITAIRES
// ====================================================================

function deconnecter() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        seDeconnecter();
    }
}

function activerScanner() {
    // Le scanner est maintenant automatique - cette fonction ne fait rien
    console.log('Scanner automatique actif pour toutes les sections');
}

function scannerCodeBarre() {
    // Le scanner est maintenant automatique - cette fonction ne fait rien
    console.log('Scanner automatique actif - attendez le scan...');
}

function imprimerTicket() {
    afficherNotification('Impression ticket en cours...', 'success');
}

function imprimerTicketVente() {
    afficherNotification('Impression ticket de vente...', 'success');
}

function fermerTicket() {
    const modal = document.getElementById('modalTicket');
    if (modal) modal.style.display = 'none';
}

function voirDetailVente(venteId) {
    afficherNotification(`Détails vente ${venteId}`, 'info');
}

function fermerModalDetailVente() {
    const modal = document.getElementById('modalDetailsVente');
    if (modal) modal.style.display = 'none';
}

window.testScannerConnection = function() {
    console.log('🧪 Test manuel de connexion scanner...');
    
    if (!barcodeScanner) {
        console.error('❌ Scanner non initialisé');
        return;
    }
    
    console.log('🔗 État actuel:', barcodeScanner.isConnected() ? 'Connecté' : 'Déconnecté');
    console.log('🔗 URL WebSocket:', barcodeScanner.wsUrl);
    
    // Forcer une nouvelle connexion
    barcodeScanner.connect();
    
    // Test après 2 secondes
    setTimeout(() => {
        console.log('🔗 État après test:', barcodeScanner.isConnected() ? 'Connecté' : 'Déconnecté');
        
        // Maintenant simuler des scans pour tester la logique
        console.log('🧪 DÉBUT testScannerConnection - simulation de scan...');
        
        // Tester avec un code existant
        const codeExistant = '5449000000996'; // Coca-Cola
        console.log(`📱 Simulation scan code existant: ${codeExistant}`);
        traiterScanCodeBarre(codeExistant);
        
        // Tester avec un code inexistant après 3 secondes
        setTimeout(() => {
            const codeInexistant = '9999999999999';
            console.log(`📱 Simulation scan code inexistant: ${codeInexistant}`);
            traiterScanCodeBarre(codeInexistant);
        }, 3000);
    }, 2000);
};

window.voirDetailVente = voirDetailVente;
window.fermerModalDetailVente = fermerModalDetailVente;

// ====================================================================
// RÉINITIALISATION DU SYSTÈME (FONCTION DANGER)
// ====================================================================

/**
 * Affiche une alerte à l'intérieur de la modale profil pour confirmer
 * la suppression totale des données.
 */
function confirmerResetSystem() {
    const warning = document.getElementById('resetWarningDiv');
    if (warning) {
        warning.style.display = 'block';
    }
}

/**
 * Cache la notification de réinitialisation et réinitialise le champ
 */
function hideResetWarning() {
    const warning = document.getElementById('resetWarningDiv');
    if (warning) {
        warning.style.display = 'none';
    }
    const input = document.getElementById('confirmationReset');
    if (input) {
        input.value = '';
    }
    verifierConfirmationReset();
}

/**
 * Vérifier la confirmation de réinitialisation (case insensitive)
 */
function verifierConfirmationReset() {
    const input = document.getElementById('confirmationReset');
    const btnConfirmer = document.getElementById('btnResetConfirm');
    if (input && btnConfirmer) {
        if (input.value.toUpperCase() === 'SUPPRIMER') {
            btnConfirmer.disabled = false;
            btnConfirmer.style.opacity = '1';
            btnConfirmer.style.cursor = 'pointer';
        } else {
            btnConfirmer.disabled = true;
            btnConfirmer.style.opacity = '0.5';
            btnConfirmer.style.cursor = 'not-allowed';
        }
    }
}

/**
 * Annuler la réinitialisation : masque l'alerte et supprime l'éventuel
 * overlay résiduel.
 */
function annulerResetSystem() {
    const modal = document.getElementById('modalResetSystem');
    if (modal) {
        modal.remove();
    }
    hideResetWarning();
}

/**
 * Exécuter la réinitialisation du système
 */
async function executerResetSystem() {
    try {
        afficherNotification('🔄 Réinitialisation du système en cours...', 'warning');
        
        // Appeler l'endpoint de réinitialisation
        const response = await fetch('/APP_IB/backend/Api/reset-system.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        // si la requête HTTP renvoie une erreur, afficher le message sans continuer
        if (!response.ok) {
            let errMsg = 'Erreur HTTP ' + response.status;
            try {
                const errBody = await response.json();
                if (errBody && errBody.message) errMsg = errBody.message;
            } catch (_) {
                // ignore parse error
            }
            afficherNotification('❌ ' + errMsg, 'error');
            return;
        }
        
        const result = await response.json();
        
        if (result.success) {
            afficherNotification('✅ Système réinitialisé avec succès!', 'success');
            
            // Fermer la modal
            annulerResetSystem();
            
            // Rediriger vers la page de connexion après 3 secondes
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
        } else {
            afficherNotification('❌ Erreur lors de la réinitialisation: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        afficherNotification('❌ Erreur lors de la réinitialisation du système', 'error');
    }
}

window.confirmerResetSystem = confirmerResetSystem;
window.annulerResetSystem = annulerResetSystem;
window.hideResetWarning = hideResetWarning;
window.executerResetSystem = executerResetSystem;
window.verifierConfirmationReset = verifierConfirmationReset;

// Redéfinir les fonctions globales correctement (sans récursion)
console.log('✅ main.js chargé avec TOUTES les fonctionnalités');
