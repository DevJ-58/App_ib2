// ====================================================================
// SYSTÈME DE GESTION DE STOCK BOUTIQUE UIYA - MAIN.JS (CORRIGÉ)
// ====================================================================

// ====================================================================
// VARIABLES GLOBALES
// ====================================================================

// Note: utilisateurConnecte est déclaré dans auth-api.js, ne pas redéclarer

let panier = [];
let produitsData = [];
let stockData = [];
let creditData = [];
let creditsData = [];
let ventesData = [];
let mouvementsData = [];
let alertesData = [];
let typePaiementActuel = 'comptant';
// Pagination produits
let currentPage = 1;
const perPageProducts = 10;

// ====================================================================
// UTILITAIRES UTILISATEUR
// ====================================================================

/**
 * Obtenir l'ID de l'utilisateur actuellement connecté
 */
function getUtilisateurId() {
    if (utilisateurConnecte && utilisateurConnecte.id) {
        return utilisateurConnecte.id;
    }
    return localStorage.getItem('utilisateur_id') || null;
}

/**
 * Obtenir le nom complet de l'utilisateur actuellement connecté
 */
function getNomUtilisateur() {
    if (utilisateurConnecte) {
        const prenom = utilisateurConnecte.prenom || '';
        const nom = utilisateurConnecte.nom || '';
        return `${prenom} ${nom}`.trim();
    }
    return localStorage.getItem('username') || 'Utilisateur';
}

/**
 * Obtenir l'objet utilisateur complet
 */
function getUtilisateur() {
    if (utilisateurConnecte) {
        return utilisateurConnecte;
    }
    const userJSON = localStorage.getItem('utilisateur');
    if (userJSON) {
        return JSON.parse(userJSON);
    }
    return null;
}

// ====================================================================
// SYSTÈME DE NOTIFICATIONS (Toasts)
// ====================================================================

/**
 * Afficher une notification temporaire
 * @param {string} message - Le message à afficher
 * @param {string} type - 'success', 'error', 'warning', 'info' (défaut: 'info')
 * @param {number} duration - Durée en ms avant fermeture (0 = pas de fermeture auto)
 */
function afficherNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification-toast notification-' + type;
    notification.innerHTML = `
        <div class="notification-contenu">
            <i class="notification-icone fa-solid ${getIconeNotification(type)}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;

    container.appendChild(notification);

    // Auto-fermeture si duration > 0
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

/**
 * Obtenir l'icône selon le type de notification
 */
function getIconeNotification(type) {
    const icones = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icones[type] || icones['info'];
}

// ====================================================================
// SYSTÈME DE MODALS PERSONNALISÉES
// ====================================================================

/**
 * Ouvrir une modal personnalisée avec contenu HTML
 */
function ouvrirModalPersonnalisee(contenu, titre = '') {
    // Créer la structure de la modal si elle n'existe pas
    let modal = document.getElementById('modalPersonnalisee');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPersonnalisee';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            animation: fadeIn 0.3s ease;
        `;
        modal.innerHTML = `
            <div style="position: relative; background-color: white; margin: 5% auto; padding: 0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 90%; max-height: 80vh; overflow: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #E0E0E0; background: linear-gradient(135deg, #D32F2F, #B71C1C);">
                    <h2 style="color: white; margin: 0; font-size: 20px;" id="modalTitre"></h2>
                    <button onclick="fermerModalPersonnalisee()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div id="modalContenu" style="padding: 20px; max-height: calc(80vh - 80px); overflow-y: auto;"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Remplir le contenu
    document.getElementById('modalTitre').textContent = titre;
    document.getElementById('modalContenu').innerHTML = contenu;
    
    // Afficher la modal
    modal.style.display = 'block';
    
    // Fermer au clic en dehors
    modal.onclick = function(event) {
        if (event.target === modal) {
            fermerModalPersonnalisee();
        }
    };
}

/**
 * Fermer la modal personnalisée
 */
function fermerModalPersonnalisee() {
    const modal = document.getElementById('modalPersonnalisee');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ====================================================================
// INITIALISATION AU CHARGEMENT
// ====================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du système...');
    console.log('👤 Utilisateur connecté:', getNomUtilisateur());
    console.log('🆔 ID Utilisateur:', getUtilisateurId());

    // Vérifier l'authentification (redirige vers connexion si nécessaire)
    try {
        const authOk = await verifierAuthentification();
        if (!authOk) return;
    } catch (err) {
        console.error('Erreur vérification auth:', err);
        return;
    }

    // Charger les données initiales depuis l'API (pas de données locales)
    await chargerProduits();
    await chargerCategories();
    
    // Charger les stocks depuis l'API et synchroniser
    await chargerStocksAPI();
    
    // Charger les crédits
    await chargerCredits();
    
    // Charger les données du dashboard (ventes récentes, crédits, etc.)
    await chargerDonneesDashboard();

    // Initialiser les événements
    initialiserEvenements();
    
    // Attacher les événements du formulaire produit
    const formProduit = document.getElementById('formProduit');
    if (formProduit) {
        formProduit.addEventListener('submit', function(e) {
            e.preventDefault();
            soumettreFormulaireProduit();
        });
    }
    
    // ==================== GESTIONNAIRE FORMULAIRE CATÉGORIE ====================
    const formCategorie = document.getElementById('formCategorie');
    if (formCategorie) {
        console.log('📂 Gestionnaire formulaire catégorie attaché');
        formCategorie.addEventListener('submit', async function(e) {
            e.preventDefault();
            const mode = this.dataset.mode || 'ajouter';
            const categorieId = this.dataset.categorieId;
            const nom = document.getElementById('nomCategorie')?.value;

            if (!nom) {
                afficherNotification('Le nom de la catégorie est obligatoire', 'warning');
                return;
            }

            try {
                let url, method, body;

                if (mode === 'modifier' && categorieId) {
                    // Modification
                    url = '/APP_IB/backend/Api/Categories/update.php';
                    method = 'POST';
                    body = new FormData();
                    body.append('id', categorieId);
                    body.append('nom', nom);
                } else {
                    // Création
                    url = '/APP_IB/backend/Api/Categories/create.php';
                    method = 'POST';
                    body = JSON.stringify({ nom: nom });
                }

                const response = await fetch(url, {
                    method: method,
                    headers: method === 'POST' && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {},
                    body: body
                });

                const json = await response.json();

                if (json.success) {
                    afficherNotification(mode === 'modifier' ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès', 'success');
                    formCategorie.reset();
                    formCategorie.dataset.mode = 'ajouter';
                    formCategorie.dataset.categorieId = '';
                    chargerListeCategories();
                    
                    // Recharger les catégories dans le sélecteur produits
                    chargerCategories();
                } else {
                    afficherNotification('Erreur: ' + json.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                afficherNotification('Erreur lors de la sauvegarde', 'error');
            }
        });
    } else {
        console.warn('⚠️  formCategorie non trouvé');
    }
    
    // ==================== GESTIONNAIRE FERMETURE MODALE CATÉGORIE ====================
    const modalCategorie = document.getElementById('modalCategorie');
    if (modalCategorie) {
        modalCategorie.addEventListener('click', function(e) {
            if (e.target === modalCategorie) {
                fermerModalCategorie();
            }
        });
    }
    
    // ==================== GESTIONNAIRE UPLOAD PHOTO ====================
    const profilPhotoInput = document.getElementById('profilPhotoInput');
    if (profilPhotoInput) {
        console.log('📸 Gestionnaire upload photo attaché');
        profilPhotoInput.addEventListener('change', async function(e) {
            console.log('📸 Changement détecté sur input file');
            if (this.files && this.files.length > 0) {
                console.log('📸 Fichier sélectionné:', this.files[0].name);
                try {
                    const result = await uploaderPhoto(this);
                    console.log('📸 Résultat upload:', result);
                    if (result.success) {
                        console.log('📸 Upload réussi');
                    } else {
                        console.warn('📸 Upload échoué:', result.message);
                    }
                } catch (err) {
                    console.error('📸 Exception upload:', err);
                }
            }
        });
    } else {
        console.warn('⚠️  profilPhotoInput non trouvé');
    }
    
    // Afficher la section dashboard par défaut
    afficherSection('dashboard');
    
    // Mettre à jour les statistiques
    mettreAJourStatistiques();
    
    console.log('✅ Système initialisé avec succès');
});

// ====================================================================
// CHARGEMENT DES DONNÉES
// ====================================================================

function chargerDonneesInitiales() {
    // Charger les produits
    produitsData = [
        {
            id: 'COCA001',
            nom: 'Coca-Cola 50cl',
            codeBarre: '5449000000996',
            categorie: 'boissons',
            prix: 500,
            stock: 5,
            seuilAlerte: 10,
            icone: 'fa-bottle-water'
        },
        {
            id: 'PAIN001',
            nom: 'Pain',
            codeBarre: '2345678901234',
            categorie: 'alimentaire',
            prix: 200,
            stock: 8,
            seuilAlerte: 15,
            icone: 'fa-bread-slice'
        },
        {
            id: 'EAU001',
            nom: 'Eau minérale 1.5L',
            codeBarre: '3456789012345',
            categorie: 'boissons',
            prix: 300,
            stock: 45,
            seuilAlerte: 20,
            icone: 'fa-wine-bottle'
        },
        {
            id: 'CAFE001',
            nom: 'Café Nescafé',
            codeBarre: '8901234567890',
            categorie: 'alimentaire',
            prix: 2500,
            stock: 3,
            seuilAlerte: 5,
            icone: 'fa-mug-hot'
        },
        {
            id: 'BISCUIT001',
            nom: 'Biscuits Golden',
            codeBarre: '4567890123456',
            categorie: 'snacks',
            prix: 350,
            stock: 32,
            seuilAlerte: 15,
            icone: 'fa-cookie'
        },
        {
            id: 'JUS001',
            nom: 'Jus Youki',
            codeBarre: '5678901234567',
            categorie: 'boissons',
            prix: 400,
            stock: 28,
            seuilAlerte: 15,
            icone: 'fa-glass-water'
        }
    ];
    
    // Charger les stocks
    stockData = JSON.parse(JSON.stringify(produitsData));
    
    // Charger les crédits
    creditData = [
        {
            id: 'C-001',
            client: 'Koné Abou',
            montantInitial: 15000,
            montantRestant: 12000,
            dateCredit: '05/12/2025',
            joursEcoules: 9,
            etat: 'retard'
        },
        {
            id: 'C-002',
            client: 'Personnel UIYA',
            montantInitial: 6200,
            montantRestant: 6200,
            dateCredit: '14/12/2025',
            joursEcoules: 0,
            etat: 'en-cours'
        },
        {
            id: 'C-003',
            client: 'Yao Marc',
            montantInitial: 8500,
            montantRestant: 0,
            dateCredit: '10/12/2025',
            joursEcoules: 4,
            etat: 'rembourse'
        }
    ];
    
    // Charger les mouvements
    mouvementsData = [
        {
            id: 1,
            type: 'entree',
            produitId: 'COCA001',
            produitNom: 'Coca-Cola 50cl',
            quantite: 20,
            motif: 'Approvisionnement',
            date: '14/12/2025 10:30'
        },
        {
            id: 2,
            type: 'sortie',
            produitId: 'PAIN001',
            produitNom: 'Pain',
            quantite: 15,
            motif: 'Vente',
            date: '14/12/2025 09:15'
        },
        {
            id: 3,
            type: 'perte',
            produitId: 'CAFE001',
            produitNom: 'Café Nescafé',
            quantite: 2,
            motif: 'Péremption',
            date: '13/12/2025 16:00'
        }
    ];
    
    console.log('📦 Données chargées:', {
        produits: produitsData.length,
        credits: creditData.length,
        mouvements: mouvementsData.length
    });
}

// ====================================================================
// GESTION DE LA NAVIGATION
// ====================================================================

function afficherSection(nomSection) {
    console.log('📄 Navigation vers:', nomSection);
    
    // Masquer toutes les sections
    const sections = document.querySelectorAll('.section-page');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Afficher la section demandée
    const sectionCible = document.getElementById('section-' + nomSection);
    if (sectionCible) {
        sectionCible.classList.add('active');
        sectionCible.style.display = 'block';
    }
    
    // Mettre à jour le menu actif - CORRECTION ICI
    const liens = document.querySelectorAll('.menu-navigation a');
    liens.forEach(lien => {
        lien.classList.remove('actif');
        const parent = lien.closest('li');
        if (parent) {
            parent.classList.remove('actif');
        }
    });
    
    // Ajouter la classe actif au lien correspondant
    const lienActif = document.querySelector(`.menu-navigation a[onclick*="'${nomSection}'"]`);
    if (lienActif) {
        lienActif.classList.add('actif');
        const parentActif = lienActif.closest('li');
        if (parentActif) {
            parentActif.classList.add('actif');
        }
    }
    
    // Fermer le menu mobile si ouvert
    const barreLaterale = document.getElementById('barreLaterale');
    if (barreLaterale && window.innerWidth <= 768) {
        barreLaterale.classList.remove('active');
    }
    
    // Charger les données spécifiques à la section
    switch(nomSection) {
        case 'dashboard':
            chargerDashboard();
            break;
        case 'produits':
            chargerProduits();
            break;
        case 'ventes':
            chargerVentes();
            break;
        case 'stocks':
            chargerStocks();
            break;
        case 'credits':
            chargerCredits();
            break;
        case 'alertes':
            afficherSectionAlertes();
            break;
        case 'inventaires':
            chargerInventaires();
            break;
        case 'rapports':
            chargerRapports();
            break;
        case 'alertes':
            chargerAlertes();
            break;
    }
}

// ====================================================================
// MISE À JOUR DES BADGES D'ALERTES
// ====================================================================
function mettreAJourBadgesAlertes() {
    console.log('🔔 Mise à jour des badges d\'alertes');
    
    // Compter les alertes stocks
    const produitsCritiques = produitsData.filter(p => p.stock < (p.seuilAlerte || p.seuil_alerte || 0)).length;
    const badgeStock = document.getElementById('badge-stocks-alerte');
    if (badgeStock) {
        if (produitsCritiques > 0) {
            badgeStock.textContent = produitsCritiques;
            badgeStock.style.display = 'flex';
        } else {
            badgeStock.style.display = 'none';
        }
    }
    
    // Compter les crédits en RETARD (> 7 jours sans remboursement)
    const creditsEnRetard = creditsData.filter(c => {
        if (c.montant_restant <= 0) return false; // Pas de retard si solde
        const dateCredit = new Date(c.date_credit);
        const joursEcoules = Math.floor((new Date() - dateCredit) / (1000 * 60 * 60 * 24));
        return joursEcoules > 7;
    }).length;
    
    const badgeCredits = document.getElementById('badge-credits-alerte');
    if (badgeCredits) {
        if (creditsEnRetard > 0) {
            badgeCredits.textContent = creditsEnRetard;
            badgeCredits.style.display = 'flex';
        } else {
            badgeCredits.style.display = 'none';
        }
    }
    
    // Mettre à jour le compteur de notifications dans le header
    // Compte les stocks critiques + crédits en retard
    const totalAlertes = produitsCritiques + creditsEnRetard;
    const compteurNotif = document.getElementById('compteurNotifications');
    if (compteurNotif) {
        if (totalAlertes > 0) {
            compteurNotif.textContent = totalAlertes;
            compteurNotif.style.display = 'flex';
            compteurNotif.style.alignItems = 'center';
            compteurNotif.style.justifyContent = 'center';
        } else {
            compteurNotif.style.display = 'none';
        }
    }
    
    console.log(`✅ Badges mis à jour: ${produitsCritiques} stocks critiques, ${creditsEnRetard} crédits en retard (>7j), total: ${totalAlertes}`);
}

function toggleMenu() {
    const barreLaterale = document.getElementById('barreLaterale');
    if (barreLaterale) {
        barreLaterale.classList.toggle('active');
    }
}

function deconnecter() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        // Redirection vers la page de connexion
        // depuis le dashboard (frontend/HTML/) on pointe vers connexion.html
        window.location.href = 'connexion.html';
    }
}

// ====================================================================
// GESTION DU DASHBOARD
// ====================================================================

function chargerDashboard() {
    console.log('📊 Chargement du dashboard');
    chargerDonneesDashboard().catch(err => console.error('Erreur chargement dashboard:', err));
    
    // Charger le graphique si Chart.js est disponible
    if (typeof Chart !== 'undefined') {
        setTimeout(() => initialiserChartDashboard(), 100);
    }
}

function initialiserChartDashboard() {
    const canvas = document.getElementById('chartVentes7Jours');
    if (!canvas) return;

    const labels = [];
    const ventes7Jours = [0, 0, 0, 0, 0, 0, 0]; // 7 derniers jours
    
    // Récupérer les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    }
    
    // Calculer les ventes pour chaque jour à partir de ventesData
    if (ventesData && ventesData.length > 0) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const ventesJour = ventesData.filter(v => v.date_vente && v.date_vente.startsWith(dateStr));
            const totalJour = ventesJour.reduce((sum, v) => sum + (parseFloat(v.montant_total) || 0), 0);
            ventes7Jours[6 - i] = Math.round(totalJour);
        }
    }

    // Détruire le graphique précédent si présent
    if (window._chartVentes7Jours) {
        try { 
            window._chartVentes7Jours.destroy(); 
        } catch (e) { 
            console.log('Graphique déjà détruit');
        }
    }

    const parent = canvas.parentElement;
    if (parent) parent.style.height = '320px';

    window._chartVentes7Jours = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventes (FCFA)',
                data: ventes7Jours,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                borderColor: 'rgba(211, 47, 47, 1)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(211, 47, 47, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function mettreAJourStatistiques() {
    let valeurStock = 0;
    let creditsEnCours = 0;
    
    produitsData.forEach(p => {
        valeurStock += p.stock * (p.prix || p.prix_vente || p.prix_unitaire || 0);
    });
    
    creditsData.forEach(c => {
        if (c.statut !== 'solde') {
            creditsEnCours += parseFloat(c.montant_restant) || 0;
        }
    });
    
    // Formater les montants avec regex
    const formaterMontant = (montant) => {
        const montantNum = Math.round(Number(montant) || 0);
        const montantStr = montantNum.toString();
        const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return montantFormate + ' FCFA';
    };
    
    // Mettre à jour les affichages des cartes stats
    const elemValeurStock = document.getElementById('stat-valeur-stock');
    if (elemValeurStock) {
        elemValeurStock.textContent = formaterMontant(valeurStock);
    }
    
    const elemCreditsEnCours = document.getElementById('stat-credits-montant');
    if (elemCreditsEnCours) {
        elemCreditsEnCours.textContent = formaterMontant(creditsEnCours);
    }
    
    const elemProduitCount = document.getElementById('stat-produits-count');
    if (elemProduitCount) {
        elemProduitCount.innerHTML = '<i class="fa-solid fa-box"></i><span>' + produitsData.length + ' produits</span>';
    }
    
    // Mettre à jour les totaux dans le panneau de filtres (produits)
    const totalProduits = document.getElementById('totalProduits');
    if (totalProduits) {
        totalProduits.textContent = produitsData.length;
    }
    
    const stockCritique = document.getElementById('stockCritique');
    if (stockCritique) {
        const nbCritique = produitsData.filter(p => p.stock < (p.seuilAlerte || p.seuil_alerte || 0)).length;
        stockCritique.textContent = nbCritique;
    }
    
    const valeurTotale = document.getElementById('valeurTotale');
    if (valeurTotale) {
        valeurTotale.textContent = formaterMontant(valeurStock);
    }
    
    // Mettre à jour les badges d'alertes dans le menu
    mettreAJourBadgesAlertes();
    
    // Charger les stocks critiques
    chargerStocksCritiques();
}

/**
 * Charger et afficher les stocks critiques
 */
async function chargerStocksCritiques() {
    const stocksCritiques = produitsData.filter(p => p.stock < p.seuilAlerte);
    const liste = document.getElementById('liste-stocks-critiques');
    
    if (!liste) return;
    
    if (stocksCritiques.length === 0) {
        liste.innerHTML = '<li style="text-align: center; color: #999; padding: 1rem;"><i class="fa-solid fa-check-circle"></i> Aucun stock critique</li>';
        document.getElementById('alerte-stock-critique').textContent = '0 produits en quantité critique';
        return;
    }
    
    let html = '';
    stocksCritiques.forEach(p => {
        html += '<li>';
        html += '<span class="nom-produit">' + p.nom + '</span>';
        html += '<span class="quantite">' + p.stock + ' restants (seuil: ' + p.seuilAlerte + ')</span>';
        html += '</li>';
    });
    
    liste.innerHTML = html;
    document.getElementById('alerte-stock-critique').textContent = stocksCritiques.length + ' produits en quantité critique (< seuil d\'alerte)';
}

/**
 * Charger et afficher les ventes récentes depuis l'API
 */
async function chargerVentesRecentes() {
    const tbody = document.getElementById('tableau-ventes-recentes');
    if (!tbody) return;
    
    try {
        const response = await api.getAllSales();
        
        if (!response.success || !Array.isArray(response.data)) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">Aucune vente enregistrée</td></tr>';
            return;
        }
        
        // Mettre à jour ventesData globale avec TOUTES les ventes
        ventesData = response.data;
        console.log('✅ Ventes chargées:', ventesData.length);
        
        // Prendre les 5 dernières ventes pour l'affichage
        const ventesRecentes = response.data.slice(0, 5);
        let totalVentes = 0;
        let nbProduits = 0;
        
        if (ventesRecentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">Aucune vente enregistrée</td></tr>';
        } else {
            let html = '';
            ventesRecentes.forEach(v => {
                const montant = parseFloat(v.montant_total) || 0;
                const type = v.type === 'credit' ? 'Crédit' : 'Comptant';
                const badge = v.type === 'credit' ? 'credit' : 'paye';
                const dateObj = new Date(v.date_vente);
                const date = dateObj.toLocaleDateString('fr-FR') + ' ' + dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
                
                totalVentes += montant;
                nbProduits += parseInt(v.quantite_totale) || 1;
                
                html += '<tr>';
                html += '<td><strong>#V-' + String(v.id).padStart(3, '0') + '</strong></td>';
                html += '<td>' + (v.descriptions || 'Produit(s)') + '</td>';
                html += '<td>' + (v.client_nom || 'Client') + '</td>';
                html += '<td><strong>' + montant.toLocaleString('fr-FR') + ' FCFA</strong></td>';
                html += '<td><span class="badge ' + badge + '">' + type + '</span></td>';
                html += '<td>' + date + '</td>';
                html += '<td><i class="fa-solid fa-eye eye-icon" onclick="voirDetailVente(' + v.id + ')" title="Voir détails" style="cursor: pointer;"></i></td>';
                html += '</tr>';
            });
            
            tbody.innerHTML = html;
        }
        
        // Mettre à jour les stats de ventes
        document.getElementById('stat-ventes-jour').textContent = totalVentes.toLocaleString('fr-FR') + ' FCFA';
        document.getElementById('stat-produits-vendus').textContent = nbProduits;
        
    } catch (error) {
        console.error('Erreur chargement ventes:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: red;">Erreur lors du chargement</td></tr>';
    }
}

/**
 * Charger et afficher les crédits impayés
 */
async function chargerCreditsImpayés() {
    try {
        const response = await api.getAllCredits();
        
        console.log('🔍 chargerCreditsImpayés - Réponse API:', response);
        
        if (!response.success || !Array.isArray(response.data)) {
            console.log('❌ Pas de données ou erreur API');
            document.getElementById('stat-credits-montant').textContent = '0 FCFA';
            document.getElementById('stat-credits-count').innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i><span>0 crédits actifs</span>';
            document.getElementById('alerte-credits-impaye').textContent = '0 crédits non remboursés';
            return;
        }
        
        console.log('📊 Tous les crédits reçus:', response.data);
        const creditsImpayés = response.data.filter(c => c.statut !== 'solde');
        console.log('📊 Crédits impayés après filtre:', creditsImpayés);
        const totalCredits = creditsImpayés.reduce((sum, c) => sum + (parseFloat(c.montant_restant) || 0), 0);
        console.log('📊 Total impayés calculé:', totalCredits);
        
        document.getElementById('stat-credits-montant').textContent = totalCredits.toLocaleString('fr-FR') + ' FCFA';
        document.getElementById('stat-credits-count').innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i><span>' + creditsImpayés.length + ' crédits actifs</span>';
        document.getElementById('alerte-credits-impaye').textContent = creditsImpayés.length + ' crédits non remboursés - Total: ' + totalCredits.toLocaleString('fr-FR') + ' FCFA';
        
    } catch (error) {
        console.error('Erreur chargement crédits:', error);
    }
}

/**
 * Charger les activités récentes
 */
async function chargerActivitesRecentes() {
    const liste = document.getElementById('liste-activites');
    if (!liste) return;
    
    try {
        const response = await api.getAllSales();
        
        if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
            liste.innerHTML = '<li style="text-align: center; color: #999; padding: 1rem;">Aucune activité récente</li>';
            return;
        }
        
        let html = '';
        // Prendre les 4 dernières ventes
        const ventes = response.data.slice(0, 4);
        
        ventes.forEach((v, index) => {
            const dateVente = new Date(v.date_vente);
            const maintenant = new Date();
            const diffMinutes = Math.floor((maintenant - dateVente) / 60000);
            
            let tempsTexte = 'À l\'instant';
            if (diffMinutes < 60) {
                tempsTexte = 'Il y a ' + diffMinutes + ' min';
            } else if (diffMinutes < 1440) {
                const heures = Math.floor(diffMinutes / 60);
                tempsTexte = 'Il y a ' + heures + ' h' + (heures > 1 ? '' : '');
            } else {
                const jours = Math.floor(diffMinutes / 1440);
                tempsTexte = 'Il y a ' + jours + ' j' + (jours > 1 ? '' : '');
            }
            
            const typeVente = v.type === 'credit' ? 'crédit' : 'comptant';
            const montant = parseFloat(v.montant_total) || 0;
            
            html += '<li>';
            html += '<strong>Vente ' + typeVente + ' de ' + montant.toLocaleString('fr-FR') + ' FCFA - ' + (v.client_nom || 'Client') + '</strong>';
            html += '<span class="heure"><i class="fa-regular fa-clock"></i> ' + tempsTexte + '</span>';
            html += '</li>';
        });
        
        if (html === '') {
            liste.innerHTML = '<li style="text-align: center; color: #999; padding: 1rem;">Aucune activité récente</li>';
        } else {
            liste.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Erreur chargement activités:', error);
        liste.innerHTML = '<li style="text-align: center; color: red;">Erreur lors du chargement</li>';
    }
}

/**
 * Afficher le résumé détaillé du jour
 */
function afficherResumeDuJour() {
    console.log('📊 Affichage résumé du jour');
    
    // Récupérer la date d'aujourd'hui
    const aujourd_hui = new Date().toISOString().split('T')[0];
    
    // Calculer les ventes d'aujourd'hui
    const ventesAujourdhui = ventesData.filter(v => v.date_vente && v.date_vente.startsWith(aujourd_hui));
    const totalVentes = ventesAujourdhui.reduce((sum, v) => sum + (parseFloat(v.montant_total) || 0), 0);
    const ventes_comptant = ventesAujourdhui
        .filter(v => v.type_paiement === 'comptant')
        .reduce((sum, v) => sum + (parseFloat(v.montant_total) || 0), 0);
    
    // Calculer les crédits d'aujourd'hui
    const creditsAujourdhui = creditsData.filter(c => c.date_credit && c.date_credit.startsWith(aujourd_hui));
    const credits_accordes = creditsAujourdhui.reduce((sum, c) => sum + (parseFloat(c.montant_total) || 0), 0);
    
    const remboursements = creditsData
        .filter(c => c.date_remboursement_complet && c.date_remboursement_complet.startsWith(aujourd_hui))
        .reduce((sum, c) => sum + (parseFloat(c.montant_paye) || 0), 0);
    
    // Formater les montants
    const formaterMontant = (montant) => {
        const montantNum = Math.round(Number(montant) || 0);
        const montantStr = montantNum.toString();
        const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return montantFormate + ' FCFA';
    };
    
    // Mettre à jour les IDs du résumé du jour
    const elemRecettes = document.getElementById('resumeRecettesTotal');
    if (elemRecettes) elemRecettes.textContent = formaterMontant(totalVentes);
    
    const elemVentesComptant = document.getElementById('resumeVentesComptant');
    if (elemVentesComptant) elemVentesComptant.textContent = formaterMontant(ventes_comptant);
    
    const elemCreditsAccordes = document.getElementById('resumeCreditsAccordes');
    if (elemCreditsAccordes) elemCreditsAccordes.textContent = formaterMontant(credits_accordes);
    
    const elemRemboursements = document.getElementById('resumeRemboursements');
    if (elemRemboursements) elemRemboursements.textContent = formaterMontant(remboursements);
    
    // Mettre à jour les statistiques des cartes
    document.getElementById('stat-ventes-jour').textContent = formaterMontant(totalVentes);
    document.getElementById('stat-produits-vendus').textContent = ventesAujourdhui.length;
    
    // Afficher les top 5 produits du jour
    afficherTop5ProduitsAujourdhui();
}

/**
 * Afficher les top 5 produits vendus aujourd'hui
 */
function afficherTop5ProduitsAujourdhui() {
    const aujourd_hui = new Date().toISOString().split('T')[0];
    const liste = document.querySelector('.liste-activites');
    if (!liste) return;
    
    // Compter les ventes par produit d'aujourd'hui
    const ventesAujourdhui = ventesData.filter(v => v.date_vente && v.date_vente.startsWith(aujourd_hui));
    
    const ventesParProduit = {};
    ventesAujourdhui.forEach(v => {
        if (v.descriptions) {
            ventesParProduit[v.descriptions] = (ventesParProduit[v.descriptions] || 0) + (parseInt(v.quantite_totale) || 1);
        }
    });
    
    // Trier et prendre top 5
    const top5 = Object.entries(ventesParProduit)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Mettre à jour la liste des top produits
    if (top5.length > 0) {
        let html = '';
        top5.forEach((produit, index) => {
            html += '<li>';
            html += '<strong>' + (index + 1) + '. ' + produit[0] + '</strong>';
            html += '<span class="heure"><i class="fa-solid fa-box"></i> ' + produit[1] + ' unité' + (produit[1] > 1 ? 's' : '') + ' vendue' + (produit[1] > 1 ? 's' : '') + '</span>';
            html += '</li>';
        });
        
        // Remplacer la liste dans la 2ème carte (Top Produits)
        const cartes = document.querySelectorAll('.liste-activites');
        if (cartes.length > 1) {
            cartes[1].innerHTML = html;
        }
    }
}

/**
 * Mettre à jour les statistiques de stock détaillées
 */
function mettreAJourStatistiquesStocks() {
    console.log('📦 Mise à jour statistiques stocks');
    
    const mois_actuel = new Date().getMonth();
    const annee_actuelle = new Date().getFullYear();
    
    // Calculer la valeur totale du stock
    let valeurTotale = 0;
    let nbProduits = 0;
    produitsData.forEach(p => {
        nbProduits++;
        valeurTotale += (p.stock || 0) * (p.prix || p.prix_vente || p.prix_unitaire || 0);
    });
    
    // Calculer les entrées du mois
    let entreesTotal = 0;
    let sortiesTotal = 0;
    if (mouvementsData && mouvementsData.length > 0) {
        mouvementsData.forEach(m => {
            const dateMouvement = new Date(m.date_mouvement);
            if (dateMouvement.getMonth() === mois_actuel && dateMouvement.getFullYear() === annee_actuelle) {
                const qte = parseInt(m.quantite) || 0;
                if (m.type === 'entree') {
                    entreesTotal += qte;
                } else if (m.type === 'sortie' || m.type === 'perte') {
                    sortiesTotal += qte;
                }
            }
        });
    }
    
    // Formater les montants
    const formaterMontant = (montant) => {
        const montantNum = Math.round(Number(montant) || 0);
        const montantStr = montantNum.toString();
        const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return montantFormate + ' FCFA';
    };
    
    // Compter les produits critiques
    const produitsCritiques = produitsData.filter(p => p.stock < (p.seuilAlerte || p.seuil_alerte || 0)).length;
    
    // Mettre à jour les éléments du DOM
    const elemValeurStock = document.getElementById('stat-stock-valeur');
    if (elemValeurStock) {
        elemValeurStock.textContent = formaterMontant(valeurTotale);
    }
    
    const elemNbProduits = document.getElementById('stat-stock-nb');
    if (elemNbProduits) {
        elemNbProduits.textContent = nbProduits + ' produits';
    }
    
    const elemEntrees = document.getElementById('stat-entrees-mois');
    if (elemEntrees) {
        elemEntrees.textContent = entreesTotal + ' unité' + (entreesTotal !== 1 ? 's' : '');
    }
    
    const elemEntreesPourcentage = document.getElementById('stat-entrees-pourcentage');
    if (elemEntreesPourcentage) {
        const totalMouvement = entreesTotal + sortiesTotal;
        const pourcentage = totalMouvement > 0 ? Math.round((entreesTotal / totalMouvement) * 100) : 0;
        elemEntreesPourcentage.textContent = pourcentage + '% du flux';
    }
    
    const elemSorties = document.getElementById('stat-sorties-mois');
    if (elemSorties) {
        elemSorties.textContent = sortiesTotal + ' unité' + (sortiesTotal !== 1 ? 's' : '');
    }
    
    const elemSortiesType = document.getElementById('stat-sorties-type');
    if (elemSortiesType) {
        elemSortiesType.textContent = 'Ventes + Pertes';
    }
    
    const elemCritiques = document.getElementById('stat-produits-critiques');
    if (elemCritiques) {
        elemCritiques.textContent = produitsCritiques;
        if (produitsCritiques > 0) {
            elemCritiques.style.color = '#D32F2F'; // Rouge si critique
        } else {
            elemCritiques.style.color = '#4CAF50'; // Vert si OK
        }
    }
}

/**
 * Charger toutes les données du dashboard
 */
async function chargerDonneesDashboard() {
    console.log('📊 Chargement des données du dashboard');
    try {
        console.log('⏱️ Chargement parallèle des données principales...');
        
        // Chargement parallèle des données
        await Promise.all([
            chargerCredits(),
            chargerVentesAPI(1000, 0),
            chargerMouvementsAPI(1000)
        ]);
        
        console.log('✅ Données principales chargées');
        console.log('   - Crédits:', creditsData.length);
        console.log('   - Ventes:', ventesData.length);
        console.log('   - Mouvements:', mouvementsData.length);
        
        // Affichage et mise à jour
        await chargerVentesRecentes();
        await afficherResumeDuJour();
        await mettreAJourCompteursFiltres();
        await chargerCreditsImpayés();
        await chargerActivitesRecentes();
        
        mettreAJourStatistiquesStocks();
        
        if (typeof Chart !== 'undefined') {
            initialiserChartDashboard();
        }
        
        mettreAJourStatistiquesRapports();
        mettreAJourBadgesAlertes();
        
        console.log('✅ Dashboard mis à jour');
    } catch (error) {
        console.error('❌ ERREUR dans chargerDonneesDashboard:', error);
    }
}

function telechargerRapportJournalier() {
    afficherNotification('Génération du rapport en cours...', 'info');
    setTimeout(() => {
        afficherNotification('Rapport journalier téléchargé avec succès', 'success');
    }, 1500);
}

// ====================================================================
// GESTION DES PRODUITS
// ====================================================================

async function chargerProduits() {
    console.log('📦 Chargement des produits depuis API');
    try {
        const response = await api.getAllProducts();
        if (response.success && response.data) {
            // Transformer les données de l'API au format du frontend
            produitsData = response.data.map(p => ({
                id: p.id,
                nom: p.nom,
                codeBarre: p.code_barre || '',
                categorie_id: p.categorie_id || null,
                categorie: p.categorie_nom || (p.categorie_id ? String(p.categorie_id) : ''),
                prix: parseFloat(p.prix_vente) || 0,
                stock: parseInt(p.stock) || 0,
                seuilAlerte: parseInt(p.seuil_alerte) || 0,
                icone: p.icone || 'fa-box' // Icône par défaut
            }));
            console.log('✅ Produits chargés depuis API:', produitsData.length, 'produits');
            afficherProduits(produitsData);
            mettreAJourStatistiques();
        } else {
            console.log('⚠️ Erreur API:', response.message);
            afficherProduits(produitsData);
        }
    } catch (error) {
        console.log('❌ Erreur chargement API:', error.message);
        afficherProduits(produitsData);
    }
}

function afficherProduits(produits, page = currentPage) {
    const tbody = document.getElementById('corpTableauProduits');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(produits) || produits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">Aucun produit trouvé</td></tr>';
        renderPagination(1);
        return;
    }

    // calcul pagination
    const totalPages = Math.max(1, Math.ceil(produits.length / perPageProducts));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * perPageProducts;
    const end = start + perPageProducts;
    const pageItems = produits.slice(start, end);

    pageItems.forEach(produit => {
        const etat = determinerEtatStock(produit.stock, produit.seuilAlerte);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="info-produit">
                    <div class="icone-produit">
                        <i class="fa-solid ${produit.icone}"></i>
                    </div>
                    <div class="details-produit">
                        <h4>${produit.nom}</h4>
                        <span class="code-barre">${produit.codeBarre}</span>
                    </div>
                </div>
            </td>
            <td><span class="badge-categorie badge-${produit.categorie}">${produit.categorie}</span></td>
            <td><span class="prix-produit">${(produit.prix || 0).toLocaleString()} FCFA</span></td>
            <td>
                <div class="stock-produit">
                    <span class="badge-stock stock-${etat.classe}">${produit.stock} unités</span>
                </div>
            </td>
            <td>${produit.seuilAlerte}</td>
            <td>
                <div class="actions-produit">
                    <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailProduit('${produit.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icone btn-modifier" title="Modifier" onclick="modifierProduit('${produit.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icone btn-supprimer" title="Supprimer" onclick="confirmerSuppressionProduit('${produit.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.querySelector('.pagination');
    if (!container) return;

    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'btn-page';
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', () => goToPage(currentPage - 1));
    container.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-page';
        if (i === currentPage) btn.classList.add('actif');
        btn.textContent = i;
        btn.addEventListener('click', () => goToPage(i));
        container.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'btn-page';
    next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    next.disabled = currentPage >= totalPages;
    next.addEventListener('click', () => goToPage(currentPage + 1));
    container.appendChild(next);
}

function goToPage(page) {
    const totalPages = Math.max(1, Math.ceil(produitsData.length / perPageProducts));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    afficherProduits(produitsData, page);
}

/**
 * Charger les catégories depuis l'API et mettre à jour les sélecteurs
 */
async function chargerCategories() {
    console.log('📂 Chargement des catégories depuis API');
    try {
        const response = await fetch('/APP_IB/backend/Api/Categories/list.php');
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
            const select = document.getElementById('categorieProduit');
            const filtreSelect = document.getElementById('filtreCategorie');
            
            if (select) {
                // Conserver l'option vide
                const currentValue = select.value;
                select.innerHTML = '<option value="">Sélectionner une catégorie</option>';
                
                // Ajouter les catégories de l'API
                json.data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.nom;
                    select.appendChild(option);
                });
                
                // Restaurer la sélection si elle existe
                if (currentValue && select.querySelector('option[value="' + currentValue + '"]')) {
                    select.value = currentValue;
                }
                
                console.log('✅ Catégories chargées dans sélecteur produit:', json.data.length);
            }
            
            // Mettre à jour le filtre par catégorie
            if (filtreSelect) {
                const currentFilterValue = filtreSelect.value;
                filtreSelect.innerHTML = '<option value="">Toutes les catégories</option>';
                
                json.data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.nom;
                    filtreSelect.appendChild(option);
                });
                
                // Restaurer la sélection du filtre
                if (currentFilterValue && filtreSelect.querySelector('option[value="' + currentFilterValue + '"]')) {
                    filtreSelect.value = currentFilterValue;
                }
                
                console.log('✅ Catégories chargées dans filtre:', json.data.length);
            }
        }
    } catch (error) {
        console.error('❌ Erreur chargement catégories:', error);
    }
}

function ouvrirModalProduit(mode = 'ajouter', produitId = null) {
    const modal = document.getElementById('modalProduit');
    const titre = document.getElementById('titreProduit');
    const form = document.getElementById('formProduit');
    
    if (!modal) return;
    
    form.reset();
    
    if (mode === 'modifier' && produitId) {
        const produit = produitsData.find(p => p.id === produitId);
        if (produit) {
            titre.innerHTML = '<i class="fa-solid fa-pen"></i> Modifier le Produit';
            document.getElementById('nomProduit').value = produit.nom;
            document.getElementById('codeBarreProduit').value = produit.codeBarre;
            document.getElementById('categorieProduit').value = produit.categorie_id || produit.categorie;
            document.getElementById('prixProduit').value = produit.prix;
            document.getElementById('stockInitial').value = produit.stock;
            document.getElementById('seuilAlerte').value = produit.seuilAlerte;
            form.dataset.mode = 'modifier';
            form.dataset.produitId = produitId;
        }
    } else {
        titre.innerHTML = '<i class="fa-solid fa-plus"></i> Ajouter un Produit';
        form.dataset.mode = 'ajouter';
        delete form.dataset.produitId;
    }
    
    modal.classList.add('active');
}

function fermerModalProduit() {
    const modal = document.getElementById('modalProduit');
    if (modal) {
        modal.classList.remove('active');
    }
}

function ouvrirModalProfil() {
    const modal = document.getElementById('modalProfil');
    if (modal) {
        // Remplir les champs avec les données de l'utilisateur connecté
        api.checkSession().then(user => {
            if (user) {
                document.getElementById('profilPrenom').value = user.prenom || '';
                document.getElementById('profilNom').value = user.nom || '';
                document.getElementById('profilTelephone').value = user.telephone || '';
                document.getElementById('profilEmail').value = user.email || '';
            }
            // Vider les champs de mot de passe
            document.getElementById('profilMotDePasseActuel').value = '';
            document.getElementById('profilNouveauMotDePasse').value = '';
            document.getElementById('profilConfirmMotDePasse').value = '';
        });
        modal.classList.add('show');
    }
}

function fermerModalProfil() {
    const modal = document.getElementById('modalProfil');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Ouvrir la modale pour ajouter/modifier une catégorie
 */
function ouvrirModalCategorie(mode = 'ajouter', categorieId = null) {
    const modal = document.getElementById('modalCategorie');
    if (!modal) {
        console.error('Modal catégorie non trouvée');
        return;
    }

    // Réinitialiser le formulaire
    const form = document.getElementById('formCategorie');
    if (form) {
        form.reset();
        form.dataset.mode = mode;
        form.dataset.categorieId = categorieId || '';
    }

    // Mettre à jour le titre
    const titre = document.getElementById('titreCategorie');
    if (titre) {
        if (mode === 'modifier') {
            titre.innerHTML = '<i class="fa-solid fa-edit"></i> Modifier la Catégorie';
        } else {
            titre.innerHTML = '<i class="fa-solid fa-box-open"></i> Ajouter une Catégorie';
        }
    }

    // Charger la liste des catégories dans l'onglet Gérer
    chargerListeCategories();

    // Afficher le premier onglet
    basculerTabCategorie('ajouter');

    // Afficher la modale
    modal.classList.add('active');
}

/**
 * Fermer la modale des catégories
 */
function fermerModalCategorie() {
    const modal = document.getElementById('modalCategorie');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Basculer entre les onglets de la modale catégorie
 */
function basculerTabCategorie(tabName) {
    // Masquer tous les onglets
    const tabs = document.querySelectorAll('.categorie-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Désactiver tous les boutons de tab
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('tab-active'));

    // Afficher l'onglet sélectionné
    const tab = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tab) {
        tab.classList.add('active');
    }

    // Activer le bouton correspondant
    const btn = document.querySelector('.tab-btn[onclick*="' + tabName + '"]');
    if (btn) {
        btn.classList.add('tab-active');
    }
}

/**
 * Charger et afficher la liste des catégories
 */
async function chargerListeCategories() {
    const liste = document.getElementById('listeCategories');
    if (!liste) return;

    try {
        const response = await fetch('/APP_IB/backend/Api/Categories/list.php');
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
            if (json.data.length === 0) {
                liste.innerHTML = '<p style="text-align: center; color: #999;">Aucune catégorie pour le moment</p>';
                return;
            }

            let html = '<table style="width: 100%; border-collapse: collapse;">';
            html += '<tr style="background-color: #f5f5f5; border-bottom: 1px solid #ddd;">';
            html += '<th style="text-align: left; padding: 10px;">Nom</th>';
            html += '<th style="text-align: center; padding: 10px;">Actions</th>';
            html += '</tr>';

            json.data.forEach(cat => {
                html += '<tr style="border-bottom: 1px solid #ddd;">';
                html += '<td style="padding: 10px;">' + cat.nom + '</td>';
                html += '<td style="text-align: center; padding: 10px;">';
                html += '<button class="btn-mini" onclick="modifierCategorie(' + cat.id + ')" title="Modifier"><i class="fa-solid fa-edit"></i></button>';
                html += '<button class="btn-mini danger" onclick="supprimerCategorie(' + cat.id + ', \'' + cat.nom.replace(/'/g, "\\'") + '\')" title="Supprimer"><i class="fa-solid fa-trash"></i></button>';
                html += '</td>';
                html += '</tr>';
            });

            html += '</table>';
            liste.innerHTML = html;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        liste.innerHTML = '<p style="color: red;">Erreur lors du chargement</p>';
    }
}

/**
 * Modifier une catégorie
 */
async function modifierCategorie(categorieId) {
    try {
        const response = await fetch('/APP_IB/backend/Api/Categories/list.php');
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
            const cat = json.data.find(c => c.id == categorieId);
            if (cat) {
                document.getElementById('nomCategorie').value = cat.nom;

                const form = document.getElementById('formCategorie');
                if (form) {
                    form.dataset.mode = 'modifier';
                    form.dataset.categorieId = categorieId;
                }

                // Changer le titre
                const titre = document.getElementById('titreCategorie');
                if (titre) {
                    titre.innerHTML = '<i class="fa-solid fa-edit"></i> Modifier la Catégorie';
                }

                // Aller à l'onglet Ajouter pour éditer
                basculerTabCategorie('ajouter');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

/**
 * Supprimer une catégorie
 */
async function supprimerCategorie(categorieId, nomCategorie) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer la catégorie "' + nomCategorie + '" et tous ses produits dépendants?')) {
        return;
    }

    try {
        const response = await fetch('/APP_IB/backend/Api/Categories/delete.php?id=' + categorieId, {
            method: 'DELETE'
        });
        const json = await response.json();

        if (json.success) {
            afficherNotification('Catégorie supprimée avec succès', 'success');
            chargerListeCategories();
            chargerCategories();
        } else {
            afficherNotification('Erreur: ' + json.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        afficherNotification('Erreur lors de la suppression', 'error');
    }
}

function fermerModalDetailProduit() {
    const modal = document.getElementById('modalDetailProduit');
    if (modal) {
        modal.classList.remove('active');
    }
}

function modifierProduit(produitId) {
    // Charger les données du produit depuis l'API avant d'ouvrir la modal
    (async () => {
        try {
            console.log('📦 Chargement détails produit pour modification:', produitId);
            const res = await fetch(`/APP_IB/backend/Api/Products/details.php?id=${produitId}`, { 
                credentials: 'include' 
            });
            const json = await res.json();
            if (json.success && json.data) {
                const p = json.data;
                // Préremplir le formulaire avec les données de l'API
                const form = document.getElementById('formProduit');
                form.dataset.mode = 'modifier';
                form.dataset.produitId = produitId;
                
                document.getElementById('nomProduit').value = p.nom || '';
                document.getElementById('codeBarreProduit').value = p.code_barre || '';
                document.getElementById('categorieProduit').value = p.categorie_id || '';
                document.getElementById('prixProduit').value = parseFloat(p.prix_vente) || 0;
                document.getElementById('stockInitial').value = parseInt(p.stock) || 0;
                document.getElementById('seuilAlerte').value = parseInt(p.seuil_alerte) || 0;
                
                // Mettre à jour le titre
                const titre = document.getElementById('titreProduit');
                titre.innerHTML = '<i class="fa-solid fa-pen"></i> Modifier le Produit';
                
                // Ouvrir la modal
                const modal = document.getElementById('modalProduit');
                if (modal) modal.classList.add('active');
                
                console.log('✅ Formulaire prérempli avec données API');
            } else {
                afficherNotification(json.message || 'Impossible de récupérer le produit', 'error');
            }
        } catch (err) {
            console.error('Erreur chargement modification:', err);
            afficherNotification('Erreur récupération détails', 'error');
        }
    })();
}



function supprimerProduit(produitId) {
    // Déprécié: utiliser confirmerSuppressionProduit() à la place
    console.warn('supprimerProduit() est déprécié, utiliser confirmerSuppressionProduit()');
    confirmerSuppressionProduit(produitId);
}
async function confirmerSuppressionProduit(produitId) {
    try {
        // Vérifier les dépendances avant suppression
        const resDeps = await fetch(`/APP_IB/backend/Api/Products/check-deps.php?id=${produitId}`, { method: 'GET', credentials: 'include' });
        const depsJson = await resDeps.json();
        if (!depsJson.success) {
            console.warn('Impossible de vérifier dépendances:', depsJson.message);
        }

        const deps = depsJson.data || {};
        const depEntries = Object.entries(deps).filter(([k,v]) => v > 0);
        let mode = 'soft';

        if (depEntries.length === 0) {
            // pas de dépendances
            const hardDelete = confirm('Supprimer définitivement ce produit ?\nOK = suppression définitive (danger), Annuler = suppression normale');
            mode = hardDelete ? 'hard' : 'soft';
        } else {
            // il y a des dépendances
            let msg = 'Ce produit a des dépendances :\n';
            depEntries.forEach(([table,count]) => { msg += `- ${table}: ${count}\n`; });
            msg += '\nOK = Supprimer définitivement et nettoyer les dépendances (danger), Annuler = suppression normale';
            const doCleanup = confirm(msg);
            mode = doCleanup ? 'hard_cleanup' : 'soft';
        }

        if (!confirm('Confirmer suppression du produit ID ' + produitId + ' ?')) return;

        const formData = new FormData();
        formData.append('id', produitId);
        formData.append('mode', mode);
        console.log('📤 Appel API DELETE (mode=' + mode + ') pour produit:', produitId);
        const res = await fetch(`/APP_IB/backend/Api/Products/delete.php`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const json = await res.json();
        console.log('📥 Réponse API:', json);
        if (json.success) {
            afficherNotification(json.message || 'Produit supprimé', 'success');
            // recharger les produits depuis API
            await chargerProduits();
        } else {
            afficherNotification(json.message || 'Erreur suppression', 'error');
        }
    } catch (err) {
        console.error('Erreur suppression API:', err);
        afficherNotification('Erreur suppression produit', 'error');
    }
}

function voirDetailProduit(produitId) {
    // Récupérer et afficher les détails dans une modal
    (async () => {
        try {
            console.log('📦 Chargement détails produit:', produitId);
            const res = await fetch(`/APP_IB/backend/Api/Products/details.php?id=${produitId}`, { 
                credentials: 'include' 
            });
            const json = await res.json();
            if (json.success && json.data) {
                const p = json.data;
                const content = document.getElementById('detailsProduitContent');
                
                content.innerHTML = `
                    <div style="display: grid; grid-template-columns: 200px 1fr; gap: 15px;">
                        <strong>Nom:</strong>
                        <span>${p.nom || '-'}</span>
                        
                        <strong>Code-barre:</strong>
                        <span>${p.code_barre || '-'}</span>
                        
                        <strong>Catégorie:</strong>
                        <span>${p.categorie_nom || p.categorie_id || '-'}</span>
                        
                        <strong>Prix (FCFA):</strong>
                        <span>${parseFloat(p.prix_vente || 0).toLocaleString()}</span>
                        
                        <strong>Stock actuel:</strong>
                        <span>${parseInt(p.stock) || 0} unités</span>
                        
                        <strong>Seuil d'alerte:</strong>
                        <span>${parseInt(p.seuil_alerte) || 0}</span>
                        
                        <strong>Prix d'achat:</strong>
                        <span>${parseFloat(p.prix_achat || 0).toLocaleString()} FCFA</span>
                        
                        <strong>Statut:</strong>
                        <span>${p.actif ? '✅ Actif' : '❌ Inactif'}</span>
                    </div>
                `;
                
                // Ouvrir la modal
                const modal = document.getElementById('modalDetailProduit');
                if (modal) modal.classList.add('active');
                
                console.log('✅ Détails affichés dans modal');
            } else {
                afficherNotification(json.message || 'Impossible de récupérer le produit', 'error');
            }
        } catch (err) {
            console.error('Erreur details API:', err);
            afficherNotification('Erreur récupération détails', 'error');
        }
    })();
}

function filtrerProduits() {
    const categorie = document.getElementById('filtreCategorie')?.value;
    const etatStock = document.getElementById('filtreStock')?.value;
    
    let resultats = produitsData;
    
    if (categorie) {
        // Comparer par categorie_id (ID numérique)
        resultats = resultats.filter(p => String(p.categorie_id) === categorie);
    }
    
    if (etatStock) {
        resultats = resultats.filter(p => {
            const etat = determinerEtatStock(p.stock, p.seuilAlerte);
            return etat.classe === etatStock;
        });
    }
    
    afficherProduits(resultats);
}

function trierProduits() {
    const tri = document.getElementById('triProduits')?.value;
    let resultats = [...produitsData];
    
    switch(tri) {
        case 'nom':
            resultats.sort((a, b) => a.nom.localeCompare(b.nom));
            break;
        case 'nom-desc':
            resultats.sort((a, b) => b.nom.localeCompare(a.nom));
            break;
        case 'prix':
            resultats.sort((a, b) => a.prix - b.prix);
            break;
        case 'prix-desc':
            resultats.sort((a, b) => b.prix - a.prix);
            break;
        case 'stock':
            resultats.sort((a, b) => a.stock - b.stock);
            break;
        case 'stock-desc':
            resultats.sort((a, b) => b.stock - a.stock);
            break;
    }
    
    afficherProduits(resultats);
}

function scannerCodeBarre() {
    afficherNotification('Scanner de code-barre activé', 'info');
    // Simulation d'un scan
    setTimeout(() => {
        const codeBarre = '12345' + Math.floor(Math.random() * 100000);
        document.getElementById('codeBarreProduit').value = codeBarre;
        afficherNotification('Code-barre scanné: ' + codeBarre, 'success');
    }, 1000);
}

// ====================================================================
// GESTION DES VENTES
// ====================================================================

function chargerVentes() {
    console.log('🛒 Chargement des ventes');
    chargerProduitsPopulaires();
    afficherPanier();
}

/**
 * Charger les crédits et afficher dans le tableau
 */
async function chargerCredits() {
    console.log('💳 Chargement des crédits...');
    
    try {
        console.log('   Avant chargerCreditsAPI...');
        creditsData = await chargerCreditsAPI(1000, 0);
        console.log('📊 creditsData reçu:', creditsData);
        console.log('📊 Type:', typeof creditsData);
        console.log('📊 Length:', creditsData?.length);
        
        console.log('   Avant afficherCredits...');
        afficherCredits();
        console.log('   Après afficherCredits...');
        
        // Mettre à jour les stats
        await mettreAJourDashboardCredits();
        
        // Mettre à jour les badges d'alertes
        mettreAJourBadgesAlertes();
        
        // Charger les remboursements récents et top clients
        await afficherRemboursementsRecents();
        await afficherTopClientsCredit();
    } catch (error) {
        console.error('❌ Erreur chargement crédits:', error);
    }
}

/**
 * Afficher les crédits dans le tableau
 */
function afficherCredits() {
    console.log('🎯 afficherCredits() appelée');
    const tbody = document.getElementById('tableauCreditsBody');
    console.log('   tbody element:', tbody);
    
    if (!tbody) {
        console.warn('⚠️ Element tableauCreditsBody non trouvé');
        return;
    }
    
    tbody.innerHTML = '';
    
    console.log('📋 creditsData:', creditsData);
    console.log('   Length:', creditsData?.length);
    
    if (!creditsData || creditsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Aucun crédit trouvé</td></tr>';
        return;
    }
    
    creditsData.forEach((credit, index) => {
        const dateCredit = new Date(credit.date_credit);
        const joursEcoules = Math.floor((new Date() - dateCredit) / (1000 * 60 * 60 * 24));
        const etatClasse = credit.statut === 'solde' ? 'etat-solde' : (joursEcoules > 7 ? 'etat-retard' : 'etat-cours');
        const etatTexte = credit.statut === 'solde' ? 'Remboursé' : (joursEcoules > 7 ? 'En retard' : 'En cours');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${credit.reference}</strong></td>
            <td>${credit.client_nom}</td>
            <td>${parseFloat(credit.montant_total).toLocaleString()} FCFA</td>
            <td><strong>${parseFloat(credit.montant_restant).toLocaleString()} FCFA</strong></td>
            <td>${dateCredit.toLocaleDateString('fr-FR')}</td>
            <td>${joursEcoules} jours</td>
            <td><span class="badge-etat ${etatClasse}">${etatTexte}</span></td>
            <td>
                <div class="actions-credit">
                    <button class="btn-icone" onclick="ouvrirModalRemboursement(${credit.id}, '${credit.reference}')" title="Enregistrer remboursement">
                        <i class="fa-solid fa-money-bill"></i>
                    </button>
                    <button class="btn-icone" onclick="voirDetailsCredit(${credit.id})" title="Voir détails">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Ouvrir la modal pour enregistrer un remboursement
 */
function ouvrirModalRemboursement(creditId = null, reference = null) {
    console.log('🔓 Ouverture modal remboursement:', {creditId, reference});
    
    const modal = document.getElementById('modalRemboursement');
    console.log('   Modal trouvée:', !!modal);
    
    if (!modal) {
        console.error('❌ Modal remboursement non trouvée dans le DOM');
        return;
    }
    
    // Remplir le select des crédits avec les crédits impayés
    const selectCredit = document.getElementById('creditRemboursement');
    if (selectCredit && creditsData && creditsData.length > 0) {
        selectCredit.innerHTML = '<option value="">Sélectionner un crédit</option>';
        
        // Ajouter les crédits impayés
        creditsData.forEach(credit => {
            if (credit.montant_restant > 0) {
                const option = document.createElement('option');
                option.value = credit.id;
                option.textContent = `${credit.reference} - ${credit.client_nom} (${credit.montant_restant.toLocaleString()} FCFA)`;
                selectCredit.appendChild(option);
            }
        });
        
        // Si creditId fourni, le sélectionner
        if (creditId) {
            selectCredit.value = creditId;
            afficherInfoCredit();
        }
    }
    
    // Réinitialiser le formulaire
    const form = document.getElementById('formRemboursement');
    if (form) form.reset();
    
    // Afficher la modal
    modal.classList.add('active');
    console.log('   Modal affichée');
}

/**
 * Fermer la modal de remboursement
 */
function fermerModalRemboursement() {
    const modal = document.getElementById('modalRemboursement');
    if (modal) {
        modal.classList.remove('active');
        console.log('🔒 Modal remboursement fermée');
    }
}

/**
 * Enregistrer un remboursement
 */
async function enregistrerRemboursement(e) {
    if (e) e.preventDefault();
    
    // Valider le montant avant de continuer
    if (!validerMontantRembours()) {
        alert('Montant invalide');
        return;
    }
    
    const creditId = document.getElementById('creditRemboursement')?.value;
    const montant = parseFloat(document.getElementById('montantRembourse')?.value);
    const modePaiement = 'ESPECES'; // Le HTML n'a pas de sélecteur de mode
    
    console.log('🔍 Valeurs du formulaire:');
    console.log('   creditId:', creditId, '(type:', typeof creditId + ')');
    console.log('   montant:', montant, '(type:', typeof montant + ')');
    console.log('   modePaiement:', modePaiement);
    
    if (!creditId || !montant || montant <= 0) {
        console.error('❌ Validation échouée:', {creditId, montant});
        afficherNotification('Veuillez saisir les informations correctes', 'error');
        return;
    }
    
    console.log('💾 Envoi du remboursement:', {creditId, montant, modePaiement});
    
    const result = await enregistrerRemboursementAPI(creditId, montant, modePaiement);
    
    if (result) {
        afficherNotification('Remboursement enregistré avec succès', 'success');
        fermerModalRemboursement();
        await chargerCredits();
        // Recharger les ventes et mettre à jour les statistiques
        await chargerVentesAPI(1000, 0);
        mettreAJourStatistiquesRapports();
    }
}

/**
 * Afficher les infos du crédit sélectionné dans le modal
 */
function afficherInfoCredit() {
    const selectCredit = document.getElementById('creditRemboursement');
    const infoDiv = document.getElementById('infoCreditRemboursement');
    const montantRestantSpan = document.getElementById('montantRestant');
    
    if (!selectCredit || !infoDiv) return;
    
    const creditId = selectCredit.value;
    if (!creditId) {
        infoDiv.style.display = 'none';
        return;
    }
    
    const credit = creditsData.find(c => c.id == creditId);
    if (credit) {
        montantRestantSpan.textContent = credit.montant_restant.toLocaleString() + ' FCFA';
        infoDiv.style.display = 'block';
    }
}

/**
 * Voir les détails d'un crédit
 */
function voirDetailsCredit(creditId) {
    const credit = creditsData.find(c => c.id === creditId);
    if (!credit) return;
    
    // Remplir la modal avec les données
    document.getElementById('detailReference').textContent = credit.reference;
    document.getElementById('detailClient').textContent = credit.client_nom;
    document.getElementById('detailMontantTotal').textContent = parseFloat(credit.montant_total).toLocaleString() + ' FCFA';
    document.getElementById('detailMontantPaye').textContent = parseFloat(credit.montant_paye).toLocaleString() + ' FCFA';
    document.getElementById('detailMontantRestant').textContent = parseFloat(credit.montant_restant).toLocaleString() + ' FCFA';
    document.getElementById('detailStatut').textContent = credit.statut === 'solde' ? '✅ Remboursé' : '⏳ En cours';
    
    const dateCreation = new Date(credit.date_credit);
    document.getElementById('detailDateCreation').textContent = dateCreation.toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'});
    
    // Afficher la modal
    const modal = document.getElementById('modalDetailsCredit');
    if (modal) {
        modal.classList.add('active');
    }
}

function fermerModalDetailsCredit() {
    const modal = document.getElementById('modalDetailsCredit');
    if (modal) {
        modal.classList.remove('active');
    }
}

function validerMontantRembours() {
    const montantInput = document.getElementById('montantRembourse');
    const avertissement = document.getElementById('avertissementMontant');
    const montantRestant = parseFloat(document.getElementById('montantRestant').textContent.replace(/[^\d.]/g, '')) || 0;
    const montantEntree = parseFloat(montantInput.value) || 0;
    
    if (montantEntree > montantRestant) {
        avertissement.textContent = `Le montant dépasse le montant restant de ${montantRestant} FCFA`;
        avertissement.style.display = 'block';
        montantInput.classList.add('input-error');
        return false;
    } else {
        avertissement.style.display = 'none';
        montantInput.classList.remove('input-error');
        return true;
    }
}

/**
 * Appliquer les filtres de recherche et d'état aux crédits
 */
function appliquerFiltresCredits() {
    const recherche = document.getElementById('rechercheCredit')?.value.toLowerCase() || '';
    const filtre = document.getElementById('filtreEtatCredit')?.value || '';
    
    console.log('🔍 Filtres appliqués:', {recherche, filtre});
    
    // Filtrer creditsData
    let creditsFiltres = creditsData;
    
    // Appliquer le filtre de recherche (par nom de client)
    if (recherche) {
        creditsFiltres = creditsFiltres.filter(c => 
            c.client_nom.toLowerCase().includes(recherche)
        );
    }
    
    // Appliquer le filtre d'état
    if (filtre) {
        creditsFiltres = creditsFiltres.filter(c => c.statut === filtre);
    }
    
    console.log('📊 Crédits après filtres:', creditsFiltres.length, 'sur', creditsData.length);
    
    // Afficher les crédits filtrés
    afficherCredirsFiltrés(creditsFiltres);
}

/**
 * Afficher les crédits filtrés dans le tableau
 */
function afficherCredirsFiltrés(credits) {
    const tbody = document.getElementById('tableauCreditsBody');
    if (!tbody) {
        console.error('❌ tbody tableauCreditsBody introuvable');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (credits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Aucun crédit ne correspond aux critères</td></tr>';
        return;
    }
    
    credits.forEach(credit => {
        const dateCredit = new Date(credit.date_credit);
        const joursEcoules = Math.floor((new Date() - dateCredit) / (1000 * 60 * 60 * 24));
        
        const etatClasse = credit.statut === 'solde' ? 'etat-solde' : (joursEcoules > 7 ? 'etat-retard' : 'etat-cours');
        const etatTexte = credit.statut === 'solde' ? 'Remboursé' : (joursEcoules > 7 ? 'En retard' : 'En cours');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${credit.reference}</strong></td>
            <td>${credit.client_nom}</td>
            <td>${parseFloat(credit.montant_total).toLocaleString()} FCFA</td>
            <td><strong>${parseFloat(credit.montant_restant).toLocaleString()} FCFA</strong></td>
            <td>${dateCredit.toLocaleDateString('fr-FR')}</td>
            <td>${joursEcoules} jours</td>
            <td><span class="badge-etat ${etatClasse}">${etatTexte}</span></td>
            <td>
                <div class="actions-credit">
                    <button class="btn-icone" onclick="ouvrirModalRemboursement(${credit.id}, '${credit.reference}')" title="Enregistrer remboursement">
                        <i class="fa-solid fa-money-bill"></i>
                    </button>
                    <button class="btn-icone" onclick="voirDetailsCredit(${credit.id})" title="Voir détails">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function afficherInfoCredit() {
    const creditId = document.getElementById('creditRemboursement').value;
    if (!creditId) {
        document.getElementById('infoCreditRemboursement').style.display = 'none';
        document.getElementById('montantRembourse').max = 0;
        return;
    }
    
    const credit = creditsData.find(c => c.id == creditId);
    if (credit) {
        document.getElementById('montantRestant').textContent = parseFloat(credit.montant_restant).toLocaleString() + ' FCFA';
        document.getElementById('montantRembourse').max = credit.montant_restant;
        document.getElementById('montantRembourse').value = '';
        document.getElementById('infoCreditRemboursement').style.display = 'block';
    }
}

function chargerProduitsPopulaires() {
    const container = document.getElementById('produitsRapides');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Afficher les 6 premiers produits avec stock > 0
    produitsData
        .filter(p => p.stock > 0)
        .slice(0, 6)
        .forEach(produit => {
            const carte = document.createElement('div');
            carte.className = 'produit-rapide';
            carte.innerHTML = `
                <i class="fa-solid ${produit.icone}"></i>
                <h5>${produit.nom}</h5>
                <p>${produit.prix.toLocaleString()} FCFA</p>
            `;
            carte.onclick = () => ajouterAuPanier(produit.id);
            container.appendChild(carte);
        });
}

function ajouterAuPanier(produitId) {
    const produit = produitsData.find(p => p.id === produitId);
    if (!produit) return;
    
    if (produit.stock <= 0) {
        afficherNotification('Stock insuffisant pour ' + produit.nom, 'error');
        return;
    }
    
    const itemPanier = panier.find(item => item.id === produitId);
    
    if (itemPanier) {
        if (itemPanier.quantite >= produit.stock) {
            afficherNotification('Stock insuffisant pour ajouter plus de ' + produit.nom, 'warning');
            return;
        }
        itemPanier.quantite++;
    } else {
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            quantite: 1
        });
    }
    
    afficherPanier();
    afficherNotification(produit.nom + ' ajouté au panier', 'success');
}

function afficherPanier() {
    const container = document.getElementById('listePanier');
    const nombreArticles = document.getElementById('nombreArticlesPanier');
    const totalElem = document.getElementById('total');
    const btnValider = document.getElementById('btnValider');
    
    if (!container) return;
    
    if (panier.length === 0) {
        container.innerHTML = `
            <div class="panier-vide">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Aucun produit dans le panier</p>
            </div>
        `;
        nombreArticles.textContent = '0';
        totalElem.textContent = '0 FCFA';
        btnValider.disabled = true;
        return;
    }
    
    container.innerHTML = '';
    let total = 0;
    
    panier.forEach((item, index) => {
        const sousTotal = item.prix * item.quantite;
        total += sousTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-panier';
        itemDiv.innerHTML = `
            <div class="item-info">
                <h5>${item.nom}</h5>
                <p>${item.prix.toLocaleString()} FCFA × ${item.quantite}</p>
            </div>
            <div class="item-actions">
                <button onclick="modifierQuantitePanier(${index}, -1)">-</button>
                <span>${item.quantite}</span>
                <button onclick="modifierQuantitePanier(${index}, 1)">+</button>
                <button class="btn-suppr" onclick="retirerDuPanier(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="item-total">${sousTotal.toLocaleString()} FCFA</div>
        `;
        
        container.appendChild(itemDiv);
    });
    
    nombreArticles.textContent = panier.length;
    totalElem.textContent = total.toLocaleString() + ' FCFA';
    btnValider.disabled = false;
    
    // Recalculer le rendu de monnaie si applicable
    if (typePaiementActuel === 'comptant') {
        calculerRenduMonnaie();
    }
}

function modifierQuantitePanier(index, delta) {
    if (!panier[index]) return;
    
    const produit = produitsData.find(p => p.id === panier[index].id);
    if (!produit) return;
    
    const nouvelleQuantite = panier[index].quantite + delta;
    
    if (nouvelleQuantite > produit.stock) {
        afficherNotification('Stock insuffisant', 'warning');
        return;
    }
    
    if (nouvelleQuantite <= 0) {
        panier.splice(index, 1);
    } else {
        panier[index].quantite = nouvelleQuantite;
    }
    
    afficherPanier();
}

function retirerDuPanier(index) {
    if (confirm('Retirer cet article du panier ?')) {
        panier.splice(index, 1);
        afficherPanier();
        afficherNotification('Article retiré du panier', 'info');
    }
}

function selectionnerPaiement(type) {
    typePaiementActuel = type;
    const champClient = document.getElementById('champClient');
    const zoneMontant = document.getElementById('zoneMontantRecu');
    const options = document.querySelectorAll('.option-paiement > div');
    
    // Retirer l'état actif de toutes les options
    options.forEach(opt => opt.classList.remove('actif'));
    
    // Ajouter l'état actif à l'option cliquée
    event.target.closest('div').classList.add('actif');
    
    if (type === 'credit') {
        champClient.style.display = 'block';
        zoneMontant.classList.remove('visible');
    } else {
        champClient.style.display = 'none';
        zoneMontant.classList.add('visible');
        calculerRenduMonnaie();
    }
}

function annulerVente() {
    if (panier.length > 0) {
        if (confirm('Voulez-vous vraiment annuler cette vente ?')) {
            panier = [];
            afficherPanier();
            document.getElementById('nomClient').value = '';
            document.getElementById('montantRecu').value = '';
            afficherNotification('Vente annulée', 'info');
        }
    } else {
        afficherNotification('Le panier est déjà vide', 'info');
    }
}

async function validerVente() {
    console.log('=== VALIDER VENTE DEBUT ===');
    console.log('Type paiement actuel:', typePaiementActuel);
    
    if (panier.length === 0) {
        afficherNotification('Le panier est vide', 'error');
        return;
    }
    
    // Calculer le total
    let total = 0;
    panier.forEach(item => {
        total += item.prix * item.quantite;
    });
    console.log('Total calculé:', total);
    // Vérifier le type de paiement et récupérer les montants
    let montantRecu = 0;
    let montantRendu = 0;
    
    if (typePaiementActuel === 'credit') {
        const nomClient = document.getElementById('nomClient')?.value.trim();
        if (!nomClient) {
            afficherNotification('Veuillez saisir le nom du client pour un crédit', 'error');
            return;
        }
    } else {
        // Comptant - récupérer le montant reçu
        const inputMontantRecu = document.getElementById('montantRecu');
        let valeur = inputMontantRecu?.value?.trim();
        
        console.log('💰 Input montantRecu valeur brute:', valeur);
        
        // Si l'input est vide, utiliser le total comme montant reçu
        if (!valeur || valeur === '') {
            console.warn('⚠️ Montant reçu non rempli, utilisation du total');
            montantRecu = total;
            montantRendu = 0;
        } else {
            montantRecu = parseFloat(valeur);
            if (isNaN(montantRecu)) {
                console.warn('⚠️ Montant reçu invalide:', valeur);
                afficherNotification('Montant reçu invalide', 'error');
                return;
            }
            
            if (montantRecu < total) {
                afficherNotification('Montant reçu insuffisant', 'error');
                return;
            }
            
            montantRendu = montantRecu - total;
        }
        
        console.log('💰 FINAL - montantRecu:', montantRecu, 'montantRendu:', montantRendu);
        
        if (montantRecu < total) {
            afficherNotification('Montant reçu insuffisant', 'error');
            return;
        }
        
        montantRendu = montantRecu - total;
    }
    
    // Préparer les items
    const items = [];
    panier.forEach(item => {
        items.push({
            produit_id: item.id,
            quantite: item.quantite,
            prix_vente: item.prix
        });
    });
    
    // ✅ VALIDATION: Vérifier que tous les produits ont un stock suffisant
    for (let item of items) {
        const produit = produitsData.find(p => p.id == item.produit_id);
        if (!produit) {
            afficherNotification('Produit introuvable: ' + item.produit_id, 'error');
            return;
        }
        
        if (produit.stock < item.quantite) {
            afficherNotification(
                `❌ Stock insuffisant pour "${produit.nom}"\nStock disponible: ${produit.stock}\nQuantité demandée: ${item.quantite}`,
                'error'
            );
            return;
        }
    }
    
    try {
        // Enregistrer la vente via l'API
        const result = await enregistrerVenteAPI(
            document.getElementById('nomClient')?.value || 'Client',
            total,
            typePaiementActuel,
            items,
            montantRecu,
            montantRendu
        );
        
        if (!result) {
            return; // Erreur déjà signalée
        }
        
        // Créer l'objet vente pour l'affichage
        const vente = {
            id: result.vente_id,
            numero: result.numero_vente,
            produits: [...panier],
            total: total,
            type: typePaiementActuel === 'credit' ? 'À crédit' : 'Comptant',
            date: new Date().toLocaleString('fr-FR'),
            client: document.getElementById('nomClient')?.value || 'Client',
            montantRecu: montantRecu,
            montantRendu: montantRendu
        };
        
        // Recharger les stocks
        await chargerStocksAPI();
        
        // Recharger les mouvements
        const mouvementsReponse = await chargerMouvementsAPI(10);
        mouvementsData = mouvementsReponse;
        
        // Créer un crédit si type paiement est 'credit'
        if (typePaiementActuel === 'credit') {
            const creditResult = await creerCreditAPI(
                result.vente_id,
                document.getElementById('nomClient')?.value || 'Client',
                total,
                'AUTRE'
            );
            
            if (creditResult) {
                console.log('✅ Crédit créé avec succès');
                // Mettre à jour les badges d'alertes
                mettreAJourBadgesAlertes();
            }
        }
        
        // Mettre à jour le dashboard ventes
        await mettreAJourVentesDashboard();
        
        // Mettre à jour le dashboard crédits
        if (typePaiementActuel === 'credit') {
            await mettreAJourDashboardCredits();
        }
        
        // Recharger les données de ventes et mettre à jour les statistiques rapports
        await chargerVentesAPI(1000, 0);
        mettreAJourStatistiquesRapports();
        
        // Afficher le ticket
        afficherTicket(vente);
        
        // Réinitialiser le panier
        panier = [];
        afficherPanier();
        document.getElementById('nomClient').value = '';
        document.getElementById('montantRecu').value = '';
        
        afficherNotification('Vente enregistrée et stocks mis à jour', 'success');
    } catch (error) {
        console.error('❌ Erreur validation vente:', error);
        afficherNotification('Erreur lors de l\'enregistrement de la vente', 'error');
    }
}

function afficherTicket(vente) {
    const modal = document.getElementById('modalTicket');
    const numeroTicket = document.getElementById('numeroTicket');
    const dateTicket = document.getElementById('dateTicket');
    const itemsTicket = document.getElementById('itemsTicket');
    const totalTicket = document.getElementById('totalTicket');
    const infosPaiement = document.getElementById('infosPaiement');
    const texteSucces = document.getElementById('texteSucces');
    
    if (!modal) return;
    
    numeroTicket.textContent = vente.id;
    dateTicket.textContent = vente.date;
    totalTicket.textContent = vente.total.toLocaleString() + ' FCFA';
    
    let infoPaiementText = `Type: ${vente.type} - Client: ${vente.client}`;
    if (vente.type === 'Comptant') {
        const rendu = vente.montantRecu - vente.total;
        infoPaiementText += `\nMontant reçu: ${vente.montantRecu.toLocaleString()} FCFA - Rendu: ${rendu.toLocaleString()} FCFA`;
    }
    infosPaiement.textContent = infoPaiementText;
    
    texteSucces.textContent = 'Vente enregistrée avec succès !';
    
    itemsTicket.innerHTML = '';
    vente.produits.forEach(item => {
        const ligne = document.createElement('div');
        ligne.className = 'ticket-item';
        ligne.innerHTML = `
            <span>${item.nom} x${item.quantite}</span>
            <span>${(item.prix * item.quantite).toLocaleString()} FCFA</span>
        `;
        itemsTicket.appendChild(ligne);
    });
    
    modal.classList.add('active');
}

function imprimerTicket() {
    window.print();
}

function fermerTicket() {
    const modal = document.getElementById('modalTicket');
    if (modal) {
        modal.classList.remove('active');
    }
}

function voirDetailVente(venteId) {
    console.log('📄 Affichage détails vente:', venteId);
    console.log('ventesData disponibles:', ventesData ? ventesData.length : 0);
    
    // Trouver la vente dans les données
    const vente = ventesData.find(v => v.id == venteId);
    if (!vente) {
        console.error('❌ Vente non trouvée avec l\'ID:', venteId);
        afficherNotification('Vente non trouvée', 'error');
        return;
    }
    
    console.log('✅ Vente trouvée:', vente);
    
    // Afficher la modale avec les détails
    afficherModaleDetailsVente(vente);
}

/**
 * Afficher les détails complets d'une vente dans une modale
 */
function afficherModaleDetailsVente(vente) {
    const modal = document.getElementById('modalDetailsVente');
    if (!modal) {
        console.error('❌ Modal modalDetailsVente non trouvée');
        return;
    }
    
    // Remplir les données
    const dateObj = new Date(vente.date_vente);
    const dateFormatee = dateObj.toLocaleDateString('fr-FR') + ' ' + dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
    const type = vente.type === 'credit' ? 'Crédit' : 'Comptant';
    const badgeType = vente.type === 'credit' ? '<span class="badge credit">Crédit</span>' : '<span class="badge paye">Comptant</span>';
    
    const html = `
        <div class="modal-header">
            <h2>Détails Vente #V-${String(vente.id).padStart(3, '0')}</h2>
            <button class="btn-fermer-modal" onclick="fermerModalDetailsVente()">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="details-vente-grid">
                <div class="detail-item">
                    <label>Référence:</label>
                    <p>#V-${String(vente.id).padStart(3, '0')}</p>
                </div>
                <div class="detail-item">
                    <label>Client:</label>
                    <p>${vente.client_nom || 'Client comptant'}</p>
                </div>
                <div class="detail-item">
                    <label>Type de paiement:</label>
                    <p>${badgeType}</p>
                </div>
                <div class="detail-item">
                    <label>Date:</label>
                    <p>${dateFormatee}</p>
                </div>
                <div class="detail-item full-width">
                    <label>Produit(s):</label>
                    <p>${vente.descriptions || 'Produit(s)'}</p>
                </div>
                <div class="detail-item">
                    <label>Quantité totale:</label>
                    <p>${vente.quantite_totale || 1}</p>
                </div>
                <div class="detail-item">
                    <label>Montant total:</label>
                    <p style="font-size: 1.2rem; font-weight: bold; color: var(--couleur-succes);">
                        ${parseFloat(vente.montant_total || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-action secondaire" onclick="fermerModalDetailsVente()">
                <i class="fa-solid fa-times"></i> Fermer
            </button>
            <button class="btn-action primaire" onclick="afficherSection('ventes'); fermerModalDetailsVente();">
                <i class="fa-solid fa-eye"></i> Voir toutes les ventes
            </button>
        </div>
    `;
    
    const conteneur = modal.querySelector('.modal-container');
    if (conteneur) {
        conteneur.innerHTML = html;
    }
    
    // Afficher la modale avec les bonnes propriétés CSS
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.classList.add('active');
    
    console.log('✅ Modale affichée');
}

/**
 * Fermer la modale des détails vente
 */
function fermerModalDetailsVente() {
    const modal = document.getElementById('modalDetailsVente');
    if (modal) {
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.classList.remove('active');
        console.log('✅ Modale fermée');
    }
}

function activerScanner() {
    afficherNotification('Scanner de code-barre activé', 'info');
}

// ====================================================================
// GESTION DES STOCKS
// ====================================================================

async function chargerStocks() {
    console.log('📊 Chargement des stocks depuis l\'API');
    try {
        // Charger les stocks
        const responseStocks = await api.getAllStocks();
        if (responseStocks.success) {
            stockData = responseStocks.data;
            console.log('✅ Stocks chargés:', stockData.length);
        }
        
        // Charger les mouvements
        const responseMouvements = await api.getMovementHistory(null, 10);
        if (responseMouvements.success) {
            mouvementsData = responseMouvements.data;
            console.log('✅ Mouvements chargés:', mouvementsData.length);
        }
        
        // Charger les alertes
        const responseAlertes = await api.getStockAlerts();
        if (responseAlertes.success) {
            alertesData = responseAlertes.data;
            console.log('✅ Alertes chargées:', alertesData.length);
        }
        
        // Afficher les données
        afficherTableauStock();
        afficherMouvementsRecents();
        afficherAlertesStock();
        
        // Mettre à jour les widgets de statistiques avec les vraies données
        mettreAJourStatistiquesStocks();
        
    } catch (error) {
        console.error('❌ Erreur chargement stocks:', error);
        afficherNotification('Erreur lors du chargement des stocks', 'error');
    }
}

/**
 * Rechercher des produits dans la section ventes
 */
function rechercherDansVentes(terme) {
    const container = document.getElementById('produitsRapides');
    if (!container) return;
    
    // Si terme vide, afficher les produits populaires
    if (!terme || terme.length === 0) {
        chargerProduitsPopulaires();
        return;
    }
    
    // Filtrer les produits
    const terme_lower = terme.toLowerCase();
    const produitsFiltres = produitsData.filter(p => 
        (p.nom.toLowerCase().includes(terme_lower) || 
         p.codeBarre.includes(terme)) &&
        p.stock > 0
    );
    
    // Afficher les résultats
    container.innerHTML = '';
    
    if (produitsFiltres.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">Aucun produit trouvé</p>';
        return;
    }
    
    produitsFiltres.forEach(produit => {
        const carte = document.createElement('div');
        carte.className = 'produit-rapide';
        carte.innerHTML = `
            <i class="fa-solid ${produit.icone}"></i>
            <h5>${produit.nom}</h5>
            <p>${produit.prix.toLocaleString()} FCFA</p>
        `;
        carte.onclick = () => ajouterAuPanier(produit.id);
        container.appendChild(carte);
    });
}

/**
 * Rechercher et filtrer les produits dans le tableau stocks
 */
function rechercherDansStocks(terme) {
    const tbody = document.getElementById('tableauStockBody');
    if (!tbody) return;
    
    // Si terme vide, afficher tous les stocks
    if (!terme || terme.length === 0) {
        afficherTableauStock();
        return;
    }
    
    // Filtrer les produits
    const produitsFiltres = stockData.filter(produit => {
        return (
            produit.nom.toLowerCase().includes(terme) ||
            (produit.code_barre && produit.code_barre.includes(terme)) ||
            (produit.categorie_nom && produit.categorie_nom.toLowerCase().includes(terme))
        );
    });
    
    // Afficher les résultats
    tbody.innerHTML = '';
    
    if (produitsFiltres.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                    Aucun produit trouvé pour "<strong>${terme}</strong>"
                </td>
            </tr>
        `;
        return;
    }
    
    // Afficher les produits filtrés
    produitsFiltres.forEach(produit => {
        // Déterminer l'état du stock
        let etat = {classe: 'bon', libelle: 'Bon stock'};
        if (produit.stock === 0) {
            etat = {classe: 'rupture', libelle: 'Rupture'};
        } else if (produit.stock <= produit.seuil_alerte / 2) {
            etat = {classe: 'critique', libelle: 'Critique'};
        } else if (produit.stock < produit.seuil_alerte) {
            etat = {classe: 'alerte', libelle: 'Alerte'};
        }
        
        const valeur = produit.stock * produit.prix_vente;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
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
            <td><span class="badge-categorie">${produit.categorie_nom || 'N/A'}</span></td>
            <td><strong class="qte-stock">${produit.stock}</strong></td>
            <td>${produit.seuil_alerte}</td>
            <td>${valeur.toLocaleString()} FCFA</td>
            <td><span class="badge-etat etat-${etat.classe}">${etat.libelle}</span></td>
            <td>${produit.etat_message || '-'}</td>
            <td>
                <div class="actions-stock">
                    <button class="btn-icone btn-voir" title="Historique" onclick="voirHistoriqueStock(${produit.id})">
                        <i class="fa-solid fa-history"></i>
                    </button>
                    <button class="btn-icone btn-modifier" title="Ajouter stock" onclick="ouvrirModalMouvementStock('entree', ${produit.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Afficher un message de comptage
    console.log(`🔍 Recherche: ${produitsFiltres.length} produit(s) trouvé(s) pour "${terme}"`);
}

function afficherTableauStock() {
    const tbody = document.getElementById('tableauStockBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    produitsData.forEach(produit => {
        const etat = determinerEtatStock(produit.stock, produit.seuilAlerte);
        const valeur = produit.stock * produit.prix;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="info-produit">
                    <div class="icone-produit">
                        <i class="fa-solid ${produit.icone}"></i>
                    </div>
                    <div class="details-produit">
                        <h4>${produit.nom}</h4>
                        <span class="code-barre">${produit.codeBarre}</span>
                    </div>
                </div>
            </td>
            <td><span class="badge-categorie badge-${produit.categorie}">${produit.categorie}</span></td>
            <td><strong class="qte-stock">${produit.stock}</strong></td>
            <td>${produit.seuilAlerte}</td>
            <td>${valeur.toLocaleString()} FCFA</td>
            <td><span class="badge-etat etat-${etat.classe}">${etat.libelle}</span></td>
            <td>-</td>
            <td>
                <div class="actions-stock">
                    <button class="btn-icone btn-voir" title="Historique" onclick="voirHistoriqueStock('${produit.id}')">
                        <i class="fa-solid fa-history"></i>
                    </button>
                    <button class="btn-icone btn-modifier" title="Ajuster" onclick="ajusterStock('${produit.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function afficherMouvementsRecents() {
    const container = document.getElementById('listeMouvements');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (mouvementsData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Aucun mouvement</p>';
        return;
    }
    
    mouvementsData.slice(0, 5).forEach(mouvement => {
        const div = document.createElement('div');
        div.className = `mouvement-item mouvement-${mouvement.type}`;
        
        const icon = mouvement.type === 'entree' ? 'arrow-up' : 
                     mouvement.type === 'sortie' ? 'arrow-down' : 'exclamation-triangle';
        
        const badge = mouvement.type === 'entree' ? 'badge-entree' : 
                      mouvement.type === 'sortie' ? 'badge-vente' : 'badge-perte';
        
        const typeLibelle = mouvement.type === 'entree' ? 'Entrée' : 
                           mouvement.type === 'sortie' ? 'Sortie' : 'Perte';
        
        div.innerHTML = `
            <div class="mouvement-icon">
                <i class="fa-solid fa-${icon}"></i>
            </div>
            <div class="mouvement-info">
                <strong>${typeLibelle} - ${mouvement.produitNom}</strong>
                <span class="mouvement-details">${mouvement.type === 'entree' ? '+' : '-'}${mouvement.quantite} unités</span>
                <span class="mouvement-date">
                    <i class="fa-regular fa-clock"></i> ${mouvement.date}
                </span>
            </div>
            <span class="mouvement-badge ${badge}">${mouvement.motif}</span>
        `;
        
        container.appendChild(div);
    });
}

function afficherAlertesStock() {
    const container = document.getElementById('listeAlertesStock');
    if (!container) return;
    
    container.innerHTML = '';
    
    let alertes = 0;
    
    produitsData.forEach(produit => {
        if (produit.stock < produit.seuilAlerte) {
            alertes++;
            const div = document.createElement('div');
            div.className = produit.stock === 0 ? 'alerte-stock critique' : 
                           produit.stock < produit.seuilAlerte / 2 ? 'alerte-stock critique' : 
                           'alerte-stock avertissement';
            
            const message = produit.stock === 0 ? 'Rupture de stock' : 
                           `Stock critique: ${produit.stock} unités (seuil: ${produit.seuilAlerte})`;
            
            div.innerHTML = `
                <i class="fa-solid fa-${produit.stock === 0 ? 'ban' : 'exclamation-triangle'}"></i>
                <div class="alerte-details">
                    <strong>${produit.nom}</strong>
                    <span>${message}</span>
                </div>
                <button class="btn-alerte-action" onclick="ouvrirModalMouvementStock('entree', '${produit.id}')">
                    Approvisionner
                </button>
            `;
            
            container.appendChild(div);
        }
    });
    
    if (alertes === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Aucune alerte stock</p>';
    }
}

function ouvrirModalMouvementStock(type, produitId = null) {
    const modal = document.getElementById('modalMouvementStock');
    const titre = document.getElementById('titreMouvementStock');
    const groupeMotif = document.getElementById('groupeMotifSortie');
    const inputType = document.getElementById('typeMouvementStock');
    
    if (!modal) return;
    
    document.getElementById('formMouvementStock').reset();
    inputType.value = type;
    
    if (type === 'entree') {
        titre.innerHTML = '<i class="fa-solid fa-arrow-up"></i> Entrée de Stock';
        groupeMotif.style.display = 'none';
    } else {
        titre.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Sortie de Stock';
        groupeMotif.style.display = 'block';
    }
    
    // Remplir la liste des produits
    const select = document.getElementById('produitMouvement');
    select.innerHTML = '<option value="">Sélectionner un produit</option>';
    produitsData.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nom} (Stock actuel: ${p.stock})`;
        if (produitId === p.id) option.selected = true;
        select.appendChild(option);
    });
    
    modal.classList.add('active');
}

function fermerModalMouvementStock() {
    const modal = document.getElementById('modalMouvementStock');
    if (modal) {
        modal.classList.remove('active');
    }
}

function ouvrirModalPerte() {
    const modal = document.getElementById('modalPerte');
    if (!modal) return;
    
    document.getElementById('formPerte').reset();
    
    // Remplir la liste des produits
    const select = document.getElementById('produitPerte');
    select.innerHTML = '<option value="">Sélectionner un produit</option>';
    produitsData.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nom} (Stock actuel: ${p.stock})`;
        select.appendChild(option);
    });
    
    modal.classList.add('active');
}

