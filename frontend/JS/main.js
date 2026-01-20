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
let ventesData = [];
let mouvementsData = [];
let alertesData = [];
let typePaiementActuel = 'comptant';
// Pagination produits
let currentPage = 1;
const perPageProducts = 10;

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
// INITIALISATION AU CHARGEMENT
// ====================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du système...');

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
    chargerDonneesDashboard();
    
    // Charger le graphique si Chart.js est disponible
    if (typeof Chart !== 'undefined') {
        setTimeout(() => initialiserChartDashboard(), 100);
    }
}

function initialiserChartDashboard() {
    const canvas = document.getElementById('chartVentes7Jours');
    if (!canvas) return;

    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    }

    const ventesSimulees = [120000, 95000, 110000, 125000, 98000, 140000, 130000];

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
                data: ventesSimulees,
                backgroundColor: 'rgba(54,162,235,0.2)',
                borderColor: 'rgba(54,162,235,1)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

function mettreAJourStatistiques() {
    let valeurStock = 0;
    let creditsEnCours = 0;
    
    produitsData.forEach(p => {
        valeurStock += p.stock * p.prix;
    });
    
    creditData.forEach(c => {
        if (c.etat !== 'rembourse') {
            creditsEnCours += c.montantRestant;
        }
    });
    
    // Mettre à jour les affichages des cartes stats
    const elemValeurStock = document.getElementById('stat-valeur-stock');
    if (elemValeurStock) {
        elemValeurStock.textContent = valeurStock.toLocaleString('fr-FR') + ' FCFA';
    }
    
    const elemCreditsEnCours = document.getElementById('stat-credits-montant');
    if (elemCreditsEnCours) {
        elemCreditsEnCours.textContent = creditsEnCours.toLocaleString('fr-FR') + ' FCFA';
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
        const nbCritique = produitsData.filter(p => p.stock < p.seuilAlerte).length;
        stockCritique.textContent = nbCritique;
    }
    
    const valeurTotale = document.getElementById('valeurTotale');
    if (valeurTotale) {
        valeurTotale.textContent = valeurStock.toLocaleString('fr-FR') + ' FCFA';
    }
    
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
        
        // Prendre les 5 dernières ventes
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
                html += '<td><i class="fa-solid fa-eye eye-icon" onclick="voirDetailVente(' + v.id + ')" title="Voir détails"></i></td>';
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
        
        if (!response.success || !Array.isArray(response.data)) {
            document.getElementById('stat-credits-count').innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i><span>0 crédits actifs</span>';
            return;
        }
        
        const creditsImpayés = response.data.filter(c => c.etat !== 'rembourse');
        const totalCredits = creditsImpayés.reduce((sum, c) => sum + (parseFloat(c.montant_restant) || 0), 0);
        
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
 * Charger toutes les données du dashboard
 */
async function chargerDonneesDashboard() {
    console.log('📊 Chargement des données du dashboard');
    mettreAJourStatistiques();
    await chargerVentesRecentes();
    await chargerCreditsImpayés();
    await chargerActivitesRecentes();
    console.log('✅ Dashboard mis à jour');
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
        
        // Mettre à jour le dashboard ventes
        await mettreAJourVentesDashboard();
        
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
    afficherNotification('Fonctionnalité en développement', 'info');
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
// GESTION DES CRÉDITS
// ====================================================================

function chargerCredits() {
    console.log('💳 Chargement des crédits');
    afficherTableauCredits();
    afficherRemboursementsRecents();
}

function afficherTableauCredits() {
    const tbody = document.getElementById('tableauCreditsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    creditData.forEach(credit => {
        const tr = document.createElement('tr');
        const badgeEtat = credit.etat === 'retard' ? 'etat-retard' : 
                         credit.etat === 'en-cours' ? 'etat-en-cours' : 'etat-rembourse';
        const libelleEtat = credit.etat === 'retard' ? 'En retard' : 
                           credit.etat === 'en-cours' ? 'En cours' : 'Remboursé';
        
        tr.innerHTML = `
            <td><strong>${credit.id}</strong></td>
            <td>${credit.client}</td>
            <td>${credit.montantInitial.toLocaleString()} FCFA</td>
            <td><strong>${credit.montantRestant.toLocaleString()} FCFA</strong></td>
            <td>${credit.dateCredit}</td>
            <td>${credit.joursEcoules} jour${credit.joursEcoules > 1 ? 's' : ''}</td>
            <td><span class="badge-etat ${badgeEtat}">${libelleEtat}</span></td>
            <td>
                <div class="actions-credit">
                    <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailCredit('${credit.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${credit.montantRestant > 0 ? `
                    <button class="btn-icone btn-modifier" title="Rembourser" onclick="ouvrirModalRemboursement('${credit.id}')">
                        <i class="fa-solid fa-money-bill"></i>
                    </button>
                    ` : ''}
                    ${credit.etat === 'retard' ? `
                    <button class="btn-icone btn-message" title="Relancer" onclick="relancerClient('${credit.id}')">
                        <i class="fa-solid fa-envelope"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function afficherRemboursementsRecents() {
    // Fonctionnalité à implémenter avec les données de remboursement
    console.log('Remboursements récents affichés');
}

function ouvrirModalRemboursement(creditId = null) {
    const modal = document.getElementById('modalRemboursement');
    if (!modal) return;
    
    document.getElementById('formRemboursement').reset();
    
    // Remplir la liste des crédits non remboursés
    const select = document.getElementById('creditRemboursement');
    select.innerHTML = '<option value="">Sélectionner un crédit</option>';
    creditData.filter(c => c.montantRestant > 0).forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = `${c.id} - ${c.client} (${c.montantRestant.toLocaleString()} FCFA)`;
        if (creditId === c.id) option.selected = true;
        select.appendChild(option);
    });
    
    if (creditId) {
        afficherInfoCredit();
    }
    
    modal.classList.add('active');
}

function fermerModalRemboursement() {
    const modal = document.getElementById('modalRemboursement');
    if (modal) {
        modal.classList.remove('active');
    }
}

function afficherInfoCredit() {
    const select = document.getElementById('creditRemboursement');
    const info = document.getElementById('infoCreditRemboursement');
    const montantRestant = document.getElementById('montantRestant');
    
    const creditId = select.value;
    if (!creditId) {
        info.style.display = 'none';
        return;
    }
    
    const credit = creditData.find(c => c.id === creditId);
    if (credit) {
        montantRestant.textContent = credit.montantRestant.toLocaleString() + ' FCFA';
        info.style.display = 'block';
    }
}

function voirDetailCredit(creditId) {
    const credit = creditData.find(c => c.id === creditId);
    if (credit) {
        alert(`Détails du crédit ${creditId}\n\nClient: ${credit.client}\nMontant initial: ${credit.montantInitial.toLocaleString()} FCFA\nMontant restant: ${credit.montantRestant.toLocaleString()} FCFA\nDate: ${credit.dateCredit}\nJours écoulés: ${credit.joursEcoules}\nÉtat: ${credit.etat}`);
    }
}

function relancerClient(creditId) {
    const credit = creditData.find(c => c.id === creditId);
    if (credit) {
        if (confirm(`Envoyer une relance à ${credit.client} ?\n\nMontant dû: ${credit.montantRestant.toLocaleString()} FCFA`)) {
            afficherNotification('Relance envoyée à ' + credit.client, 'success');
        }
    }
}

function filtrerParEtatCredit() {
    const filtre = document.getElementById('filtreEtatCredit')?.value;
    
    if (!filtre) {
        afficherTableauCredits();
        return;
    }
    
    const tbody = document.getElementById('tableauCreditsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const creditsFiltres = creditData.filter(c => c.etat === filtre);
    
    creditsFiltres.forEach(credit => {
        const tr = document.createElement('tr');
        const badgeEtat = credit.etat === 'retard' ? 'etat-retard' : 
                         credit.etat === 'en-cours' ? 'etat-en-cours' : 'etat-rembourse';
        const libelleEtat = credit.etat === 'retard' ? 'En retard' : 
                           credit.etat === 'en-cours' ? 'En cours' : 'Remboursé';
        
        tr.innerHTML = `
            <td><strong>${credit.id}</strong></td>
            <td>${credit.client}</td>
            <td>${credit.montantInitial.toLocaleString()} FCFA</td>
            <td><strong>${credit.montantRestant.toLocaleString()} FCFA</strong></td>
            <td>${credit.dateCredit}</td>
            <td>${credit.joursEcoules} jour${credit.joursEcoules > 1 ? 's' : ''}</td>
            <td><span class="badge-etat ${badgeEtat}">${libelleEtat}</span></td>
            <td>
                <div class="actions-credit">
                    <button class="btn-icone btn-voir" title="Voir détails" onclick="voirDetailCredit('${credit.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${credit.montantRestant > 0 ? `
                    <button class="btn-icone btn-modifier" title="Rembourser" onclick="ouvrirModalRemboursement('${credit.id}')">
                        <i class="fa-solid fa-money-bill"></i>
                    </button>
                    ` : ''}
                    ${credit.etat === 'retard' ? `
                    <button class="btn-icone btn-message" title="Relancer" onclick="relancerClient('${credit.id}')">
                        <i class="fa-solid fa-envelope"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    if (creditsFiltres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">Aucun crédit trouvé</td></tr>';
    }
}

function exporterCredits() {
    afficherNotification('Export des crédits en cours...', 'info');
    setTimeout(() => {
        afficherNotification('Crédits exportés avec succès', 'success');
    }, 1500);
}

// ====================================================================
// GESTION DES INVENTAIRES
// ====================================================================

function chargerInventaires() {
    console.log('📋 Chargement des inventaires');
}

function creerNouvelInventaire() {
    if (confirm('Démarrer un nouvel inventaire ?\n\nCette action va créer une nouvelle session d\'inventaire.')) {
        afficherNotification('Nouvel inventaire créé', 'success');
        // Implémenter la logique de création d'inventaire
    }
}

function voirDetailInventaire(invId) {
    afficherNotification('Détails de l\'inventaire ' + invId, 'info');
}

function telechargerInventaire(invId) {
    afficherNotification('Téléchargement de l\'inventaire ' + invId, 'info');
}

function exporterInventaire() {
    afficherNotification('Export de l\'inventaire en cours...', 'info');
}

// ====================================================================
// GESTION DES RAPPORTS
// ====================================================================

function chargerRapports() {
    console.log('📊 Chargement des rapports');
    // Charger les graphiques si Chart.js est disponible
    if (typeof Chart !== 'undefined') {
        setTimeout(() => chargerGraphiques(), 100);
    }
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

function genererRapportComplet() {
    afficherNotification('Génération du rapport complet en cours...', 'info');
    setTimeout(() => {
        afficherNotification('Rapport complet généré avec succès', 'success');
    }, 2000);
}

function exporterDonnees() {
    afficherNotification('Export des données en cours...', 'info');
    setTimeout(() => {
        afficherNotification('Données exportées avec succès', 'success');
    }, 1500);
}

function telechargerRapport(type) {
    afficherNotification(`Téléchargement du rapport ${type} en cours...`, 'info');
    setTimeout(() => {
        afficherNotification(`Rapport ${type} téléchargé avec succès`, 'success');
    }, 1500);
}

function chargerGraphiques() {
    // Implémentation des graphiques avec Chart.js
    console.log('Graphiques chargés');
}

// ====================================================================
// GESTION DES ALERTES
// ====================================================================

function chargerAlertes() {
    console.log('🔔 Chargement des alertes');
}

function afficherAlertes() {
    afficherSection('alertes');
}

function filtrerAlertes(type) {
    console.log('Filtrer alertes:', type);
    
    // Mettre à jour les boutons actifs
    const boutons = document.querySelectorAll('.btn-filtre');
    boutons.forEach(btn => btn.classList.remove('actif'));
    
    if (event && event.target) {
        const btnActif = event.target.closest('.btn-filtre');
        if (btnActif) {
            btnActif.classList.add('actif');
        }
    }
    
    // Implémenter le filtrage des alertes
    afficherNotification(`Affichage des alertes: ${type}`, 'info');
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

function enregistrerRemboursement() {
    const creditId = document.getElementById('creditRemboursement').value;
    const montant = parseFloat(document.getElementById('montantRembourse').value);
    const commentaire = document.getElementById('commentaireRemboursement')?.value || '';
    
    if (!creditId || !montant || montant <= 0) {
        afficherNotification('Veuillez remplir tous les champs correctement', 'error');
        return;
    }
    
    const credit = creditData.find(c => c.id === creditId);
    if (!credit) {
        afficherNotification('Crédit introuvable', 'error');
        return;
    }
    
    if (montant > credit.montantRestant) {
        afficherNotification('Montant supérieur au montant restant', 'error');
        return;
    }
    
    credit.montantRestant -= montant;
    
    if (credit.montantRestant === 0) {
        credit.etat = 'rembourse';
    }
    
    afficherTableauCredits();
    mettreAJourStatistiques();
    fermerModalRemboursement();
    afficherNotification('Remboursement de ' + montant.toLocaleString() + ' FCFA enregistré avec succès', 'success');
}

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
// FONCTION DE DEBUG
// ====================================================================

console.log('📱 Système de Gestion Boutique UIYA chargé (VERSION CORRIGÉE)');
console.log('Version: 1.0.1');
console.log('Développé par: Groupe 1 - IGL L2');