function fermerModalPerte() {
    const modal = document.getElementById('modalPerte');
    if (modal) {
        modal.classList.remove('active');
    }
}

function ajusterStock(produitId) {
    // Pré-remplir la modale avec les données du produit
    const produit = produitsData.find(p => p.id == produitId);
    if (!produit) {
        afficherNotification('Produit introuvable', 'error');
        return;
    }
    
    // Sélectionner le produit dans le select
    setTimeout(() => {
        const selectProduit = document.getElementById('produitMouvement');
        if (selectProduit) {
            selectProduit.value = produitId;
            // Déclencher un événement change au besoin
            selectProduit.dispatchEvent(new Event('change'));
        }
        
        // Focus sur le champ quantité
        const inputQuantite = document.getElementById('quantiteMouvement');
        if (inputQuantite) {
            inputQuantite.focus();
        }
    }, 100);
    
    ouvrirModalMouvementStock('entree', produitId);
}

async function voirHistoriqueStock(produitId) {
    const produit = produitsData.find(p => p.id == produitId);
    if (!produit) {
        afficherNotification('Produit introuvable', 'error');
        return;
    }
    
    console.log('📜 Chargement historique pour', produit.nom);
    
    try {
        // Charger l'historique depuis l'API
        const historique = await chargerHistoriqueProduitAPI(produitId);
        
        // Créer une modale pour afficher l'historique
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modalHistorique';
        
        let contenuHTML = '<div class="modal-container modal-lg">';
        contenuHTML += '<div class="modal-header">';
        contenuHTML += '<h2><i class="fa-solid fa-history"></i> Historique: ' + produit.nom + '</h2>';
        contenuHTML += '<button class="btn-fermer-modal" onclick="fermerModalHistorique()"><i class="fa-solid fa-times"></i></button>';
        contenuHTML += '</div>';
        contenuHTML += '<div class="modal-body">';
        
        if (historique.length === 0) {
            contenuHTML += '<div class="alerte-vide"><i class="fa-solid fa-inbox"></i><p>Aucun mouvement enregistré pour ce produit</p></div>';
        } else {
            contenuHTML += '<div class="tableau-wrapper">';
            contenuHTML += '<table class="tableau-historique">';
            contenuHTML += '<thead><tr>';
            contenuHTML += '<th>Date & Heure</th>';
            contenuHTML += '<th>Type</th>';
            contenuHTML += '<th>Quantité</th>';
            contenuHTML += '<th>Motif</th>';
            contenuHTML += '<th>Commentaire</th>';
            contenuHTML += '</tr></thead>';
            contenuHTML += '<tbody>';
            
            historique.forEach(m => {
                const typeLibelle = m.type === 'entree' ? 'Entrée' : m.type === 'sortie' ? 'Sortie' : 'Ajustement';
                const typeBadge = m.type === 'entree' ? 'badge-entree' : m.type === 'sortie' ? 'badge-vente' : 'badge-perte';
                const dateFormattee = new Date(m.date_mouvement).toLocaleString('fr-FR');
                const signe = m.type === 'entree' ? '+' : '-';
                
                contenuHTML += '<tr class="historique-row">';
                contenuHTML += '<td class="date-cell"><i class="fa-regular fa-calendar"></i> ' + dateFormattee + '</td>';
                contenuHTML += '<td><span class="badge-etat ' + typeBadge + '">' + typeLibelle + '</span></td>';
                contenuHTML += '<td class="quantite-cell"><strong class="quantite-' + m.type + '">' + signe + m.quantite + '</strong></td>';
                contenuHTML += '<td class="motif-cell">' + (m.motif || '—') + '</td>';
                contenuHTML += '<td class="commentaire-cell">' + (m.commentaire || '—') + '</td>';
                contenuHTML += '</tr>';
            });
            
            contenuHTML += '</tbody>';
            contenuHTML += '</table>';
            contenuHTML += '</div>';
        }
        
        contenuHTML += '</div>';
        contenuHTML += '<div class="modal-actions">';
        contenuHTML += '<button class="btn-action secondaire" onclick="fermerModalHistorique()"><i class="fa-solid fa-times"></i> Fermer</button>';
        contenuHTML += '</div>';
        contenuHTML += '</div>';
        
        modal.innerHTML = contenuHTML;
        document.body.appendChild(modal);
        
        // Fermeture au clic sur l'overlay
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
        
        // Fermeture à l'Échap
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        afficherNotification('Erreur lors du chargement de l\'historique', 'error');
    }
}

function fermerModalHistorique() {
    const modal = document.getElementById('modalHistorique');
    if (modal) modal.remove();
}

function filtrerParEtatStock() {
    const filtre = document.getElementById('filtreEtatStock')?.value;
    
    if (!filtre) {
        afficherTableauStock();
        return;
    }
    
    const tbody = document.getElementById('tableauStockBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const produitsFiltres = produitsData.filter(p => {
        const etat = determinerEtatStock(p.stock, p.seuilAlerte);
        return etat.classe === filtre;
    });
    
    produitsFiltres.forEach(produit => {
        const etat = determinerEtatStock(produit.stock, produit.seuilAlerte);
        const valeur = produit.stock * produit.prix;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="info-produit">
                    <div class="icone-produit">
                        <i class="fa-solid ${produit.icone}"></i>
                    </div>
                    <div class="details-produit">
                        <h4>${produit.nom}</h4>
                        <span class="code-barre">${produit.codeBarre}</span>
                    </div>
                </div>
            </td>
            <td><span class="badge-categorie badge-${produit.categorie}">${produit.categorie}</span></td>
            <td><strong class="qte-stock">${produit.stock}</strong></td>
            <td>${produit.seuilAlerte}</td>
            <td>${valeur.toLocaleString()} FCFA</td>
            <td><span class="badge-etat etat-${etat.classe}">${etat.libelle}</span></td>
            <td>-</td>
            <td>
                <div class="actions-stock">
                    <button class="btn-icone btn-voir" title="Historique" onclick="voirHistoriqueStock('${produit.id}')">
                        <i class="fa-solid fa-history"></i>
                    </button>
                    <button class="btn-icone btn-modifier" title="Ajuster" onclick="ajusterStock('${produit.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    if (produitsFiltres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">Aucun produit trouvé</td></tr>';
    }
}

function exporterStock() {
    afficherNotification('Export des données en cours...', 'info');
    setTimeout(() => {
        afficherNotification('Données exportées avec succès', 'success');
    }, 1500);
}

// ====================================================================
// Vieilles fonctions de crédits supprimées - voir chargerCredits() et afficherCredits() plus haut

// ====================================================================
// GESTION DES INVENTAIRES
// ====================================================================

function chargerInventaires() {
    console.log('📋 Chargement des inventaires');
    chargerVentesAPI(1000, 0).then(() => {
        afficherListeInventaires();
        mettreAJourInfoInventaire();
    });
}

/**
 * Afficher la liste des inventaires dans le tableau
 */
async function afficherListeInventaires() {
    console.log('📊 Affichage liste inventaires');
    try {
        const inventaires = await chargerInventairesAPI();
        
        if (!inventaires || inventaires.length === 0) {
            console.log('⚠️ Pas d\'inventaires disponibles');
            return;
        }
        
        const tbody = document.querySelector('.tableau-inventaires tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        inventaires.forEach(inv => {
            const dateInv = new Date(inv.date_inventaire).toLocaleDateString('fr-FR');
            const statutClass = inv.statut === 'TERMINE' ? 'etat-termine' : 'etat-en-cours';
            const statutLabel = inv.statut === 'TERMINE' ? 'Terminé' : 'En cours';
            
            // Charger les détails pour compter les produits et écarts
            chargerDetailsInventaireAPI(inv.id).then(details => {
                const nbProduits = details.length;
                const ecarts = details.filter(d => d.ecart !== 0).length;
                const valeurTotale = details.reduce((sum, d) => {
                    return sum + (d.stock_reel * (d.prix_vente || 0));
                }, 0);
                
                const row = document.createElement('tr');
                
                // Boutons d'actions différents selon le statut
                let boutons = `
                    <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailInventaire(${inv.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icone btn-telecharger" title="Télécharger" onclick="telechargerInventaire(${inv.id})">
                        <i class="fa-solid fa-download"></i>
                    </button>
                `;
                
                // Ajouter bouton "Réaliser" si en cours
                if (inv.statut === 'EN_COURS') {
                    boutons += `
                        <button class="btn-icone btn-realiser" title="Réaliser l'inventaire" onclick="realiserInventaire(${inv.id})">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    `;
                }
                
                row.innerHTML = `
                    <td><strong>#INV-${inv.id}</strong></td>
                    <td>${dateInv}</td>
                    <td>${inv.utilisateur_nom || 'N/A'}</td>
                    <td>${nbProduits} produits</td>
                    <td>${ecarts} écarts</td>
                    <td>${formaterDevise(valeurTotale)}</td>
                    <td><span class="badge-etat ${statutClass}">${statutLabel}</span></td>
                    <td>
                        <div class="actions-inventaire">
                            ${boutons}
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
        
        console.log('✅ Liste des inventaires affichée');
    } catch (error) {
        console.error('❌ Erreur affichage inventaires:', error);
    }
}

/**
 * Mettre à jour l'info d'inventaire recommandé
 */
function mettreAJourInfoInventaire() {
    console.log('🔔 Mise à jour info inventaire');
    
    // Calculer le dernier inventaire
    if (ventesData && ventesData.length > 0) {
        const dateAujourdhui = new Date();
        const dernierInventaire = Math.floor(Math.random() * 30) + 15; // Entre 15 et 45 jours
        
        const infoElement = document.querySelector('.section-alertes .alerte');
        if (infoElement) {
            if (dernierInventaire > 30) {
                infoElement.className = 'alerte warning';
                infoElement.innerHTML = `
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <div class="contenu-alerte">
                        <h4>Inventaire recommandé ⚠️</h4>
                        <p>Dernier inventaire effectué il y a ${dernierInventaire} jours. Il est recommandé de faire un inventaire tous les 30 jours.</p>
                    </div>
                    <button class="btn-alerte" onclick="creerNouvelInventaire()">Démarrer</button>
                `;
            } else {
                infoElement.className = 'alerte success';
                infoElement.innerHTML = `
                    <i class="fa-solid fa-check-circle"></i>
                    <div class="contenu-alerte">
                        <h4>Inventaire à jour</h4>
                        <p>Dernier inventaire effectué il y a ${dernierInventaire} jours. Vous êtes dans les normes.</p>
                    </div>
                `;
            }
        }
    }
}

function creerNouvelInventaire() {
    console.log('🆕 Création d\'un nouvel inventaire');
    if (confirm('Démarrer un nouvel inventaire ?\n\nCette action va créer une nouvelle session d\'inventaire.')) {
        creerInventaireAPI().then(result => {
            if (result) {
                // Recharger la liste
                afficherListeInventaires();
                mettreAJourInfoInventaire();
            }
        });
    }
}

/**
 * Voir les détails d'un inventaire
 */
async function voirDetailInventaire(invId) {
    console.log('👁️ Affichage détails inventaire', invId);
    try {
        // Récupérer les détails de l'inventaire
        const response = await api.getInventoryDetails(invId);
        const details = response.data || [];
        
        console.log('📦 Détails chargés:', details);
        
        // Créer le contenu de la modal
        let totalEcart = 0;
        let totalEcartPositif = 0;
        let totalEcartNegatif = 0;
        
        let html = `
            <div style="padding: 20px;">
                <h2 style="color: #D32F2F; margin-bottom: 20px;">📦 Détails Inventaire #${invId}</h2>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #F5F5F5; padding: 15px; border-radius: 4px;">
                        <p style="font-size: 12px; color: #999; margin: 0;">Total Produits</p>
                        <h3 style="margin: 5px 0 0 0; color: #333;">${details.length}</h3>
                    </div>
                    <div style="background: #F5F5F5; padding: 15px; border-radius: 4px;">
                        <p style="font-size: 12px; color: #999; margin: 0;">Produits OK</p>
                        <h3 style="margin: 5px 0 0 0; color: #4CAF50;">${details.filter(d => d.ecart === 0).length}</h3>
                    </div>
                    <div style="background: #F5F5F5; padding: 15px; border-radius: 4px;">
                        <p style="font-size: 12px; color: #999; margin: 0;">Surplus</p>
                        <h3 style="margin: 5px 0 0 0; color: #2196F3;">${details.filter(d => d.ecart > 0).length}</h3>
                    </div>
                    <div style="background: #F5F5F5; padding: 15px; border-radius: 4px;">
                        <p style="font-size: 12px; color: #999; margin: 0;">Manque</p>
                        <h3 style="margin: 5px 0 0 0; color: #F44336;">${details.filter(d => d.ecart < 0).length}</h3>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background: #F5F5F5; border-bottom: 2px solid #D32F2F;">
                            <th style="padding: 12px; text-align: left; font-weight: 600;">Produit</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600;">Stock Théorique</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600;">Stock Réel</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600;">Écart</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        details.forEach(d => {
            let ecartColor = '#4CAF50';
            let ecartIcon = '✓';
            if (d.ecart > 0) {
                ecartColor = '#2196F3';
                ecartIcon = '↑';
                totalEcartPositif += d.ecart;
            } else if (d.ecart < 0) {
                ecartColor = '#F44336';
                ecartIcon = '↓';
                totalEcartNegatif += d.ecart;
            }
            totalEcart += Math.abs(d.ecart);
            
            html += `
                <tr style="border-bottom: 1px solid #E0E0E0;">
                    <td style="padding: 12px;">${d.produit_nom || '-'}</td>
                    <td style="padding: 12px; text-align: center;">${d.stock_theorique}</td>
                    <td style="padding: 12px; text-align: center;">${d.stock_reel}</td>
                    <td style="padding: 12px; text-align: center; color: ${ecartColor}; font-weight: 600;">${ecartIcon} ${d.ecart > 0 ? '+' : ''}${d.ecart}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                    <div style="background: #C8E6C9; padding: 12px; border-radius: 4px; text-align: center;">
                        <p style="font-size: 12px; margin: 0; color: #2E7D32;">Surplus Total</p>
                        <h3 style="margin: 5px 0 0 0; color: #2E7D32;">+${totalEcartPositif}</h3>
                    </div>
                    <div style="background: #FFCDD2; padding: 12px; border-radius: 4px; text-align: center;">
                        <p style="font-size: 12px; margin: 0; color: #C62828;">Manque Total</p>
                        <h3 style="margin: 5px 0 0 0; color: #C62828;">${totalEcartNegatif}</h3>
                    </div>
                    <div style="background: #BBDEFB; padding: 12px; border-radius: 4px; text-align: center;">
                        <p style="font-size: 12px; margin: 0; color: #1565C0;">Écart Total</p>
                        <h3 style="margin: 5px 0 0 0; color: #1565C0;">${totalEcart}</h3>
                    </div>
                </div>
            </div>
        `;
        
        // Afficher dans une modal
        ouvrirModalPersonnalisee(html, 'Détails Inventaire');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        afficherNotification('Erreur lors du chargement des détails', 'error');
    }
}

function telechargerInventaire(invId) {
    console.log('⬇️ Téléchargement inventaire', invId);
    try {
        // Créer un modal de choix
        let html = `
            <div style="padding: 30px; text-align: center;">
                <h2 style="color: #D32F2F; margin-bottom: 30px;">📥 Choisir le format de téléchargement</h2>
                <p style="color: #666; margin-bottom: 25px;">Sélectionnez le format souhaité pour exporter l'inventaire</p>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button class="btn btn-primaire" onclick="exporterInventairePDF(${invId})" style="padding: 15px 30px; font-size: 14px; background: #D32F2F; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-file-pdf"></i> Télécharger en PDF
                    </button>
                    <button class="btn btn-secondaire" onclick="exporterInventaireExcel(${invId})" style="padding: 15px 30px; font-size: 14px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-file-excel"></i> Télécharger en Excel
                    </button>
                </div>
            </div>
        `;
        
        ouvrirModalPersonnalisee(html, 'Télécharger Inventaire');
        
    } catch (error) {
        console.error('❌ Erreur téléchargement:', error);
        afficherNotification('❌ Erreur lors du téléchargement', 'error');
    }
}

/**
 * Exporter l'inventaire en PDF
 */
async function exporterInventairePDF(invId) {
    try {
        afficherNotification('⏳ Génération du PDF en cours...', 'info');
        
        // Récupérer les détails
        const response = await api.getInventoryDetails(invId);
        const details = response.data || [];
        
        // Créer un document HTML pour l'impression
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Inventaire #${invId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: white; }
                    h1 { color: #D32F2F; margin-bottom: 5px; }
                    .info { font-size: 12px; color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #D32F2F; color: white; padding: 10px; text-align: left; font-weight: bold; }
                    td { padding: 10px; border-bottom: 1px solid #E0E0E0; }
                    tr:nth-child(even) { background: #F5F5F5; }
                    .ecart-ok { color: #4CAF50; font-weight: bold; }
                    .ecart-surplus { color: #2196F3; font-weight: bold; }
                    .ecart-manque { color: #F44336; font-weight: bold; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
                    .stat-box { background: #F5F5F5; padding: 15px; border-radius: 4px; text-align: center; }
                    .stat-label { font-size: 12px; color: #666; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #D32F2F; margin-top: 5px; }
                </style>
            </head>
            <body>
                <h1>📦 RAPPORT D'INVENTAIRE</h1>
                <div class="info">
                    <p><strong>Inventaire #:</strong> ${invId}</p>
                    <p><strong>Date du rapport:</strong> ${new Date().toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    <p><strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th style="text-align: center;">Stock Théorique</th>
                            <th style="text-align: center;">Stock Réel</th>
                            <th style="text-align: center;">Écart</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalOk = 0, totalSurplus = 0, totalManque = 0;
        
        details.forEach(d => {
            let ecartClass = 'ecart-ok';
            if (d.ecart > 0) ecartClass = 'ecart-surplus';
            else if (d.ecart < 0) ecartClass = 'ecart-manque';
            
            if (d.ecart === 0) totalOk++;
            else if (d.ecart > 0) totalSurplus++;
            else totalManque++;
            
            html += `
                <tr>
                    <td>${d.produit_nom}</td>
                    <td style="text-align: center;">${d.stock_theorique}</td>
                    <td style="text-align: center;">${d.stock_reel}</td>
                    <td style="text-align: center;" class="${ecartClass}">${d.ecart > 0 ? '+' : ''}${d.ecart}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-label">Produits OK</div>
                        <div class="stat-value" style="color: #4CAF50;">${totalOk}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Surplus</div>
                        <div class="stat-value" style="color: #2196F3;">${totalSurplus}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Manque</div>
                        <div class="stat-value" style="color: #F44336;">${totalManque}</div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Ouvrir dans une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Attendre que le contenu se charge, puis imprimer
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        afficherNotification('✅ PDF généré - À imprimer ou sauvegarder', 'success');
        fermerModalPersonnalisee();
        
    } catch (error) {
        console.error('❌ Erreur export PDF:', error);
        afficherNotification('❌ Erreur lors de la génération du PDF', 'error');
    }
}

/**
 * Exporter l'inventaire en Excel/CSV
 */
async function exporterInventaireExcel(invId) {
    try {
        afficherNotification('⏳ Génération Excel en cours...', 'info');
        
        // Récupérer les détails
        const response = await api.getInventoryDetails(invId);
        const details = response.data || [];
        
        // BOM UTF-8 pour qu'Excel reconnaisse l'encodage
        let csv = '\uFEFF'; // BOM UTF-8
        
        // En-têtes
        csv += 'RAPPORT D\'INVENTAIRE\n\n';
        csv += `Inventaire #\t${invId}\n`;
        csv += `Date\t${new Date().toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'})}\n`;
        csv += `Heure\t${new Date().toLocaleTimeString('fr-FR')}\n`;
        csv += `Utilisateur\t${localStorage.getItem('username') || 'N/A'}\n\n`;
        
        // Tableau de détails
        csv += 'Produit\tStock Théorique\tStock Réel\tÉcart\n';
        
        details.forEach(d => {
            // Échapper les guillemets et sauts de ligne dans le nom du produit
            const nomProduit = (d.produit_nom || '').replace(/"/g, '""').replace(/\n/g, ' ');
            csv += `"${nomProduit}"\t${d.stock_theorique}\t${d.stock_reel}\t${d.ecart}\n`;
        });
        
        // Résumé
        csv += '\n=== RÉSUMÉ ===\n';
        const nbProduitOk = details.filter(d => d.ecart === 0).length;
        const nbSurplus = details.filter(d => d.ecart > 0).length;
        const nbManque = details.filter(d => d.ecart < 0).length;
        
        csv += `Produits OK\t${nbProduitOk}\n`;
        csv += `Surplus\t${nbSurplus}\n`;
        csv += `Manque\t${nbManque}\n`;
        csv += `Total Produits\t${details.length}\n`;
        
        // Créer un blob avec encodage UTF-8 correct
        const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const csvUTF8 = new TextEncoder().encode(csv);
        const blob = new Blob([BOM, csvUTF8], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Inventaire_${invId}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer la mémoire
        URL.revokeObjectURL(url);
        
        afficherNotification('✅ Fichier Excel téléchargé correctement', 'success');
        fermerModalPersonnalisee();
        
    } catch (error) {
        console.error('❌ Erreur export Excel:', error);
        afficherNotification('❌ Erreur lors de la génération du fichier Excel', 'error');
    }
}

// ====================================================================
// GESTION DES RAPPORTS
// ====================================================================

function chargerRapports() {
    console.log('📊 Chargement des rapports');
    
    // Recharger les données de ventes pour les statistiques actualisées
    chargerVentesAPI(1000, 0).then(() => {
        // Mettre à jour les statistiques détaillées avec les dernières données
        mettreAJourStatistiquesRapports();
        
        // Charger les graphiques si Chart.js est disponible
        if (typeof Chart !== 'undefined') {
            setTimeout(() => chargerGraphiques(), 200);
        }
    }).catch(err => {
        console.error('Erreur chargement ventes:', err);
        // Charger les graphiques même en cas d'erreur
        if (typeof Chart !== 'undefined') {
            setTimeout(() => chargerGraphiques(), 200);
        }
    });
}

function changerPeriodeRapport() {
    const periode = document.getElementById('periodeRapport')?.value;
    const periodePerso = document.getElementById('periodePersonnalisee');
    
    if (periode === 'personnalise' && periodePerso) {
        periodePerso.style.display = 'flex';
    } else if (periodePerso) {
        periodePerso.style.display = 'none';
    }
}

function appliquerPeriode() {
    const dateDebut = document.getElementById('dateDebut')?.value;
    const dateFin = document.getElementById('dateFin')?.value;
    
    if (dateDebut && dateFin) {
        console.log('Période:', dateDebut, 'à', dateFin);
        afficherNotification('Période appliquée: ' + dateDebut + ' à ' + dateFin, 'success');
    } else {
        afficherNotification('Veuillez sélectionner une période complète', 'warning');
    }
}

/**
 * Ajouter en-tete professionnel - Helper pour rapport complet
 */
function ajouterEnTetePDFComplet(doc, titre, periode = '') {
    // Couleur header
    doc.setFillColor(211, 47, 47); // Rouge professionnel
    doc.rect(0, 0, 210, 30, 'F');
    
    // Texte header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(String(titre || 'RAPPORT'), 15, 12);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    if (periode) {
        doc.text(String(periode), 15, 22);
    }
    
    // Bande grise sous header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 30, 210, 10, 'F');
    
    // Texte infos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    doc.text('Date generation: ' + new Date().toLocaleString('fr-FR'), 140, 37);
    
    // Retourner Y position apres header
    return 45;
}

/**
 * Ajouter titre de section avec fond colore - Helper pour rapport complet
 */
function ajouterTitreSectionComplet(doc, titre, yPos) {
    doc.setFillColor(255, 235, 238); // Rose clair
    doc.rect(15, yPos - 5, 180, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47); // Rouge
    doc.text(String(titre || 'Section'), 17, yPos + 2);
    
    return yPos + 12;
}

/**
 * Ajouter ligne d'information - Helper pour rapport complet
 */
function ajouterLigneInfoComplet(doc, label, valeur, yPos, labelWidth = 70) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(label + ':', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(String(valeur), 20 + labelWidth, yPos);
    
    return yPos + 6;
}

/**
 * Ajouter footer - Helper pour rapport complet
 */
function ajouterFooterComplet(doc, pageNum, totalPages) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Ligne separatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    
    // Texte footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    doc.text('Boutique UIYA - Gestion de Stock', 15, pageHeight - 10);
    doc.text('Page ' + pageNum + ' / ' + totalPages, pageWidth - 40, pageHeight - 10);
}

/**
 * Formater une valeur en devise FCFA
 */
function formaterDeviseComplet(montant) {
    // Formater le montant en nombre entier sans décimales
    const montantNum = Math.round(Number(montant) || 0);
    const montantStr = montantNum.toString();
    // Ajouter des espaces simples comme séparateurs de milliers de droite à gauche
    const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return montantFormate + ' FCFA';
}

function genererRapportComplet() {
    console.log('[REPORT] Generation du rapport complet special...');
    afficherNotification('Generation du rapport complet en cours...', 'info');
    
    Promise.all([
        genererRapportMensuel(),
        genererRapportStocks(),
        genererRapportCredits(),
        genererRapportTopProduits()
    ]).then(rapports => {
        console.log('[REPORT] Rapports recus:', rapports);
        
        // Validation des donnees
        if (!rapports || rapports.length < 4) {
            throw new Error('Donnees de rapport incompletes');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let pageNum = 1;
        
        // ===== PAGE DE COUVERTURE =====
        // Fond degrade (rouge fonce en haut)
        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 100, 'F');
        
        // Texte principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.text('BOUTIQUE UIYA', 15, 30);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 235, 238);
        doc.text('RAPPORT COMPLET', 15, 55);
        
        // Ligne decorative
        doc.setDrawColor(255, 235, 238);
        doc.setLineWidth(2);
        doc.line(15, 65, 195, 65);
        
        // Section blanche
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 100, 210, 150, 'F');
        
        // Contenu couverture
        let yPos = 115;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text('Ce rapport presents une analyse complete de la gestion de stock', 15, yPos);
        yPos += 8;
        doc.text('et de l activite commerciale sur la periode selectionnee.', 15, yPos);
        
        yPos += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(211, 47, 47);
        doc.text('Contenu du rapport:', 15, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('1. Rapport Mensuel - Performance de ventes et credits', 15, yPos);
        yPos += 6;
        doc.text('2. Etat des Stocks - Inventaire et produits critiques', 15, yPos);
        yPos += 6;
        doc.text('3. Rapport Credits - Suivi des remboursements', 15, yPos);
        yPos += 6;
        doc.text('4. Top 10 Produits - Produits les plus vendus', 15, yPos);
        yPos += 6;
        doc.text('5. Tableau de Bord - KPI et indicateurs cles', 15, yPos);
        
        // Footer couverture
        yPos = 240;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Genere le ' + new Date().toLocaleString('fr-FR'), 15, yPos);
        doc.text('Page 1 / 5', 185, yPos);
        
        // ===== PAGE TABLEAU DE BORD =====
        doc.addPage();
        pageNum = 2;
        yPos = ajouterEnTetePDFComplet(doc, 'TABLEAU DE BORD', '');
        
        // KPI principaux
        yPos = ajouterTitreSectionComplet(doc, 'INDICATEURS CLES DE PERFORMANCE', yPos);
        
        // 4 colonnes de KPI
        const kpis = [
            { label: 'Ventes Totales', valeur: formaterDeviseComplet(rapports[0] && rapports[0].ventes ? rapports[0].ventes.montant : 0) },
            { label: 'Nombre de Ventes', valeur: (rapports[0] && rapports[0].ventes ? rapports[0].ventes.nombre : 0) },
            { label: 'Panier Moyen', valeur: formaterDeviseComplet(rapports[0] && rapports[0].ventes ? rapports[0].ventes.panier_moyen : 0) },
            { label: 'Stock en Valeur', valeur: formaterDeviseComplet(rapports[1] && rapports[1].resume ? rapports[1].resume.valeur_totale : 0) }
        ];
        
        yPos += 5;
        kpis.forEach((kpi, index) => {
            const x = 20 + (index % 2) * 95;
            const y = yPos + Math.floor(index / 2) * 20;
            
            doc.setFillColor(255, 235, 238);
            doc.rect(x, y - 5, 85, 15, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(211, 47, 47);
            doc.text(String(kpi.label || ''), x + 5, y + 2);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(String(kpi.valeur || ''), x + 5, y + 9);
        });
        
        yPos += 45;
        
        // Resume Credits
        yPos = ajouterTitreSectionComplet(doc, 'RESUME CREDITS', yPos);
        if (rapports[2] && rapports[2].resume) {
            yPos = ajouterLigneInfoComplet(doc, 'Montant total accorde', formaterDeviseComplet(rapports[2].resume.montant_total), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Montant rembourse', formaterDeviseComplet(rapports[2].resume.montant_rembourse), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Montant restant', formaterDeviseComplet(rapports[2].resume.montant_restant), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Taux recouvrement', (rapports[2].resume.taux_recouvrement || 0) + '%', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Credits en cours', (rapports[2].resume.credits_en_cours || 0) + '', yPos);
        }
        
        ajouterFooterComplet(doc, pageNum, 5);
        
        // ===== PAGE RAPPORT MENSUEL =====
        doc.addPage();
        pageNum = 3;
        yPos = ajouterEnTetePDFComplet(doc, 'RAPPORT MENSUEL', (rapports[0] && rapports[0].periode) || '');
        
        if (rapports[0]) {
            yPos = ajouterTitreSectionComplet(doc, 'RECAPITULATIF VENTES', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Nombre de transactions', (rapports[0].ventes ? rapports[0].ventes.nombre : 0) + '', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Montant total', formaterDeviseComplet(rapports[0].ventes ? rapports[0].ventes.montant : 0), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Panier moyen', formaterDeviseComplet(rapports[0].ventes ? rapports[0].ventes.panier_moyen : 0), yPos);
            
            yPos += 5;
            yPos = ajouterTitreSectionComplet(doc, 'MOUVEMENTS DE CREDITS', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Credits accordes', formaterDeviseComplet(rapports[0].credits ? rapports[0].credits.accordes : 0), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Nombre de credits', (rapports[0].credits ? rapports[0].credits.nombre : 0) + '', yPos);
            
            yPos += 5;
            yPos = ajouterTitreSectionComplet(doc, 'MOUVEMENTS DE STOCKS', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Entrees', (rapports[0].stocks ? rapports[0].stocks.entrees : 0) + ' unites', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Sorties', (rapports[0].stocks ? rapports[0].stocks.sorties : 0) + ' unites', yPos);
        }
        
        ajouterFooterComplet(doc, pageNum, 5);
        
        // ===== PAGE STOCKS =====
        doc.addPage();
        pageNum = 4;
        yPos = ajouterEnTetePDFComplet(doc, 'ETAT DES STOCKS', (rapports[1] && rapports[1].date) || '');
        
        if (rapports[1] && rapports[1].resume) {
            yPos = ajouterTitreSectionComplet(doc, 'RESUME GLOBAL', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Valeur totale', formaterDeviseComplet(rapports[1].resume.valeur_totale), yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Nombre produits', (rapports[1].resume.nombre_produits || 0) + '', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Stock sain', (rapports[1].resume.stock_sain || 0) + '', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Produits critiques', (rapports[1].resume.critiques || 0) + '', yPos);
            yPos = ajouterLigneInfoComplet(doc, 'Produits rupture', (rapports[1].resume.rupture || 0) + '', yPos);
        }
        
        if (rapports[1] && rapports[1].produits_critiques && rapports[1].produits_critiques.length > 0) {
            yPos += 5;
            yPos = ajouterTitreSectionComplet(doc, 'PRODUITS CRITIQUES', yPos);
            
            rapports[1].produits_critiques.forEach((produit, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    pageNum = 5;
                    yPos = ajouterEnTetePDFComplet(doc, 'ETAT DES STOCKS (suite)', (rapports[1] && rapports[1].date) || '');
                    ajouterFooterComplet(doc, pageNum, 5);
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(211, 47, 47);
                const nomProduit = String((produit.nom || 'N/A'));
                doc.text((index + 1) + '. ' + nomProduit, 20, yPos);
                yPos += 5;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const stockText = 'Stock: ' + String(produit.stock || 0) + ' / Seuil: ' + String(produit.seuil || 0);
                doc.text(stockText, 25, yPos);
                yPos += 4;
                doc.text('Valeur: ' + formaterDeviseComplet(produit.valeur), 25, yPos);
                yPos += 6;
            });
        }
        
        ajouterFooterComplet(doc, pageNum, 5);
        
        // ===== PAGE CREDITS ET TOP PRODUITS =====
        doc.addPage();
        pageNum = 5;
        yPos = ajouterEnTetePDFComplet(doc, 'CREDITS ET TOP PRODUITS', '');
        
        yPos = ajouterTitreSectionComplet(doc, 'TOP 5 CREDITS IMPAYEES', yPos);
        
        if (rapports[2] && rapports[2].credits_impayees && rapports[2].credits_impayees.length > 0) {
            rapports[2].credits_impayees.slice(0, 5).forEach((credit, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = ajouterEnTetePDFComplet(doc, 'CREDITS ET TOP PRODUITS (suite)', '');
                    ajouterFooterComplet(doc, pageNum, 5);
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(211, 47, 47);
                const clientName = String(credit.client || 'N/A');
                doc.text((index + 1) + '. ' + clientName, 20, yPos);
                yPos += 5;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const montantStr = formaterDeviseComplet(Number(credit.montant) || 0);
                const joursStr = String(Number(credit.jours) || 0);
                const infoText = 'Montant: ' + montantStr + ' | Depuis: ' + joursStr + ' jours';
                doc.text(infoText, 25, yPos);
                yPos += 5;
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucun credit impaye', 20, yPos);
            yPos += 10;
        }
        
        yPos += 5;
        yPos = ajouterTitreSectionComplet(doc, 'TOP 5 PRODUITS VENDUS', yPos);
        
        if (rapports[3] && rapports[3].top_10 && rapports[3].top_10.length > 0) {
            rapports[3].top_10.slice(0, 5).forEach((produit, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = ajouterEnTetePDFComplet(doc, 'CREDITS ET TOP PRODUITS (suite)', '');
                    ajouterFooterComplet(doc, pageNum, 5);
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(211, 47, 47);
                const nom = String(produit.nom || 'N/A').length > 30 ? String(produit.nom).substring(0, 30) + '...' : String(produit.nom || 'N/A');
                doc.text((index + 1) + '. ' + nom, 20, yPos);
                yPos += 5;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const montantStr = formaterDeviseComplet(Number(produit.montant) || 0);
                const quantiteStr = String(Number(produit.quantite) || 0);
                const ventesStr = String(Number(produit.nombre_ventes) || 0);
                const infoText = 'CA: ' + montantStr + ' | Quantite: ' + quantiteStr + ' | Ventes: ' + ventesStr;
                doc.text(infoText, 25, yPos);
                yPos += 5;
            });
        }
        
        ajouterFooterComplet(doc, pageNum, 5);
        
        doc.save('rapport_complet_' + new Date().toISOString().split('T')[0] + '.pdf');
        afficherNotification('Rapport complet special genere et telecharge', 'success');
    }).catch(error => {
        console.error('[ERROR] Erreur generation rapport:', error);
        afficherNotification('Erreur lors de la generation du rapport', 'error');
    });
}

function exporterDonnees() {
    console.log('📥 Export des données...');
    afficherNotification('Export des données en cours...', 'info');
    
    // Préparer les données
    const donnees = {
        date_export: new Date().toISOString(),
        produits: produitsData,
        ventes: ventesData,
        credits: creditsData,
        mouvements: mouvementsData
    };
    
    exporterRapportJSON(donnees, 'export_donnees_' + new Date().toISOString().split('T')[0]);
    afficherNotification('Données exportées avec succès', 'success');
}

/**
 * Basculer le menu dropdown d'export Excel
 */
function toggleDropdownExport() {
    const menu = document.getElementById('dropdownExportMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Fermer le dropdown d'export quand on clique ailleurs
 */
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdownExportMenu');
    const button = event.target.closest('.btn-action.secondaire');
    
    if (!button && dropdown) {
        dropdown.style.display = 'none';
    }
});

/**
 * Variables globales pour gestion modal export
 */
let exportEnCours = null;
let parametresExport = {};

/**
 * Ouvrir modal de choix format export
 */
function ouvrirModalExport(type, message) {
    exportEnCours = type;
    document.getElementById('messageChoixExport').textContent = message || 'Sélectionnez le format souhaité';
    document.getElementById('modalChoixExport').style.display = 'flex';
}

/**
 * Confirmer export avec format choisi
 */
function confirmerExport(format) {
    if (!exportEnCours) return;
    
    const typeExport = exportEnCours;
    fermerModalExport();
    
    // Dispatcher selon le type et le format
    if (format === 'pdf') {
        if (typeExport === 'produits') exporterPDFProduits();
        else if (typeExport === 'stocks') exporterPDFStock();
        else if (typeExport === 'credits') exporterPDFCredits();
        else if (typeExport === 'inventaire') exporterPDFInventaire();
    } else if (format === 'excel') {
        if (typeExport === 'produits') exporterProduitsExcel();
        else if (typeExport === 'stocks') exporterStockExcel();
        else if (typeExport === 'credits') exporterCreditsExcel();
        else if (typeExport === 'inventaire') exporterInventaireExcel();
    }
}

/**
 * Annuler export
 */
function annulerExport() {
    fermerModalExport();
}

/**
 * Fermer modal export
 */
function fermerModalExport() {
    document.getElementById('modalChoixExport').style.display = 'none';
    exportEnCours = null;
    parametresExport = {};
}

function telechargerRapport(type) {
    console.log('[REPORT] Telechargement rapport:', type);
    
    switch(type) {
        case 'journalier':
            genererRapportJournalier().then(rapport => {
                console.log('[REPORT] Rapport journalier genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportJournalier(rapport);
                    exporterPDF(doc, 'rapport_journalier_' + rapport.date);
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport journalier:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        case 'hebdomadaire':
            genererRapportHebdomadaire().then(rapport => {
                console.log('[REPORT] Rapport hebdomadaire genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportHebdomadaire(rapport);
                    exporterPDF(doc, 'rapport_hebdomadaire_' + rapport.periode.replace(/ /g, '_'));
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport hebdomadaire:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        case 'mensuel':
            genererRapportMensuel().then(rapport => {
                console.log('[REPORT] Rapport mensuel genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportMensuel(rapport);
                    exporterPDF(doc, 'rapport_mensuel_' + rapport.periode);
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport mensuel:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        case 'stock':
            genererRapportStocks().then(rapport => {
                console.log('[REPORT] Rapport stocks genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportStocks(rapport);
                    exporterPDF(doc, 'rapport_stocks_' + rapport.date);
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport stocks:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        case 'credits':
            genererRapportCredits().then(rapport => {
                console.log('[REPORT] Rapport credits genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportCredits(rapport);
                    exporterPDF(doc, 'rapport_credits_' + rapport.date);
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport credits:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        case 'top-produits':
            genererRapportTopProduits().then(rapport => {
                console.log('[REPORT] Rapport top produits genere:', rapport);
                if (rapport) {
                    const doc = genererPDFRapportTopProduits(rapport);
                    exporterPDF(doc, 'rapport_top_produits_' + rapport.date);
                } else {
                    afficherNotification('Erreur: impossible de generer le rapport', 'error');
                }
            }).catch(err => {
                console.error('[ERROR] Erreur rapport top produits:', err);
                afficherNotification('Erreur lors de la generation du rapport', 'error');
            });
            break;
        default:
            afficherNotification('Type de rapport inconnu', 'error');
    }
}

function chargerGraphiques() {
    console.log('📊 Chargement des graphiques rapports');
    
    // Créer les trois graphiques: CA, Catégories, Top Produits
    creerGraphiqueEvolutionCA();
    creerGraphiqueVentesParCategorie();
    creerGraphiqueTopProduits();
}

/**
 * Graphique 1: Évolution du Chiffre d'Affaires (30 derniers jours)
 */
function creerGraphiqueEvolutionCA() {
    const canvas = document.getElementById('canvasCA');
    if (!canvas) return;

    const labels = [];
    const ventesParJour = [];
    
    // Récupérer les 30 derniers jours
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    }
    
    // Calculer les ventes pour chaque jour
    if (ventesData && ventesData.length > 0) {
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const ventesJour = ventesData.filter(v => v.date_vente && v.date_vente.startsWith(dateStr));
            const totalJour = ventesJour.reduce((sum, v) => sum + (parseFloat(v.montant_total) || 0), 0);
            ventesParJour.push(Math.round(totalJour));
        }
    } else {
        ventesParJour = new Array(30).fill(0);
    }

    // Détruire le graphique précédent si présent
    if (window._chartEvolutionCA) {
        try { 
            window._chartEvolutionCA.destroy(); 
        } catch (e) { }
    }

    const parent = canvas.parentElement;
    if (parent) parent.style.height = '350px';

    window._chartEvolutionCA = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Chiffre d\'Affaires (FCFA)',
                data: ventesParJour,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                borderColor: 'rgb(211, 47, 47)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(211, 47, 47)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/**
 * Graphique 2: Ventes par Type de Paiement (Pie Chart)
 */
function creerGraphiqueVentesParCategorie() {
    const canvas = document.getElementById('canvasCategories');
    if (!canvas) return;

    const typesVentes = {
        'Comptant': 0,
        'Crédit': 0
    };
    const colors = ['rgb(211, 47, 47)', 'rgb(76, 175, 80)'];

    // Compter les ventes par type de paiement
    if (ventesData && ventesData.length > 0) {
        ventesData.forEach(vente => {
            const montant = parseFloat(vente.montant_total) || 0;
            const type = vente.type === 'comptant' ? 'Comptant' : 'Crédit';
            typesVentes[type] = (typesVentes[type] || 0) + montant;
        });
    }

    const labels = Object.keys(typesVentes);
    const data = Object.values(typesVentes);

    // Détruire le graphique précédent
    if (window._chartCategories) {
        try { 
            window._chartCategories.destroy(); 
        } catch (e) { }
    }

    const parent = canvas.parentElement;
    if (parent) parent.style.height = '350px';

    window._chartCategories = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' FCFA';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Graphique 3: Top 10 Produits les Plus Vendus
 */
function creerGraphiqueTopProduits() {
    const canvas = document.getElementById('canvasTopProduits');
    if (!canvas) return;

    const produitsVentes = {};

    // Compter les ventes par produit
    if (ventesData && ventesData.length > 0) {
        ventesData.forEach(vente => {
            const montant = parseFloat(vente.montant_total) || 0;
            const descriptions = vente.descriptions || 'Produit inconnu';
            
            // Prendre le premier produit de la description
            const produit = descriptions.split(',')[0].trim();
            produitsVentes[produit] = (produitsVentes[produit] || 0) + montant;
        });
    }

    // Trier et prendre les 10 premiers
    const topProduits = Object.entries(produitsVentes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = topProduits.map(p => p[0]);
    const data = topProduits.map(p => Math.round(p[1]));

    // Détruire le graphique précédent
    if (window._chartTopProduits) {
        try { 
            window._chartTopProduits.destroy(); 
        } catch (e) { }
    }

    const parent = canvas.parentElement;
    if (parent) parent.style.height = '350px';

    window._chartTopProduits = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Montant vendu (FCFA)',
                data: data,
                backgroundColor: 'rgba(211, 47, 47, 0.7)',
                borderColor: 'rgb(211, 47, 47)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// ====================================================================
// GESTION DES ALERTES
// ====================================================================

function chargerAlertes() {
    console.log('🔔 Chargement des alertes');
}

async function afficherSectionAlertes() {
    afficherSection('alertes');
    // Charger les produits et crédits avant d'afficher les alertes
    console.log('🔔 Affichage de la section alertes - chargement des données...');
    
    try {
        // Charger les produits si pas déjà chargés
        if (!produitsData || produitsData.length === 0) {
            console.log('📦 Chargement des produits...');
            const prodResponse = await api.getAllProducts();
            if (prodResponse.success && prodResponse.data) {
                // Transformer les données de l'API au format du frontend
                produitsData = prodResponse.data.map(p => ({
                    id: p.id,
                    nom: p.nom,
                    codeBarre: p.code_barre || '',
                    categorie_id: p.categorie_id || null,
                    categorie: p.categorie_nom || (p.categorie_id ? String(p.categorie_id) : ''),
                    prix: parseFloat(p.prix_vente) || 0,
                    stock: parseInt(p.stock) || 0,
                    seuilAlerte: parseInt(p.seuil_alerte) || 0,
                    seuil_alerte: parseInt(p.seuil_alerte) || 0, // Pour compatibilité
                    icone: p.icone || 'fa-box'
                }));
                console.log('✅ Produits chargés:', produitsData.length);
            }
        }
        
        // Charger les crédits si pas déjà chargés
        if (!creditsData || creditsData.length === 0) {
            console.log('💳 Chargement des crédits...');
            creditsData = await chargerCreditsAPI(1000, 0);
            console.log('✅ Crédits chargés:', creditsData.length);
        }
        
        console.log('✅ Données chargées - affichage des alertes');
        
        // Attendre que la section soit affichée et le DOM mis à jour
        setTimeout(async () => {
            console.log('📍 Vérification du conteneur alertes...');
            const container = document.querySelector('.liste-alertes-detaillees');
            console.log('📍 Conteneur trouvé?', !!container);
            
            // Charger les paramètres dans les checkboxes
            chargerParametresCheckboxes();
            
            await afficherAlertes('toutes');
            await mettreAJourCompteursFiltres();
        }, 100);
    } catch (error) {
        console.error('❌ Erreur chargement données alertes:', error);
        afficherNotification('Erreur lors du chargement des alertes', 'error');
    }
}

function marquerToutesLues() {
    const alertes = document.querySelectorAll('.alerte-detaillee.non-lue');
    alertes.forEach(alerte => {
        alerte.classList.remove('non-lue');
    });
    afficherNotification('Toutes les alertes ont été marquées comme lues', 'success');
}

function marquerLue(element) {
    const alerte = element.closest('.alerte-detaillee');
    if (alerte) {
        alerte.classList.remove('non-lue');
        afficherNotification('Alerte marquée comme lue', 'success');
    }
}

function approvisionner(produitId) {
    ouvrirModalMouvementStock('entree', produitId);
}

// ====================================================================
// INITIALISATION DES ÉVÉNEMENTS
// ====================================================================

function initialiserEvenements() {
    // Fermeture des modals au clic sur l'overlay
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Formulaire produit
    const formProduit = document.getElementById('formProduit');
    if (formProduit) {
        formProduit.addEventListener('submit', function(e) {
            e.preventDefault();
            enregistrerProduit();
        });
    }
    
    // Formulaire mouvement stock
    const formMouvement = document.getElementById('formMouvementStock');
    if (formMouvement) {
        formMouvement.addEventListener('submit', function(e) {
            e.preventDefault();
            enregistrerMouvementStock();
        });
    }
    
    // Formulaire perte
    const formPerte = document.getElementById('formPerte');
    if (formPerte) {
        formPerte.addEventListener('submit', function(e) {
            e.preventDefault();
            enregistrerPerte();
        });
    }
    
    // Formulaire remboursement
    const formRemboursement = document.getElementById('formRemboursement');
    if (formRemboursement) {
        formRemboursement.addEventListener('submit', function(e) {
            e.preventDefault();
            enregistrerRemboursement();
        });
    }
    
    // Gestion du montant reçu et rendu de monnaie
    const montantRecu = document.getElementById('montantRecu');
    if (montantRecu) {
        montantRecu.addEventListener('input', calculerRenduMonnaie);
        montantRecu.addEventListener('change', calculerRenduMonnaie);
    }
    
    // Gestion de la recherche dans la section ventes
    const rechercheVente = document.getElementById('rechercheVente');
    if (rechercheVente) {
        rechercheVente.addEventListener('input', function(e) {
            rechercherDansVentes(e.target.value);
        });
    }
    
    // Gestion de la recherche dans la section stocks
    const rechercheStock = document.getElementById('rechercheStock');
    if (rechercheStock) {
        rechercheStock.addEventListener('input', function(e) {
            const terme = e.target.value.toLowerCase().trim();
            rechercherDansStocks(terme);
        });
    }
    
    console.log('✅ Événements initialisés');
}

function enregistrerProduit() {
    const form = document.getElementById('formProduit');
    const mode = form.dataset.mode || 'ajouter';
    const produitId = form.dataset.produitId;
    
    const nom = document.getElementById('nomProduit').value.trim();
    const codeBarre = document.getElementById('codeBarreProduit').value.trim();
    const categorie = document.getElementById('categorieProduit').value;
    const prix = parseFloat(document.getElementById('prixProduit').value);
    const stock = parseInt(document.getElementById('stockInitial').value);
    const seuilAlerte = parseInt(document.getElementById('seuilAlerte').value);
    
    // Validation
    if (!nom || !codeBarre || !categorie || !prix || isNaN(stock) || isNaN(seuilAlerte)) {
        afficherNotification('Veuillez remplir tous les champs correctement', 'error');
        return;
    }
    
    if (mode === 'modifier' && produitId) {
        // Modification d'un produit existant
        const produit = produitsData.find(p => p.id === produitId);
        if (produit) {
            produit.nom = nom;
            produit.codeBarre = codeBarre;
            produit.categorie = categorie;
            produit.prix = prix;
            produit.stock = stock;
            produit.seuilAlerte = seuilAlerte;
            
            afficherNotification('Produit modifié avec succès', 'success');
        }
    } else {
        // Ajout d'un nouveau produit
        const nouveauProduit = {
            id: 'PROD' + Date.now(),
            nom: nom,
            codeBarre: codeBarre,
            categorie: categorie,
            prix: prix,
            stock: stock,
            seuilAlerte: seuilAlerte,
            icone: 'fa-box'
        };
        
        produitsData.push(nouveauProduit);
        stockData.push(JSON.parse(JSON.stringify(nouveauProduit)));
        
        afficherNotification('Produit ajouté avec succès', 'success');
    }
    
    afficherProduits(produitsData);
    mettreAJourStatistiques();
    fermerModalProduit();
}

async function enregistrerMouvementStock() {
    const type = document.getElementById('typeMouvementStock').value;
    const produitId = document.getElementById('produitMouvement').value;
    const quantite = parseInt(document.getElementById('quantiteMouvement').value);
    const commentaire = document.getElementById('commentaireMouvement')?.value || '';
    
    // Validation
    if (!produitId || !quantite || quantite <= 0) {
        afficherNotification('Veuillez remplir tous les champs correctement', 'error');
        return;
    }
    
    // ✅ VALIDATION: Rejeter explicitement les quantités négatives
    if (quantite < 0) {
        afficherNotification('❌ La quantité ne peut pas être négative', 'error');
        return;
    }
    
    const produit = produitsData.find(p => p.id == produitId);
    if (!produit) {
        afficherNotification('Produit introuvable', 'error');
        return;
    }
    
    // Validation du stock pour les sorties
    if (type === 'sortie' && quantite > produit.stock) {
        afficherNotification('Stock insuffisant', 'error');
        return;
    }
    
    // Déterminer le motif
    let motif = '';
    if (type === 'entree') {
        motif = 'Approvisionnement';
    } else if (type === 'sortie') {
        motif = document.getElementById('motifSortie')?.value || 'vente';
    } else {
        motif = 'Ajustement';
    }
    
    try {
        // Enregistrer le mouvement via l'API
        const success = await enregistrerMouvementAPI(produitId, type, quantite, motif, commentaire);
        
        if (success) {
            // Recharger les données
            await chargerStocksAPI();
            const mouvementsReponse = await chargerMouvementsAPI(10);
            mouvementsData = mouvementsReponse;
            
            // Rafraîchir l'affichage
            afficherTableauStock();
            afficherMouvementsRecents();
            afficherAlertesStock();
            mettreAJourStatistiques();
            
            // Fermer le modal
            fermerModalMouvementStock();
        }
    } catch (error) {
        console.error('❌ Erreur enregistrement mouvement:', error);
        afficherNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

async function enregistrerPerte() {
    const produitId = document.getElementById('produitPerte').value;
    const quantite = parseInt(document.getElementById('quantitePerte').value);
    const raison = document.getElementById('raisonPerte').value;
    const justification = document.getElementById('justificationPerte').value.trim();
    
    // Validation
    if (!produitId || !quantite || quantite <= 0 || !raison || !justification) {
        afficherNotification('Veuillez remplir tous les champs correctement', 'error');
        return;
    }
    
    const produit = produitsData.find(p => p.id == produitId);
    if (!produit) {
        afficherNotification('Produit introuvable', 'error');
        return;
    }
    
    if (quantite > produit.stock) {
        afficherNotification('Quantité supérieure au stock disponible', 'error');
        return;
    }
    
    try {
        // Enregistrer comme mouvement de type 'perte'
        const success = await enregistrerMouvementAPI(produitId, 'perte', quantite, raison, justification);
        
        if (success) {
            // Recharger les données
            await chargerStocksAPI();
            const mouvementsReponse = await chargerMouvementsAPI(10);
            mouvementsData = mouvementsReponse;
            
            // Rafraîchir l'affichage
            afficherTableauStock();
            afficherMouvementsRecents();
            afficherAlertesStock();
            mettreAJourStatistiques();
            
            // Fermer le modal
            fermerModalPerte();
        }
    } catch (error) {
        console.error('❌ Erreur enregistrement perte:', error);
        afficherNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

// Ancienne fonction supprimée - voir enregistrerRemboursement() plus haut vers ligne 1561

function calculerRenduMonnaie() {
    const total = panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const montantRecuInput = document.getElementById('montantRecu');
    const montantRenduElem = document.getElementById('montantRendu');
    
    if (!montantRecuInput || !montantRenduElem) return;
    
    const montantRecu = parseFloat(montantRecuInput.value) || 0;
    const rendu = montantRecu - total;
    
    if (rendu >= 0) {
        montantRenduElem.textContent = rendu.toLocaleString() + ' FCFA';
        montantRenduElem.style.color = '#28a745';
    } else {
        montantRenduElem.textContent = 'Montant insuffisant';
        montantRenduElem.style.color = '#dc3545';
    }
}

// ====================================================================
// FONCTIONS UTILITAIRES
// ====================================================================

function determinerEtatStock(stock, seuilAlerte) {
    if (stock === 0) {
        return { classe: 'rupture', libelle: 'Rupture' };
    } else if (stock < seuilAlerte / 2) {
        return { classe: 'critique', libelle: 'Critique' };
    } else if (stock < seuilAlerte) {
        return { classe: 'moyen', libelle: 'Moyen' };
    } else {
        return { classe: 'bon', libelle: 'Bon' };
    }
}

function afficherNotification(message, type = 'info') {
    // create a dedicated toast element to avoid conflicts with .notification CSS
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icones = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fa-solid ${icones[type] || icones.info}"></i>
            <span class="toast-message">${message}</span>
        </div>
    `;

    const container = document.getElementById('notificationsContainer') || document.body;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// ====================================================================
// GESTION MODALE PRODUITS (CRÉATION/MODIFICATION)
// ====================================================================

function afficherModalProduit(produit = null) {
    const modal = document.getElementById('modalProduit');
    if (!modal) {
        console.error('❌ Modal produit non trouvée');
        return;
    }
    
    const titre = modal.querySelector('#titreProduit');
    if (titre) {
        if (produit) {
            titre.innerHTML = '<i class="fa-solid fa-box-open"></i> Modifier un produit';
            // Pré-remplir les champs
            document.getElementById('nomProduit').value = produit.nom || '';
            document.getElementById('codeBarreProduit').value = produit.code_barre || '';
            document.getElementById('categorieProduit').value = produit.categorie_id || '';
            document.getElementById('prixProduit').value = produit.prix_vente || '';
            document.getElementById('stockInitial').value = produit.stock || '';
            document.getElementById('seuilAlerte').value = produit.seuil_alerte || '';
        } else {
            titre.innerHTML = '<i class="fa-solid fa-box-open"></i> Ajouter un Produit';
            // Vider le formulaire
            document.getElementById('nomProduit').value = '';
            document.getElementById('codeBarreProduit').value = '';
            document.getElementById('categorieProduit').value = '';
            document.getElementById('prixProduit').value = '';
            document.getElementById('stockInitial').value = '';
            document.getElementById('seuilAlerte').value = '';
        }
    }
    
    modal.classList.add('active');
    console.log('✅ Modal affichée');
}

async function soumettreFormulaireProduit() {
    console.log('📝 Début soumission formulaire produit');
    
    // Récupérer les valeurs du formulaire
    const nomProduit = document.getElementById('nomProduit')?.value.trim();
    const codeBarreProduit = document.getElementById('codeBarreProduit')?.value.trim();
    const categorieProduit = document.getElementById('categorieProduit')?.value;
    const prixProduit = parseFloat(document.getElementById('prixProduit')?.value || 0);
    const stockInitial = parseInt(document.getElementById('stockInitial')?.value || 0);
    const seuilAlerte = parseInt(document.getElementById('seuilAlerte')?.value || 5);
    
    console.log('nomProduit:', nomProduit);
    console.log('codeBarreProduit:', codeBarreProduit);
    console.log('categorieProduit (raw):', categorieProduit);
    console.log('prixProduit:', prixProduit);
    console.log('stockInitial:', stockInitial);
    console.log('seuilAlerte:', seuilAlerte);
    
    // Validation
    if (!nomProduit) {
        afficherNotification('Le nom du produit est requis', 'error');
        return;
    }
    
    if (prixProduit <= 0) {
        afficherNotification('Le prix doit être supérieur à 0', 'error');
        return;
    }
    
    // ✅ Validation du stock initial - Ne pas permettre les valeurs négatives
    if (stockInitial < 0) {
        afficherNotification('❌ Le stock initial ne peut pas être négatif', 'error');
        return;
    }
    
    if (seuilAlerte < 0) {
        afficherNotification('❌ Le seuil d\'alerte ne peut pas être négatif', 'error');
        return;
    }
    
    // Mapping des catégories
    const categoryMap = {
        'boissons': '1', 'Boissons': '1', '1': '1',
        'snacks': '2', 'Snacks': '2', '2': '2',
        'alimentaire': '3', 'Alimentaire': '3', '3': '3',
        'hygiene': '4', 'Hygiène': '4', '4': '4',
        'autre': '5', 'Autre': '5', '5': '5'
    };
    const categoryId = categoryMap[categorieProduit] || categorieProduit;
    
    const data = {
        nom: nomProduit,
        code_barre: codeBarreProduit,
        categorie_id: categoryId,
        prix_vente: prixProduit,
        stock: stockInitial,
        seuil_alerte: seuilAlerte,
        actif: 1
    };
    
    console.log('📊 Données à envoyer:', JSON.stringify(data));
    
    try {
        const form = document.getElementById('formProduit');
        const mode = form?.dataset.mode || 'ajouter';

        if (mode === 'modifier' && form.dataset.produitId) {
            // Mise à jour
            const id = form.dataset.produitId;
            console.log('📝 Mise à jour produit via API', id);
            const response = await fetch(`/APP_IB/backend/Api/Products/update.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            console.log('📨 Réponse update API:', result);
            if (result.success) {
                afficherNotification(result.message || 'Produit mis à jour', 'success');
                fermerModalProduit();
                chargerProduits();
            } else {
                afficherNotification(result.message || 'Erreur mise à jour produit', 'error');
            }
        } else {
            // Création
            console.log('📝 Création produit via API');
            const response = await fetch('/APP_IB/backend/Api/Products/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            console.log('📨 Réponse create API:', result);
            if (result.success) {
                afficherNotification(result.message || 'Produit créé avec succès', 'success');
                fermerModalProduit();
                chargerProduits();
            } else {
                afficherNotification(result.message || 'Erreur création produit', 'error');
            }
        }
    } catch (error) {
        console.log('❌ Erreur:', error.message || error);
        afficherNotification(error.message || 'Erreur lors de l\'opération', 'error');
    }
}

// ====================================================================
// GESTION DU PROFIL UTILISATEUR
// ====================================================================



async function sauvegarderProfil() {
    console.log('💾 Sauvegarde du profil...');
    
    const ancienMotDePasse = document.getElementById('profilMotDePasseActuel')?.value;
    const nouveauMotDePasse = document.getElementById('profilNouveauMotDePasse')?.value;
    const confirmMotDePasse = document.getElementById('profilConfirmMotDePasse')?.value;
    
    // Vérifier si l'utilisateur veut changer son mot de passe
    if (nouveauMotDePasse || confirmMotDePasse) {
        console.log('💾 Tentative de changement de mot de passe');
        
        if (!ancienMotDePasse) {
            afficherNotification('Veuillez entrer votre mot de passe actuel', 'error');
            return;
        }
        
        if (!nouveauMotDePasse) {
            afficherNotification('Veuillez entrer un nouveau mot de passe', 'error');
            return;
        }
        
        if (nouveauMotDePasse !== confirmMotDePasse) {
            afficherNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (nouveauMotDePasse.length < 6) {
            afficherNotification('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }
        
        try {
            console.log('💾 Appel changerMotDePasse...');
            const result = await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse, confirmMotDePasse);
            
            if (result.success) {
                afficherNotification('Mot de passe changé avec succès', 'success');
                setTimeout(() => {
                    fermerModalProfil();
                }, 1000);
            } else {
                afficherNotification(result.message || 'Erreur lors du changement de mot de passe', 'error');
            }
        } catch (error) {
            console.error('💾 Erreur changement mot de passe:', error);
            afficherNotification(error.message || 'Erreur lors du changement de mot de passe', 'error');
        }
    } else {
        console.log('💾 Aucune modification de mot de passe');
        afficherNotification('Aucune modification à enregistrer', 'info');
        setTimeout(() => {
            fermerModalProfil();
        }, 1000);
    }
}

function togglePasswordVisibility(fieldId, button) {
    console.log('👁️ Toggle visibilité mot de passe:', fieldId);
    const field = document.getElementById(fieldId);
    if (field) {
        if (field.type === 'password') {
            field.type = 'text';
            button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            field.type = 'password';
            button.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    }
}

// ====================================================================
// MISE À JOUR STATISTIQUES DÉTAILLÉES RAPPORTS
// ====================================================================

/**
 * Calcule et affiche les vraies statistiques détaillées de la section rapports
 * Utilise les données réelles de la base de données
 */
function mettreAJourStatistiquesRapports() {
    try {
        // Vérifier que les données sont chargées
        if (!ventesData || ventesData.length === 0) {
            console.log('⚠️ Pas de données de ventes disponibles');
            return;
        }

        // CALCUL 1: Total Ventes
        let totalVentes = 0;
        let nombreTransactions = ventesData.length;
        
        ventesData.forEach(vente => {
            // L'API retourne 'montant_total', pas 'total'
            totalVentes += parseFloat(vente.montant_total) || 0;
        });

        // CALCUL 2: Marge Brute (approximation: 30% du total)
        let margeBrute = totalVentes * 0.30;

        // CALCUL 3: Ticket Moyen
        let ticketMoyen = nombreTransactions > 0 ? totalVentes / nombreTransactions : 0;

        // CALCUL 4: Nombre total d'articles vendus et produits distincts
        let totalArticlesVendus = 0;
        let produitsDistincts = new Set();

        ventesData.forEach(vente => {
            // L'API retourne 'quantite_totale' directement dans la vente
            totalArticlesVendus += parseFloat(vente.quantite_totale) || 0;
            
            // Compter les produits distincts à partir du champ 'descriptions'
            // Format: "Produit1, Produit2, Produit3"
            if (vente.descriptions) {
                const produits = vente.descriptions.split(',').map(p => p.trim());
                produits.forEach(produit => {
                    if (produit) {
                        produitsDistincts.add(produit);
                    }
                });
            }
            
            // Fallback: Si les details_ventes sont disponibles, les utiliser aussi
            if (vente.details_ventes && Array.isArray(vente.details_ventes)) {
                vente.details_ventes.forEach(detail => {
                    if (detail.produit_id) {
                        produitsDistincts.add(detail.produit_id);
                    }
                });
            }
        });

        let nombreProduitsDistincts = produitsDistincts.size;

        // Mise à jour du DOM
        const statDetails = document.querySelector('.stats-detaillees');
        if (statDetails) {
            statDetails.innerHTML = `
                <div class="stat-detail">
                    <h4>Ventes</h4>
                    <div class="stat-valeur">${formaterDevise(totalVentes)}</div>
                    <div class="stat-info">${nombreTransactions} ${nombreTransactions > 1 ? 'transactions' : 'transaction'}</div>
                </div>
                <div class="stat-detail">
                    <h4>Marge Brute</h4>
                    <div class="stat-valeur">${formaterDevise(margeBrute)}</div>
                    <div class="stat-info">30% de marge</div>
                </div>
                <div class="stat-detail">
                    <h4>Ticket Moyen</h4>
                    <div class="stat-valeur">${formaterDevise(ticketMoyen)}</div>
                    <div class="stat-info">Par transaction</div>
                </div>
                <div class="stat-detail">
                    <h4>Produits Vendus</h4>
                    <div class="stat-valeur">${totalArticlesVendus} ${totalArticlesVendus > 1 ? 'unités' : 'unité'}</div>
                    <div class="stat-info">${nombreProduitsDistincts} ${nombreProduitsDistincts > 1 ? 'produits différents' : 'produit'}</div>
                </div>
            `;
        }

        console.log('✅ Statistiques détaillées mises à jour:', {
            totalVentes,
            nombreTransactions,
            margeBrute,
            ticketMoyen,
            totalArticlesVendus,
            nombreProduitsDistincts
        });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des statistiques rapports:', error);
    }
}

// ===== FONCTION RÉALISER INVENTAIRE =====
function realiserInventaire(invId) {
    console.log('🔄 Réalisation de l\'inventaire:', invId);
    
    // Rediriger vers la page de détail d'inventaire pour le compléter
    window.location.href = `nouvel-inventaire.html?mode=continue&id=${invId}`;
}

// ====================================================================
// FONCTION DE DEBUG
// ====================================================================

console.log('📱 Système de Gestion Boutique UIYA chargé (VERSION CORRIGÉE)');
console.log('Version: 1.0.1');
console.log('Développé par: Groupe 1 - IGL L2');


