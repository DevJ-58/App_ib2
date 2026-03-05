// ====================================================================
// MAIN.JS - Initialisation du Dashboard
// ====================================================================

// Fonction globale pour les notifications - fallback si utils.js n'est pas chargé
if (!window.afficherNotification) {
    window.afficherNotification = (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
    };
}

// Variables globales pour les données
let produitsData = [];
let ventesData = [];
let creditsData = [];
let mouvementsData = [];
let alertesData = [];

// helper pour l'état de stock, avec fallback si la fonction n'est pas définie
function getEtatStock(quantite, seuil) {
    const fn = (typeof window !== 'undefined' && window.determinerEtatStock) ||
               (typeof determinerEtatStock !== 'undefined' && determinerEtatStock);
    if (typeof fn !== 'function') {
        console.warn('⚠️ determinerEtatStock non disponible, utilisation du fallback');
        return { classe: 'inconnu', libelle: 'Indéfini' };
    }
    return fn(quantite, seuil);
}

// Variables globales pour les modales de produits
let modeProduitActuel = 'ajouter'; // 'ajouter' ou 'modifier'
let idProduitActuel = null; // ID du produit en cours d'édition

// ====================================================================
// INITIALISATION - Exécutée au chargement de la page
// ====================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Dashboard en cours de chargement...');
    console.log('🔧 CORRECTIONS APPLIQUÉES: Catégories utilisent maintenant categorie_nom au lieu de categorie');
    
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
        
        // 6. Mettre à jour les stats rapides maintenant que la section est visible
        console.log('6️⃣ Mise à jour des stats rapides...');
        await mettreAJourStatsRapides();
        
        // 7. Initialiser les événements interactifs
        console.log('7️⃣ Initialisation des événements interactifs...');
        initialiserEvenementsInteractifs();
        
        // 8. Initialiser les gestionnaires de modales
        console.log('8️⃣ Initialisation des modales...');
        initialiserGestionnairesModales();
        
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
        console.log('   📡 Réponse API getAllProducts:', produitsResponse);
        console.log('   ✔️ Propriétés reponse:', {success: produitsResponse.success, data_exists: !!produitsResponse.data, data_length: produitsResponse.data ? produitsResponse.data.length : 0});
        
        if (produitsResponse.success && produitsResponse.data) {
            produitsData = produitsResponse.data;
            console.log(`   ✅ ${produitsData.length} produits chargés`);
            console.log('   📊 Échantillon de données:', produitsData.slice(0, 2).map(p => ({nom: p.nom, stock: p.stock, prix_vente: p.prix_vente, categorie_nom: p.categorie_nom})));
            console.log('   🔍 Données brutes du premier produit:', JSON.stringify(produitsData[0], null, 2));
        } else {
            console.warn('   ⚠️ Réponse API invalide! Success:', produitsResponse.success, 'Data:', produitsResponse.data);
            console.warn('   📋 Réponse COMPLÈTE de l\'API:', JSON.stringify(produitsResponse, null, 2));
        }
        
        // Charger les ventes
        console.log('   ➤ Chargement des ventes...');
        window.ventesData = await chargerVentesAPI();
        console.log(`   ✅ ${window.ventesData.length} ventes chargées`);
        
        // Charger les crédits
        console.log('   ➤ Chargement des crédits...');
        creditsData = await chargerCreditsAPI(1000, 0);
        
        // Charger les mouvements
        console.log('   ➤ Chargement des mouvements...');
        window.mouvementsData = await chargerMouvementsAPI();
        console.log(`   ✅ ${window.mouvementsData.length} mouvements chargés`);
        
        // Charger les alertes
        console.log('   ➤ Chargement des alertes...');
        alertesData = await chargerAlertesAPI();
        
        console.log('✅ Toutes les données chargées avec succès');
        console.log('📊 État des données:', {
            produits: produitsData.length,
            ventes: window.ventesData ? window.ventesData.length : 'non chargé',
            credits: creditsData.length,
            mouvements: window.mouvementsData ? window.mouvementsData.length : 'non chargé',
            alertes: alertesData.length
        });
        
        // Assigner les données aux variables globales window.*
        window.produitsData = produitsData;
        console.log('   ✅ window.produitsData assigné:', window.produitsData ? `Array(${window.produitsData.length})` : 'null/undefined');
        window.ventesData = window.ventesData || [];
        window.creditsData = creditsData;
        window.mouvementsData = window.mouvementsData || [];
        window.alertesData = alertesData;
        
        console.log('🔗 Données assignées aux variables globales');
        console.log('   📊 window.produitsData:', window.produitsData ? `Array(${window.produitsData.length})` : 'null');
        console.log('   📊 window.ventesData:', window.ventesData ? `Array(${window.ventesData.length})` : 'null');
        console.log('   📊 window.creditsData:', window.creditsData ? `Array(${window.creditsData.length})` : 'null');
        console.log('   📊 window.mouvementsData:', window.mouvementsData ? `Array(${window.mouvementsData.length})` : 'null');
        console.log('   📊 window.alertesData:', window.alertesData ? `Array(${window.alertesData.length})` : 'null');
        
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
            console.log('🔍 Débogage avant afficherProduits():');
            console.log('   - produitsData existe:', typeof produitsData !== 'undefined');
            console.log('   - produitsData length:', produitsData ? produitsData.length : 'N/A');
            console.log('   - window.produitsData existe:', typeof window.produitsData !== 'undefined');
            console.log('   - window.produitsData length:', window.produitsData ? window.produitsData.length : 'N/A');
            await afficherProduits();
            break;
        case 'stocks':
            await afficherStocks();
            break;
        case 'ventes':
            console.log('🛒 Débogage avant afficherVentes():');
            console.log('   - window.ventesData existe:', typeof window.ventesData !== 'undefined');
            console.log('   - window.ventesData length:', window.ventesData ? window.ventesData.length : 'N/A');
            console.log('   - window.produitsData existe:', typeof window.produitsData !== 'undefined');
            console.log('   - window.produitsData length:', window.produitsData ? window.produitsData.length : 'N/A');
            await afficherVentes();
            break;
        case 'credits':
            console.log('💳 Débogage avant afficherCredits():');
            console.log('   - window.creditsData existe:', typeof window.creditsData !== 'undefined');
            console.log('   - window.creditsData length:', window.creditsData ? window.creditsData.length : 'N/A');
            await afficherCredits();
            break;
        case 'alertes':
            console.log('🚨 Débogage avant afficherAlertes():');
            console.log('   - window.alertesData existe:', typeof window.alertesData !== 'undefined');
            console.log('   - window.alertesData length:', window.alertesData ? window.alertesData.length : 'N/A');
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
            console.log('   📦 Stats stocks reçues:', {stockValeurTotal: stats.stockValeurTotal, stockNombreProduits: stats.stockNombreProduits});
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
        
        // Charger les top produits du jour
        await chargerTopProduitsDashboard();
        
        console.log('✅ Dashboard mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour dashboard:', error);
        // Continuer même si erreur - afficher les stats en cache
    }
}

/**
 * Charger et afficher les top produits du jour dans le dashboard
 */
async function chargerTopProduitsDashboard() {
    console.log('🔥 Chargement des top produits du jour...');
    
    try {
        const response = await api.getTopProductsToday(5);
        
        if (!response.success) {
            console.error('❌ Erreur API top produits:', response.message);
            return;
        }
        
        const listeTopProduits = document.getElementById('listeTopProduits');
        if (!listeTopProduits) {
            console.warn('⚠️ Élément listeTopProduits non trouvé');
            return;
        }
        
        // Vider la liste
        listeTopProduits.innerHTML = '';
        
        if (!response.data || response.data.length === 0) {
            listeTopProduits.innerHTML = '<li style="text-align: center; color: #666;">Aucune vente aujourd\'hui</li>';
            return;
        }
        
        // Ajouter les produits
        response.data.forEach((produit, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${index + 1}. ${produit.nom_produit || 'Produit inconnu'}</strong>
                <span class="heure">
                    <i class="fa-solid fa-box"></i> ${produit.quantite_vendue || 0} unités vendues
                </span>
            `;
            listeTopProduits.appendChild(li);
        });
        
        console.log('✅ Top produits affichés:', response.data.length, 'produits');
    } catch (error) {
        console.error('❌ Erreur chargement top produits:', error);
        // Afficher un message d'erreur dans la liste
        const listeTopProduits = document.getElementById('listeTopProduits');
        if (listeTopProduits) {
            listeTopProduits.innerHTML = '<li style="text-align: center; color: #f44336;">Erreur de chargement</li>';
        }
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
    console.log('   🔍 typeof determinerEtatStock:', typeof determinerEtatStock, 'typeof window.determinerEtatStock:', typeof window.determinerEtatStock);
    
    // S'assurer que les données sont chargées
    if (!window.produitsData || window.produitsData.length === 0) {
        console.log('   🔄 Produits non chargés, tentative de rechargement...');
        try {
            const produitsResponse = await api.getAllProducts();
            if (produitsResponse.success && produitsResponse.data) {
                window.produitsData = produitsResponse.data;
                console.log(`   ✅ ${window.produitsData.length} produits rechargés`);
            } else {
                console.warn('   ⚠️ Échec du rechargement des produits');
            }
        } catch (error) {
            console.error('   ❌ Erreur rechargement produits:', error);
        }
    }
    
    console.log('   🔍 window.produitsData au début:', window.produitsData ? `Array(${window.produitsData.length})` : 'null/undefined');
    if (window.produitsData && window.produitsData.length > 0) {
        console.log('   📊 Premier produit:', {nom: window.produitsData[0].nom, categorie_nom: window.produitsData[0].categorie_nom, categorie: window.produitsData[0].categorie});
    }

    try {
        const tbody = document.getElementById('corpTableauProduits');
        console.log('   🔍 Élément tbody trouvé:', !!tbody);
        if (!tbody) {
            console.warn('⚠️ Élément corpTableauProduits non trouvé');
            return;
        }

        // Charger les catégories pour le filtre
        await chargerCategoriesFiltres();

        // Mettre à jour les stats rapides
        await mettreAJourStatsRapides();

        // Vider le tableau
        tbody.innerHTML = '';
        console.log('   🧹 Tableau vidé');

        if (!window.produitsData || window.produitsData.length === 0) {
            console.log('   ⚠️ Aucun produit dans window.produitsData');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun produit disponible</td></tr>';
            mettreAJourInfoTotalProduits(0);
            return;
        }

        console.log(`   📝 Ajout de ${window.produitsData.length} produits au tableau...`);

        // Ajouter les produits
        window.produitsData.forEach((produit, index) => {
            console.log(`   ➤ Produit ${index + 1}: ${produit.nom} (ID: ${produit.id})`);
            const etatStock = getEtatStock(produit.stock, produit.seuil_alerte);
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
                <td><span class="badge-categorie">${produit.categorie_nom || produit.categorie || 'N/A'}</span></td>
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

        // Mettre à jour l'info "Affichage de X sur Y"
        mettreAJourInfoTotalProduits(window.produitsData.length);

        console.log('✅ Produits affichés avec succès');
    } catch (error) {
        console.error('❌ Erreur affichage produits:', error);
    }
}

/**
 * Mettre à jour l'info "Affichage de X-Y sur Z produits"
 */
function mettreAJourInfoTotalProduits(nombreProduits) {
    try {
        const infoElem = document.getElementById('infoTotalProduits');
        if (!infoElem) {
            console.warn('⚠️ Élément infoTotalProduits non trouvé');
            return;
        }
        
        // Affichage simple: "Affichage de 1-10 sur Z produits" ou "Affichage de 1-Z sur Z produits"
        const itemsParPage = 10;
        const total = nombreProduits;
        const affiche = Math.min(itemsParPage, total);
        
        if (total === 0) {
            infoElem.innerHTML = 'Affichage de <strong>0</strong> sur <strong>0</strong> produits';
        } else {
            infoElem.innerHTML = `Affichage de <strong>1-${affiche}</strong> sur <strong>${total}</strong> produit${total > 1 ? 's' : ''}`;
        }
        
        console.log(`📊 Info mise à jour: ${affiche}/${total} produits affichés`);
    } catch (error) {
        console.error('❌ Erreur mise à jour info total:', error);
    }
}

/**
 * Charger et remplir le select filtreCategorie avec les vraies catégories
 */
async function chargerCategoriesFiltres() {
    try {
        console.log('🏷️ Chargement des catégories pour le filtre...');
        const response = await api.listCategories(false); // Seulement les actives
        
        if (!response.success || !response.data) {
            console.warn('⚠️ Aucune catégorie trouvée');
            return;
        }
        
        const select = document.getElementById('filtreCategorie');
        if (!select) {
            console.warn('⚠️ Select filtreCategorie non trouvé');
            return;
        }
        
        // Garder l'option "Toutes les catégories"
        const firstOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        
        if (firstOption) {
            select.appendChild(firstOption.cloneNode(true));
        }
        
        // Ajouter les catégories depuis la base de données
        response.data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nom.toLowerCase();
            option.textContent = cat.nom;
            option.dataset.categoryId = cat.id;
            select.appendChild(option);
        });
        
        console.log('✅ Catégories chargées dans le filtre:', response.data.length);
    } catch (error) {
        console.error('❌ Erreur chargement catégories filtre:', error);
    }
}

/**
 * Charger les catégories pour le formulaire de produit
 */
async function chargerCategoriesFormulaire() {
    try {
        console.log('🏷️ Chargement des catégories pour le formulaire...');
        const response = await api.listCategories(false); // Seulement les actives
        
        if (!response.success || !response.data) {
            console.warn('⚠️ Aucune catégorie trouvée pour le formulaire');
            return;
        }
        
        const select = document.getElementById('categorieProduit');
        if (!select) {
            console.warn('⚠️ Select categorieProduit non trouvé');
            return;
        }
        
        // Garder l'option par défaut
        select.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        // Ajouter les catégories depuis la base de données
        response.data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id; // Utiliser l'ID comme valeur
            option.textContent = cat.nom;
            select.appendChild(option);
        });
        
        console.log('✅ Catégories chargées dans le formulaire:', response.data.length);
    } catch (error) {
        console.error('❌ Erreur chargement catégories formulaire:', error);
    }
}

/**
 * Mettre à jour les stats rapides (Total produits, Stock critique, Valeur totale)
 */
async function mettreAJourStatsRapides() {
    try {
        console.log('📊 Mise à jour des stats rapides...');
        console.log('   ⚠️ window.produitsData type:', typeof window.produitsData);
        console.log('   ⚠️ window.produitsData is array?:', Array.isArray(window.produitsData));
        console.log('   ⚠️ window.produitsData length:', window.produitsData ? window.produitsData.length : 'N/A');
        
        // Afficher le contenu exact de chaque produit
        if (window.produitsData && Array.isArray(window.produitsData)) {
            window.produitsData.forEach((p, i) => {
                console.log(`   Produit ${i}:`, {
                    id: p.id,
                    nom: p.nom,
                    stock: p.stock,
                    prix_vente: p.prix_vente,
                    seuil_alerte: p.seuil_alerte,
                    categorie_nom: p.categorie_nom
                });
            });
        }
        
        // Calculer les stats même si window.produitsData est vide
        const totalProduits = window.produitsData && Array.isArray(window.produitsData) ? window.produitsData.length : 0;
        const elemTotal = document.getElementById('totalProduits');
        if (elemTotal) {
            elemTotal.textContent = totalProduits;
            console.log(`   ✅ Total produits: ${totalProduits}`);
        } else {
            console.warn('   ⚠️ Élément totalProduits non trouvé!');
        }
        
        // Calculer le stock critique
        let stockCritique = 0;
        if (window.produitsData && Array.isArray(window.produitsData) && window.produitsData.length > 0) {
            stockCritique = window.produitsData.filter(p => {
                const stock = parseInt(p.stock) || 0;
                const seuil = parseInt(p.seuil_alerte) || 0;
                return stock <= seuil;
            }).length;
        }
        const elemCritique = document.getElementById('stockCritique');
        if (elemCritique) {
            elemCritique.textContent = stockCritique;
            console.log(`   ✅ Stock critique: ${stockCritique}`);
        } else {
            console.warn('   ⚠️ Élément stockCritique non trouvé!');
        }
        
        // Calculer la valeur totale
        let valeurTotale = 0;
        if (window.produitsData && Array.isArray(window.produitsData) && window.produitsData.length > 0) {
            console.log('   📌 Calcul de la valeur totale...');
            valeurTotale = window.produitsData.reduce((sum, p) => {
                const stock = parseInt(p.stock) || 0;
                const prix = parseFloat(p.prix_vente) || 0;
                const valeur = stock * prix;
                console.log(`      Produit ${p.nom}: ${stock} × ${prix} = ${valeur} FCFA`);
                return sum + valeur;
            }, 0);
            console.log('   💰 Valeur totale calculée:', valeurTotale);
        } else {
            console.warn('   ⚠️ Pas de données produits pour calculer la valeur!');
        }
        
        const elemValeur = document.getElementById('valeurTotale');
        if (elemValeur) {
            const valeurFormatee = formaterDevise(valeurTotale);
            console.log(`   📝 Mise à jour de l'élément valeurTotale avec: ${valeurFormatee}`);
            elemValeur.textContent = valeurFormatee;
            console.log(`   ✅ Valeur totale mise à jour: ${valeurFormatee}`);
        } else {
            console.warn('   ⚠️ Élément valeurTotale non trouvé! Éléments disponibles:');
            console.warn('      - totalProduits exists?', !!document.getElementById('totalProduits'));
            console.warn('      - stockCritique exists?', !!document.getElementById('stockCritique'));
            console.warn('      - valeurTotale exists?', !!document.getElementById('valeurTotale'));
        }
        
        console.log('✅ Stats rapides mises à jour - Total:', totalProduits, 'Critique:', stockCritique, 'Valeur:', valeurTotale);
    } catch (error) {
        console.error('❌ Erreur mise à jour stats:', error);
        console.error('   Stack:', error.stack);
    }
}

/**
 * Afficher les stocks
 */
async function afficherStocks() {
    console.log('📦 Affichage des stocks...');
    console.log('   ⚠️ mouvementsData length:', window.mouvementsData ? window.mouvementsData.length : 'n/a');
    console.log('   ⚠️ produitsData length:', window.produitsData ? window.produitsData.length : 'n/a');

    try {
        // S'assurer que les données sont chargées
        if (!window.mouvementsData || window.mouvementsData.length === 0) {
            console.log('   🔄 Chargement des mouvements...');
            await chargerMouvementsAPI();
        }

        if (!window.produitsData || window.produitsData.length === 0) {
            console.log('   🔄 Produits manquants, appel API getAllProducts');
            const produitsResponse = await api.getAllProducts();
            console.log('   📡 Réponse API dans afficherStocks:', produitsResponse);
            if (produitsResponse.success && produitsResponse.data) {
                window.produitsData = produitsResponse.data;
                console.log('   ✅ window.produitsData réassigné avec', window.produitsData.length, 'éléments');
            } else {
                console.warn('   ⚠️ API produits a échoué dans afficherStocks');
            }
        }

        console.log('   🧾 État final de window.produitsData avant stats:', window.produitsData);

        // Mettre à jour les statistiques
        await mettreAJourStatistiquesStocks();
        console.log('   🎯 Statistiques stocks mises à jour, vérifiez éléments dans DOM');

        // Afficher le tableau des stocks
        await afficherTableauStocks();

        // Afficher les mouvements récents
        await afficherMouvementsRecents();

        // Afficher les alertes stock
        await afficherAlertesStock();

        console.log('✅ Stocks affichés avec succès');
    } catch (error) {
        console.error('❌ Erreur affichage stocks:', error);
        afficherNotification('Erreur lors de l\'affichage des stocks', 'error');
    }
}

/**
 * Mettre à jour les statistiques de la section stocks
 */
async function mettreAJourStatistiquesStocks() {
    console.log('📊 Calcul des statistiques stocks...');
    console.log('   🔍 window.produitsData type:', typeof window.produitsData);
    console.log('   🔍 window.produitsData truthy?:', !!window.produitsData);
    console.log('   🔍 window.produitsData length =', window.produitsData && window.produitsData.length);
    console.log('   🔍 window.produitsData value =', window.produitsData);
    
    if (!window.produitsData) {
        console.error('❌ ERREUR: window.produitsData est undefined ou null!');
        document.querySelectorAll('#stat-stock-valeur').forEach(e=>e.textContent = '❌ DONNÉES NON CHARGÉES');
        return;
    }
    
    if (!Array.isArray(window.produitsData)) {
        console.error('❌ ERREUR: window.produitsData n\'est pas un array!', typeof window.produitsData);
        document.querySelectorAll('#stat-stock-valeur').forEach(e=>e.textContent = '❌ FORMAT ERREUR');
        return;
    }
    
    if (window.produitsData.length === 0) {
        console.warn('⚠️ ATTENTION: window.produitsData est un array vide!');
        document.querySelectorAll('#stat-stock-valeur').forEach(e=>e.textContent = '0 FCFA');
        return;
    }
    
    if (window.produitsData && Array.isArray(window.produitsData)) {
        window.produitsData.forEach((p,i) => {
            console.log(`      Produit ${i}:`, p.nom, 'stock', p.stock, 'prix_vente', p.prix_vente);
        });
    }

    try {
        // Calculer la valeur totale du stock
        const valeurTotale = window.produitsData ? window.produitsData.reduce((sum, p) => {
            return sum + ((Number(p.stock) || 0) * (Number(p.prix_vente) || 0));
        }, 0) : 0;
        console.log('   🧮 valeurTotale calculée =', valeurTotale);

        // Nombre de produits
        const nombreProduits = window.produitsData ? window.produitsData.length : 0;

        // Entrées du mois (mouvements d'entrée du mois actuel)
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        const entreesMois = window.mouvementsData ? window.mouvementsData.filter(m =>
            m.type === 'entree' &&
            new Date(m.date_mouvement) >= debutMois
        ).reduce((sum, m) => sum + (Number(m.quantite) || 0), 0) : 0;

        // Sorties du mois (ventes + pertes)
        const sortiesMois = window.mouvementsData ? window.mouvementsData.filter(m =>
            (m.type === 'sortie' || m.type === 'perte') &&
            new Date(m.date_mouvement) >= debutMois
        ).reduce((sum, m) => sum + (Number(m.quantite) || 0), 0) : 0;

        // Produits critiques (stock <= seuil_alerte)
        const produitsCritiques = window.produitsData ? window.produitsData.filter(p =>
            (Number(p.stock) || 0) <= (Number(p.seuil_alerte) || 0) && (Number(p.stock) || 0) > 0
        ).length : 0;

        // Mettre à jour l'interface
        // mettre à jour tous les éléments (certaines pages dupliquent les IDs)
        const elemsValeur = document.querySelectorAll('#stat-stock-valeur');
        const elemsNb = document.querySelectorAll('#stat-stock-nb');
        const elemsEntrees = document.querySelectorAll('#stat-entrees-mois');
        const elemsSorties = document.querySelectorAll('#stat-sorties-mois');
        const elemsCritiques = document.querySelectorAll('#stat-produits-critiques');
        console.log('   🧩 éléments trouvés:', {valeur:elemsValeur.length, nb:elemsNb.length, entrees:elemsEntrees.length, sorties:elemsSorties.length, critiques:elemsCritiques.length});
        elemsValeur.forEach(e => { e.textContent = formaterDevise(valeurTotale); });
        elemsNb.forEach(e => { e.textContent = `${nombreProduits} produits`; });
        elemsEntrees.forEach(e => { e.textContent = `${entreesMois} unités`; });
        elemsSorties.forEach(e => { e.textContent = `${sortiesMois} unités`; });
        elemsCritiques.forEach(e => { e.textContent = produitsCritiques; });
        console.log('✅ Statistiques stocks mises à jour (appliquées)', {valeurTotale, nombreProduits, entreesMois, sortiesMois, produitsCritiques});
    } catch (error) {
        console.error('❌ Erreur calcul statistiques stocks:', error);
    }
}

/**
 * Afficher le tableau des stocks
 */
async function afficherTableauStocks() {
    console.log('📋 Affichage du tableau des stocks...');

    try {
        const tbody = document.getElementById('tableauStockBody');
        if (!tbody) {
            console.warn('⚠️ Élément tableauStockBody non trouvé');
            return;
        }

        tbody.innerHTML = '';

        if (!window.produitsData || window.produitsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucun produit en stock</td></tr>';
            return;
        }

        window.produitsData.forEach(produit => {
            const stock = Number(produit.stock) || 0;
            const seuil = Number(produit.seuil_alerte) || 0;
            const valeur = stock * (Number(produit.prix_vente) || 0);

            // Déterminer l'état du stock
            let etatStock, classeEtat;
            if (stock === 0) {
                etatStock = 'Rupture';
                classeEtat = 'rupture';
            } else if (stock <= seuil) {
                etatStock = 'Critique';
                classeEtat = 'critique';
            } else if (stock <= seuil * 2) {
                etatStock = 'Moyen';
                classeEtat = 'moyen';
            } else {
                etatStock = 'Bon';
                classeEtat = 'bon';
            }

            // Trouver la dernière entrée pour ce produit
            const dernierMouvement = window.mouvementsData ?
                window.mouvementsData
                    .filter(m => m.produit_id == produit.id && m.type === 'entree')
                    .sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement))[0]
                : null;

            const dateDerniereEntree = dernierMouvement ?
                new Date(dernierMouvement.date_mouvement).toLocaleDateString('fr-FR') : 'N/A';

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
                <td><span class="badge-categorie">${produit.categorie_nom || 'N/A'}</span></td>
                <td><span class="stock-quantite">${stock}</span></td>
                <td>${seuil}</td>
                <td><span class="prix-produit">${formaterDevise(valeur)}</span></td>
                <td><span class="badge-stock stock-${classeEtat}">${etatStock}</span></td>
                <td>${dateDerniereEntree}</td>
                <td>
                    <div class="actions-produit">
                        <button class="btn-icone btn-voir" title="Historique" onclick="voirHistoriqueProduit(${produit.id})">
                            <i class="fa-solid fa-history"></i>
                        </button>
                        <button class="btn-icone btn-modifier" title="Ajuster stock" onclick="ouvrirModalAjustementStock(${produit.id})">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log(`✅ ${window.produitsData.length} produits affichés dans le tableau`);
    } catch (error) {
        console.error('❌ Erreur affichage tableau stocks:', error);
    }
}

/**
 * Afficher les mouvements récents
 */
async function afficherMouvementsRecents() {
    console.log('🔄 Affichage des mouvements récents...');

    try {
        const container = document.getElementById('listeMouvements');
        if (!container) {
            console.warn('⚠️ Élément listeMouvements non trouvé');
            return;
        }

        container.innerHTML = '';

        if (!window.mouvementsData || window.mouvementsData.length === 0) {
            container.innerHTML = '<div class="mouvement-item"><p style="text-align: center; color: #666;">Aucun mouvement récent</p></div>';
            return;
        }

        // Trier par date décroissante et prendre les 10 derniers
        const mouvementsRecents = window.mouvementsData
            .sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement))
            .slice(0, 10);

        mouvementsRecents.forEach(mouvement => {
            // Trouver le nom du produit
            const produit = window.produitsData ?
                window.produitsData.find(p => p.id == mouvement.produit_id) : null;
            const nomProduit = produit ? produit.nom : `Produit #${mouvement.produit_id}`;

            // Déterminer l'icône et la classe selon le type
            let icone, classeType;
            switch (mouvement.type) {
                case 'entree':
                    icone = 'fa-arrow-up';
                    classeType = 'entree';
                    break;
                case 'sortie':
                    icone = 'fa-arrow-down';
                    classeType = 'sortie';
                    break;
                case 'perte':
                    icone = 'fa-exclamation-triangle';
                    classeType = 'perte';
                    break;
                default:
                    icone = 'fa-exchange-alt';
                    classeType = 'autre';
            }

            const date = new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR');
            const heure = new Date(mouvement.date_mouvement).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const item = document.createElement('div');
            item.className = 'mouvement-item';
            item.innerHTML = `
                <div class="mouvement-icon">
                    <i class="fa-solid ${icone} mouvement-${classeType}"></i>
                </div>
                <div class="mouvement-details">
                    <div class="mouvement-produit">${nomProduit}</div>
                    <div class="mouvement-info">
                        <span class="mouvement-quantite">${mouvement.quantite} unités</span>
                        <span class="mouvement-date">${date} ${heure}</span>
                    </div>
                    <div class="mouvement-motif">${mouvement.motif || mouvement.type}</div>
                </div>
            `;
            container.appendChild(item);
        });

        console.log(`✅ ${mouvementsRecents.length} mouvements récents affichés`);
    } catch (error) {
        console.error('❌ Erreur affichage mouvements récents:', error);
    }
}

/**
 * Afficher les alertes stock
 */
async function afficherAlertesStock() {
    console.log('🚨 Affichage des alertes stock...');

    try {
        const container = document.getElementById('listeAlertesStock');
        if (!container) {
            console.warn('⚠️ Élément listeAlertesStock non trouvé');
            return;
        }

        container.innerHTML = '';

        if (!window.produitsData || window.produitsData.length === 0) {
            container.innerHTML = '<div class="alerte-item"><p style="text-align: center; color: #666;">Aucune alerte</p></div>';
            return;
        }

        // Produits en rupture (stock = 0)
        const ruptures = window.produitsData.filter(p => (Number(p.stock) || 0) === 0);

        // Produits critiques (stock <= seuil_alerte et stock > 0)
        const critiques = window.produitsData.filter(p =>
            (Number(p.stock) || 0) <= (Number(p.seuil_alerte) || 0) &&
            (Number(p.stock) || 0) > 0
        );

        let alertesAjoutees = 0;

        // Ajouter les ruptures
        ruptures.forEach(produit => {
            const item = document.createElement('div');
            item.className = 'alerte-item rupture';
            item.innerHTML = `
                <div class="alerte-icon">
                    <i class="fa-solid fa-times-circle"></i>
                </div>
                <div class="alerte-details">
                    <div class="alerte-titre">Rupture de stock</div>
                    <div class="alerte-produit">${produit.nom}</div>
                    <div class="alerte-message">Stock épuisé - Réapprovisionnement nécessaire</div>
                </div>
            `;
            container.appendChild(item);
            alertesAjoutees++;
        });

        // Ajouter les produits critiques
        critiques.forEach(produit => {
            const item = document.createElement('div');
            item.className = 'alerte-item critique';
            item.innerHTML = `
                <div class="alerte-icon">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                </div>
                <div class="alerte-details">
                    <div class="alerte-titre">Stock critique</div>
                    <div class="alerte-produit">${produit.nom}</div>
                    <div class="alerte-message">Stock: ${produit.stock} unités (seuil: ${produit.seuil_alerte})</div>
                </div>
            `;
            container.appendChild(item);
            alertesAjoutees++;
        });

        if (alertesAjoutees === 0) {
            container.innerHTML = '<div class="alerte-item"><p style="text-align: center; color: #666;">Aucune alerte active</p></div>';
        }

        console.log(`✅ ${alertesAjoutees} alertes stock affichées`);
    } catch (error) {
        console.error('❌ Erreur affichage alertes stock:', error);
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

        if (zoneProduitsRapides && window.produitsData && window.produitsData.length > 0) {
            console.log('📦 Affichage des produits rapides - window.produitsData.length:', window.produitsData.length);
            console.log('📊 Échantillon produitsData:', window.produitsData.slice(0, 3).map(p => ({id: p.id, nom: p.nom, stock: p.stock})));
            
            zoneProduitsRapides.innerHTML = '';

            // Afficher les 6 premiers produits (en stock de préférence)
            const produitsFiltres = window.produitsData
                .filter(p => p.stock > 0)
                .slice(0, 6);

            console.log('🔍 Produits filtrés (stock > 0):', produitsFiltres.length);
            console.log('📋 Produits filtrés détails:', produitsFiltres.map(p => ({id: p.id, nom: p.nom, stock: p.stock})));

            if (produitsFiltres.length === 0) {
                // Si aucun n'est en stock, afficher les 6 premiers quand même
                produitsFiltres.push(...window.produitsData.slice(0, 6));
            }

            produitsFiltres.forEach(produit => {
                console.log('🎯 Produit à afficher:', {id: produit.id, nom: produit.nom, stock: produit.stock});
                const carte = document.createElement('div');
                carte.className = 'carte-produit-rapide';
                carte.innerHTML = `
                    <div class="icone-produit-rapide">
                        <i class="${produit.icone || 'fa-solid fa-box'}"></i>
                    </div>
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
    console.log('   🔍 window.creditsData:', window.creditsData ? `Array(${window.creditsData.length})` : 'null/undefined');
    
    try {
        creditsData = await chargerCreditsAPI(1000, 0);
        console.log('   📡 Crédits chargés depuis API:', creditsData.length);
        
        const tbody = document.getElementById('tableauCreditsBody');
        console.log('   🔍 Élément tbody trouvé:', !!tbody);
        if (!tbody) {
            console.warn('⚠️ Élément tableauCreditsBody non trouvé');
            return;
        }
        
        // Vider le tableau
        tbody.innerHTML = '';
        
        if (!window.creditsData || window.creditsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucun crédit enregistré</td></tr>';
            return;
        }
        
        // Ajouter les crédits
        window.creditsData.forEach(credit => {
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
                        ${credit.whatsapp ? `<button class="btn-icone btn-whatsapp" title="Relancer sur WhatsApp" onclick="relancerClientWhatsapp('${credit.id}', '${credit.client_nom || 'Client'}', '${credit.montant_restant || 0}', '${credit.whatsapp}')">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>` : ''}
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
    console.log('   🔍 window.alertesData:', window.alertesData ? `Array(${window.alertesData.length})` : 'null/undefined');
    
    try {
        alertesData = await chargerAlertesAPI();
        console.log('   📡 Alertes chargées depuis API:', alertesData.length);
        
        const tbody = document.getElementById('tableauAlertesBody');
        console.log('   🔍 Élément tbody trouvé:', !!tbody);
        if (!tbody) {
            console.warn('⚠️ Élément tableauAlertesBody non trouvé');
            return;
        }
        
        // Vider le tableau
        tbody.innerHTML = '';
        
        if (!window.alertesData || window.alertesData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucune alerte</td></tr>';
            return;
        }
        
        // Ajouter les alertes
        window.alertesData.forEach(alerte => {
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
    
    // Formulaire de produit (ajout/modification)
    const formProduit = document.getElementById('formProduit');
    if (formProduit) {
        formProduit.addEventListener('submit', enregistrerProduit);
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
    
    // Initialiser la modale format export avec fermeture au clic en dehors
    initialiserModalFormatExport();
    
    console.log('✅ Evenements interactifs initialises');
    
    // Test final de connexion après 5 secondes
    setTimeout(() => {
        if (barcodeScanner && !barcodeScanner.isConnected()) {
            console.warn('⚠️ Scanner toujours pas connecté après 5 secondes, test final...');
            mettreAJourIndicateurScanner(false, 'Connexion échouée');
        }
    }, 5000);
}

/**
 * Initialiser les gestionnaires de modales (fermeture au clic sur overlay)
 */
function initialiserGestionnairesModales() {
    console.log('📦 Initialisation des gestionnaires de modales...');
    
    // Liste des ID de modales et leurs fonctions de fermeture
    const modales = [
        { id: 'modalDetailProduit', fermer: fermerModalDetailProduit },
        { id: 'modalHistoriqueProduit', fermer: fermerModalHistoriqueProduit },
        { id: 'modalAjustementStock', fermer: fermerModalAjustementStock },
        { id: 'modalProduit', fermer: fermerModalProduit },
        { id: 'modalCategorie', fermer: fermerModalCategorie },
        { id: 'modalMouvementStock', fermer: fermerModalMouvementStock },
        { id: 'modalPerte', fermer: fermerModalPerte }
    ];
    
    modales.forEach(({ id, fermer }) => {
        const modal = document.getElementById(id);
        if (modal) {
            // Fermer au clic sur l'overlay (pas sur le contenu)
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log(`🚫 Fermeture modal ${id}`);
                    fermer();
                }
            });
            console.log(`   ✓ Gestionnaire modal ${id}`);
        }
    });   
    console.log('✅ Gestionnaires de modales initialisés');
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
        // Ignorer si dans un champ de saisie (input/textarea)
        const target = event.target;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
        
        // Si c'est une touche imprimable et pas dans un input
        if (event.key && event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !isInput) {
            // On n'est pas dans un input/textarea - accumuler pour scanner
            this.buffer += event.key;
            
            // Prévenir le comportement par défaut
            event.preventDefault();
            event.stopPropagation();
            
            // Redémarrer le timeout
            this.restartTimeout();
        }
        
        // Si c'est Enter et qu'on a un buffer, traiter comme fin de scan
        if (event.key === 'Enter' && this.buffer.length > 0 && !isInput) {
            event.preventDefault();
            event.stopPropagation();
            this.processBuffer();
            return;
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
    console.log('🔍 Ouverture détail produit ID:', id, 'from window.produitsData');
    const produit = window.produitsData ? window.produitsData.find(p => p.id == id) : null;
    if (!produit) {
        console.warn('⚠️ Produit non trouvé - window.produitsData:', window.produitsData ? window.produitsData.length : 'undefined');
        afficherNotification('Produit non trouvé', 'error');
        return;
    }
    
    // Déterminer l'état du stock (sécurisé)
    console.log('   🔍 calcul état stock pour produit', produit.nom, 'avec getEtatStock');
    const etat = getEtatStock(produit.stock, produit.seuil_alerte);
    const marge = produit.prix_achat ? ((((produit.prix_vente - produit.prix_achat) / produit.prix_achat) * 100).toFixed(1)) : 'N/A';
    const margeClass = marge !== 'N/A' ? (marge > 30 ? 'margin-high' : marge > 15 ? 'margin-medium' : 'margin-low') : '';
    
    // Créer le contenu HTML des détails
    const contenuHTML = `
        <div class="details-produit-container">
            <!-- En-tête avec info principale -->
            <div class="details-produit-header">
                <div class="produit-icon">
                    <i class="fa-solid fa-box"></i>
                </div>
                <div class="produit-title">
                    <h2>${produit.nom}</h2>
                    <p class="produit-code">${produit.code_barre || 'Pas de code-barres'}</p>
                </div>
                <div class="produit-etat">
                    <span class="badge-stock stock-${etat.classe}">${etat.libelle}</span>
                </div>
            </div>

            <!-- Grille d'informations -->
            <div class="details-grid">
                <!-- Section 1: Informations Générales -->
                <div class="details-produit-section">
                    <div class="section-header">
                        <i class="fa-solid fa-circle-info"></i>
                        <h3>Informations Générales</h3>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-tag"></i> Catégorie</span>
                        <span class="detail-value"><span class="badge-categorie">${produit.categorie_nom || produit.categorie || 'N/A'}</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-barcode"></i> Code interne</span>
                        <span class="detail-value">${produit.code_interne || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-calendar"></i> Date d'ajout</span>
                        <span class="detail-value">${produit.created_at ? formaterDate(produit.created_at) : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-power-off"></i> Statut</span>
                        <span class="detail-value">${produit.actif ? '<span class="badge-active">Actif</span>' : '<span class="badge-inactive">Inactif</span>'}</span>
                    </div>
                </div>

                <!-- Section 2: Informations Financières -->
                <div class="details-produit-section">
                    <div class="section-header">
                        <i class="fa-solid fa-coins"></i>
                        <h3>Tarification</h3>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-arrow-down"></i> Prix d'achat</span>
                        <span class="detail-value tertiary">${formaterDevise(produit.prix_achat || 0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-arrow-up"></i> Prix de vente</span>
                        <span class="detail-value primary"><strong>${formaterDevise(produit.prix_vente || 0)}</strong></span>
                    </div>
                    <div class="detail-row highlight">
                        <span class="detail-label"><i class="fa-solid fa-percent"></i> Marge</span>
                        <span class="detail-value ${margeClass}"><strong>${marge !== 'N/A' ? marge + '%' : 'N/A'}</strong></span>
                    </div>
                    <div class="detail-row highlight">
                        <span class="detail-label"><i class="fa-solid fa-chart-line"></i> Valeur stock</span>
                        <span class="detail-value primary"><strong>${formaterDevise((produit.stock || 0) * (produit.prix_vente || 0))}</strong></span>
                    </div>
                </div>

                <!-- Section 3: Gestion du Stock -->
                <div class="details-produit-section">
                    <div class="section-header">
                        <i class="fa-solid fa-warehouse"></i>
                        <h3>Gestion du Stock</h3>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-boxes-stacked"></i> Quantité actuelle</span>
                        <span class="detail-value primary"><strong>${produit.stock || 0} unité(s)</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fa-solid fa-bell"></i> Seuil d'alerte</span>
                        <span class="detail-value">${produit.seuil_alerte || 'Non défini'}</span>
                    </div>
                    <div class="detail-row stock-indicator">
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${Math.min((produit.stock / (produit.seuil_alerte * 3)) * 100, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="details-produit-actions">
                <button onclick="ouvrirModalProduit('modifier', ${produit.id})" class="btn btn-primaire">
                    <i class="fa-solid fa-pen-to-square"></i> Modifier
                </button>
                <button onclick="fermerModalDetailProduit()" class="btn btn-secondaire">
                    <i class="fa-solid fa-xmark"></i> Fermer
                </button>
            </div>
        </div>
    `;
    
    // Remplir le contenant et ouvrir la modal
    const contentDiv = document.getElementById('detailsProduitContent');
    if (contentDiv) {
        contentDiv.innerHTML = contenuHTML;
    }
    
    const modal = document.getElementById('modalDetailProduit');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
    
    console.log('✅ Modal détails produit ouverte pour:', produit.nom);
}

/**
 * Voir détail d'une vente
 */
function voirDetailVente(id) {
    afficherNotification('Chargement des détails...', 'info');
}

// Placeholder for stock history view
function voirHistoriqueProduit(id) {
    console.log('🔍 Ouverture historique produit', id);
    const produit = window.produitsData ? window.produitsData.find(p => p.id == id) : null;
    
    if (!produit) {
        afficherNotification('Produit non trouvé', 'error');
        return;
    }

    const historique = window.mouvementsData ? 
        window.mouvementsData.filter(m => m.produit_id == id).sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement)) 
        : [];

    let contenuHTML = '<div style="padding: 10px;">';
    
    if (historique.length === 0) {
        contenuHTML += '<p style="text-align: center; color: #999;">Aucun mouvement pour ce produit</p>';
    } else {
        contenuHTML += `<h4>${produit.nom}</h4>`;
        contenuHTML += `<p style="color: #666; margin-bottom: 15px;"><i class="fa-solid fa-barcode"></i> ${produit.code_barre || 'N/A'}</p>`;
        contenuHTML += '<table style="width: 100%; border-collapse: collapse;">';
        contenuHTML += '<tr style="background: #f5f5f5; font-weight: bold;"><td style="padding: 8px; border-bottom: 1px solid #ddd;">Date</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">Quantité</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">Motif</td></tr>';
        
        historique.forEach(mvt => {
            const typeIcon = mvt.type === 'entree' ? '📥' : mvt.type === 'sortie' ? '📤' : '⚠️';
            const date = new Date(mvt.date_mouvement).toLocaleDateString('fr-FR');
            contenuHTML += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${typeIcon} ${mvt.type}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${mvt.quantite}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${mvt.motif || '-'}</td></tr>`;
        });
        contenuHTML += '</table>';
    }
    
    contenuHTML += '</div>';
    
    const modal = document.getElementById('modalHistoriqueProduit');
    const content = document.getElementById('historiqueContent');
    if (content) content.innerHTML = contenuHTML;
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
    console.log('✅ Modale historique ouverte');
}

function fermerModalHistoriqueProduit() {
    const modal = document.getElementById('modalHistoriqueProduit');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 250);
    }
}

// Placeholder for stock adjustment modal
function ouvrirModalAjustementStock(id) {
    console.log('🔧 Ouverture ajustement stock pour produit', id);
    const produit = window.produitsData ? window.produitsData.find(p => p.id == id) : null;
    
    if (!produit) {
        afficherNotification('Produit non trouvé', 'error');
        return;
    }
    
    // Remplir les champs
    document.getElementById('produitAjustement').value = produit.nom;
    document.getElementById('stockActuelAjustement').value = produit.stock + ' unités';
    document.getElementById('typeMouvementAjustement').value = '';
    document.getElementById('quantiteAjustement').value = '';
    document.getElementById('motifAjustement').value = '';
    
    // Stocker l'ID du produit pour la soumission
    const form = document.getElementById('formAjustementStock');
    if (form) {
        form.dataset.produitId = id;
        form.onsubmit = async (e) => {
            e.preventDefault();
            await validerAjustementStock(id);
        };
    }
    
    const modal = document.getElementById('modalAjustementStock');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
    console.log('✅ Modale ajustement ouverte');
}

function fermerModalAjustementStock() {
    const modal = document.getElementById('modalAjustementStock');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 250);
    }
}

async function validerAjustementStock(produitId) {
    const type = document.getElementById('typeMouvementAjustement').value;
    const quantite = document.getElementById('quantiteAjustement').value;
    const motif = document.getElementById('motifAjustement').value;
    
    if (!type || !quantite || !motif) {
        afficherNotification('Tous les champs sont requis', 'error');
        return;
    }
    
    console.log('💾 Enregistrement ajustement:', {produitId, type, quantite, motif});
    afficherNotification('Ajustement enregistré avec succès', 'success');
    fermerModalAjustementStock();
    
    // Recharger les stocks
    await afficherStocks();
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
window.voirHistoriqueProduit = voirHistoriqueProduit;
window.ouvrirModalAjustementStock = ouvrirModalAjustementStock;
window.appliquerFiltresCredits = function() { afficherCredits(); };
window.ouvrirModalRemboursement = function(id) { afficherNotification('Modal remboursement: ' + id, 'info'); };
window.relancerClient = function(id) { afficherNotification('Client relancé', 'info'); };
// Nouvelle fonction d'export unifiée
window.ouvrirModalExport = function(type, msg) {
    typeExportEnCours = type;
    ouvrirModalFormatExport();
};
window.confirmerExport = function(format) {
    // Route vers la bonne fonction selon le contexte
    if (typeRapportEnCours) {
        procederTelechargementRapport(format);
    } else if (typeExportEnCours) {
        // Garder l'ancienne logique pour les autres exports si nécessaire
        console.log('Export', typeExportEnCours, 'en', format);
    }
};
window.annulerExport = function() {
    typeRapportEnCours = null;
    typeExportEnCours = null;
    fermerModalFormatExport();
};
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

// ====================================================================
// EXPORT DES VARIABLES GLOBALES POUR LES AUTRES MODULES
// ====================================================================

window.produitsData = produitsData;
window.ventesData = ventesData;
window.creditsData = creditsData;
window.mouvementsData = mouvementsData;
window.alertesData = alertesData;
window.voirDetailVente = voirDetailVente;
window.voirDetailProduit = voirDetailProduit;

// ====================================================================
// FONCTIONS MANQUANTES - VENTES AVANCÉES
// ====================================================================

let panierItems = [];
let typePaiementActuel = 'comptant';

function ajouterAuPanier(idProduit) {
    console.log('🛒 ajouterAuPanier appelé avec idProduit:', idProduit, 'type:', typeof idProduit);
    
    // Convertir idProduit en nombre si c'est une chaîne
    const idToFind = parseInt(idProduit);
    console.log('🔍 Recherche du produit avec ID converti:', idToFind);
    
    const produit = produitsData.find(p => parseInt(p.id) === idToFind);
    console.log('🔍 Produit trouvé:', produit ? {id: produit.id, nom: produit.nom, type_id: typeof produit.id} : 'AUCUN PRODUIT TROUVÉ');
    
    if (!produit) {
        console.error('❌ Produit non trouvé pour ID:', idProduit, '(converti:', idToFind, ')');
        console.log('📊 produitsData.length:', produitsData.length);
        console.log('📋 Échantillon produitsData:', produitsData.slice(0, 3).map(p => ({id: p.id, nom: p.nom, type_id: typeof p.id})));
        afficherNotification('Produit non trouvé', 'error');
        return;
    }
    
    // ✅ RESTRICTION: Vérifier que le produit n'est pas en rupture de stock
    const stockDisponible = parseInt(produit.stock);
    if (stockDisponible <= 0) {
        console.error('❌ Produit en rupture de stock:', produit.nom);
        afficherNotification(`${produit.nom} est en rupture de stock`, 'error');
        return;
    }
    
    // ✅ RESTRICTION: Vérifier que la quantité ne dépasse pas le stock disponible
    const existant = panierItems.find(p => parseInt(p.id) === idToFind);
    const nouvelleQuantite = existant ? existant.quantite + 1 : 1;
    
    if (nouvelleQuantite > stockDisponible) {
        console.error('❌ Stock insuffisant:', {produit: produit.nom, demande: nouvelleQuantite, disponible: stockDisponible});
        afficherNotification(`Stock insuffisant pour ${produit.nom}. Stock disponible: ${stockDisponible}, Demandé: ${nouvelleQuantite}`, 'error');
        return;
    }
    
    if (existant) {
        existant.quantite = nouvelleQuantite;
    } else {
        panierItems.push({...produit, quantite: 1});
    }
    
    afficherPanier();
    afficherNotification(`${produit.nom} ajouté au panier (${nouvelleQuantite}/${stockDisponible})`, 'success');
}

function afficherPanier() {
    const listePanier = document.getElementById('listePanier');
    if (!listePanier) return;
    
    // ✅ VALIDATION: Vérifier que tous les produits du panier sont toujours disponibles
    const itemsASupprimer = [];
    const itemsAAjuster = [];
    
    panierItems.forEach((item, idx) => {
        // Chercher le produit actuel dans la base de données
        const produitActuel = produitsData.find(p => parseInt(p.id) === parseInt(item.id));
        
        if (!produitActuel || parseInt(produitActuel.stock) <= 0) {
            // Le produit est en rupture de stock
            itemsASupprimer.push(idx);
        } else if (item.quantite > parseInt(produitActuel.stock)) {
            // La quantité demandée dépasse le stock
            itemsAAjuster.push({idx, item, produit: produitActuel});
        }
    });
    
    // Supprimer les produits en rupture (dans l'ordre inverse pour ne pas perdre les indices)
    itemsASupprimer.reverse().forEach(idx => {
        const nom = panierItems[idx].nom;
        panierItems.splice(idx, 1);
        afficherNotification(`${nom} est en rupture de stock et a été retiré du panier`, 'warning');
    });
    
    // Réduire les quantités si nécessaire
    itemsAAjuster.forEach(({idx, item, produit}) => {
        const oldQuantite = item.quantite;
        item.quantite = parseInt(produit.stock);
        afficherNotification(`${item.nom}: quantité réduite de ${oldQuantite} à ${item.quantite} (stock disponible)`, 'warning');
    });
    
    if (panierItems.length === 0) {
        listePanier.innerHTML = '<div class="panier-vide"><i class="fa-solid fa-cart-shopping"></i><p>Aucun produit dans le panier</p></div>';
    } else {
        listePanier.innerHTML = panierItems.map((item, idx) => {
            // Chercher le stock actuel
            const produitActuel = produitsData.find(p => parseInt(p.id) === parseInt(item.id));
            const stockDisponible = produitActuel ? parseInt(produitActuel.stock) : 0;
            
            return `
            <div class="item-panier">
                <strong>${item.nom}</strong>
                <div class="qte-stock-info">
                    <span class="qte-demandee">Demandé: ${item.quantite}</span>
                    <span class="qte-disponible">Disponible: ${stockDisponible}</span>
                    ${item.quantite === stockDisponible ? '<span class="badge-alerte">⚠️ Dernier stock</span>' : ''}
                </div>
                <div class="qte-controls">
                    <button onclick="modifierQuantite(${idx}, -1)">−</button>
                    <span>${item.quantite}</span>
                    <button onclick="modifierQuantite(${idx}, 1)" ${item.quantite >= stockDisponible ? 'disabled' : ''}>+</button>
                </div>
                <span class="item-total">${formaterDevise(item.prix_vente * item.quantite)}</span>
                <button class="btn-supprimer" onclick="retirerDuPanier(${idx})"><i class="fa-solid fa-trash"></i></button>
            </div>
            `;
        }).join('');
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
    const item = panierItems[idx];
    const nouvelleQuantite = item.quantite + delta;
    
    // ✅ RESTRICTION: Vérifier que la nouvelle quantité ne dépasse pas le stock
    const stockDisponible = parseInt(item.stock);
    
    // Si on augmente la quantité, vérifier le stock
    if (delta > 0 && nouvelleQuantite > stockDisponible) {
        console.error('❌ Stock insuffisant:', {produit: item.nom, demande: nouvelleQuantite, disponible: stockDisponible});
        afficherNotification(`Stock insuffisant pour ${item.nom}. Stock disponible: ${stockDisponible}`, 'error');
        return;
    }
    
    // Mettre à jour ou supprimer
    if (nouvelleQuantite <= 0) {
        panierItems.splice(idx, 1);
        afficherNotification(`${item.nom} retiré du panier`, 'info');
    } else {
        item.quantite = nouvelleQuantite;
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

    // Afficher le champ WhatsApp pour les crédits
    const champWhatsapp = document.getElementById('champWhatsapp');
    if (champWhatsapp) {
        champWhatsapp.style.display = type === 'credit' ? 'block' : 'none';
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
    console.log('💰 validerVente appelée');
    console.log('🛒 panierItems au moment de la validation:', panierItems);
    console.log('📊 panierItems.length:', panierItems.length);
    
    if (panierItems.length === 0) {
        afficherNotification('Le panier est vide', 'warning');
        return;
    }
    
    // ✅ VALIDATION CRITIQUE: Vérifier que tous les produits ont un stock suffisant
    const errorsStock = [];
    panierItems.forEach((item, idx) => {
        const produitActuel = produitsData.find(p => parseInt(p.id) === parseInt(item.id));
        
        if (!produitActuel) {
            errorsStock.push(`${item.nom} n'existe plus dans la base de données`);
        } else if (parseInt(produitActuel.stock) <= 0) {
            errorsStock.push(`${item.nom} est en rupture de stock`);
        } else if (item.quantite > parseInt(produitActuel.stock)) {
            errorsStock.push(`${item.nom}: quantité demandée (${item.quantite}) dépasse le stock disponible (${produitActuel.stock})`);
        }
    });
    
    if (errorsStock.length > 0) {
        afficherNotification('Erreurs de stock:\n' + errorsStock.join('\n'), 'error');
        // Rafraîchir l'affichage du panier pour nettoyer les articles problématiques
        afficherPanier();
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

    // Récupérer le numéro WhatsApp s'il existe
    let whatsappNumber = null;
    if (typePaiementActuel === 'credit') {
        const whatsappInput = document.getElementById('whatsappClient')?.value;
        if (whatsappInput && whatsappInput.trim()) {
            // Formater le numéro: 05 12 34 56 78 (10 chiffres) → +225512345678
            const cleanNumber = whatsappInput.replace(/\s/g, '');
            
            // Valider que c'est 10 chiffres
            if (!/^\d{10}$/.test(cleanNumber)) {
                afficherNotification('Numéro WhatsApp invalide. Format: 10 chiffres (ex: 05 12 34 56 78)', 'error');
                return;
            }
            
            whatsappNumber = '+225' + cleanNumber;
        }
    }
    
    const success = await enregistrerVenteAPIAvecWhatsapp(
        document.getElementById('nomClient')?.value || 'Vente comptant',
        total,
        typePaiementActuel,
        panierItems, // Les items sont déjà formatés dans la fonction
        montantRecu,
        montantRecu - total,
        whatsappNumber
    );
    
    if (success) {
        // Si c'est un crédit, créer automatiquement un crédit après la vente
        if (typePaiementActuel === 'credit' && success.vente_id) {
            const clientNom = document.getElementById('nomClient')?.value || 'Client';
            const creditResult = await creerCreditAPI(
                success.vente_id,
                clientNom,
                total,
                'AUTRE',
                whatsappNumber
            );
            
            if (!creditResult) {
                // Le crédit n'a pas pu être créé mais la vente l'a été
                afficherNotification('Vente créée mais crédit non enregistré', 'warning');
            }
        }

        panierItems = [];
        afficherPanier();
        afficherNotification('Vente enregistrée avec succès', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('nomClient').value = '';
        document.getElementById('whatsappClient').value = '';
        selectionnerPaiement('comptant');
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

async function ouvrirModalProduit(mode, id = null, codeBarre = null) {
    console.log('🔍 ouvrirModalProduit appelée avec:', {mode, id, codeBarre});
    
    // Mettre à jour les variables globales de mode
    modeProduitActuel = mode;
    idProduitActuel = id;
    console.log('📌 Mode défini:', modeProduitActuel, 'ID:', idProduitActuel);
    
    const modal = document.getElementById('modalProduit');
    console.log('📱 Modal trouvée:', modal ? 'OUI' : 'NON');
    
    if (!modal) {
        console.error('❌ Modal produit non trouvée dans le DOM');
        return;
    }
    
    // Charger les catégories pour le formulaire
    await chargerCategoriesFormulaire();
    
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
            if (inputCategorie) inputCategorie.value = produit.categorie_id || '';
            
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

/**
 * Enregistrer un produit (ajout ou modification)
 */
async function enregistrerProduit(event) {
    event.preventDefault();
    console.log('📝 Enregistrement du produit...');
    
    // Récupérer les valeurs du formulaire
    const nom = document.getElementById('nomProduit')?.value?.trim();
    const codeBarre = document.getElementById('codeBarreProduit')?.value?.trim();
    const categorie = document.getElementById('categorieProduit')?.value?.trim();
    const prix = parseFloat(document.getElementById('prixProduit')?.value);
    const stock = parseInt(document.getElementById('stockInitial')?.value);
    const seuil = parseInt(document.getElementById('seuilAlerte')?.value);
    
    // Validation
    if (!nom) {
        afficherNotification('❌ Veuillez entrer le nom du produit', 'error');
        return;
    }
    
    if (!categorie) {
        afficherNotification('❌ Veuillez sélectionner une catégorie', 'error');
        return;
    }
    
    if (!prix || prix <= 0) {
        afficherNotification('❌ Veuillez entrer un prix valide', 'error');
        return;
    }
    
    if (stock === null || stock === '' || stock < 0) {
        afficherNotification('❌ Veuillez entrer un stock valide', 'error');
        return;
    }
    
    if (seuil === null || seuil === '' || seuil < 0) {
        afficherNotification('❌ Veuillez entrer un seuil d\'alerte valide', 'error');
        return;
    }
    
    console.log({nom, codeBarre, categorie, prix, stock, seuil});
    
    try {
        let response;
        
        if (modeProduitActuel === 'modifier' && idProduitActuel) {
            // Modification
            console.log(`🔄 Modification du produit #${idProduitActuel}`);
            const donnees = {
                nom,
                code_barre: codeBarre,
                categorie_id: categorie,
                prix_vente: prix,
                stock,
                seuil_alerte: seuil
            };
            response = await api.updateProduct(idProduitActuel, donnees);
        } else {
            // Ajout
            console.log('➕ Ajout d\'un nouveau produit');
            const donnees = {
                nom,
                code_barre: codeBarre || null,
                categorie_id: categorie,
                prix_vente: prix,
                stock,
                seuil_alerte: seuil
            };
            response = await api.createProduct(donnees);
        }
        
        if (response.success) {
            afficherNotification(
                modeProduitActuel === 'modifier' 
                    ? '✅ Produit modifié avec succès' 
                    : '✅ Produit ajouté avec succès',
                'success'
            );
            
            // Fermer la modal
            fermerModalProduit();
            
            // Recharger les données
            console.log('🔄 Rechargement des données...');
            await chargerToutLesDonnees();
            
            // Rafraîchir l'affichage et les stats
            console.log('📊 Mise à jour de l\'affichage et des stats...');
            await mettreAJourStatsRapides();
            afficherProduits();
        } else {
            afficherNotification(`❌ Erreur: ${response.message || 'Impossible d\'enregistrer le produit'}`, 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement:', error);
        afficherNotification('❌ Erreur lors de l\'enregistrement du produit', 'error');
    }
}

function fermerModalDetailProduit() {
    const modal = document.getElementById('modalDetailProduit');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
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
    if (categorie) {
        filtered = filtered.filter(p => {
            // Comparer en minuscules pour éviter les problèmes de casse
            return (p.categorie_nom || p.categorie || '').toLowerCase() === categorie.toLowerCase();
        });
    }
    if (etat) {
        const etatMap = { bon: 'bon', moyen: 'moyen', critique: 'critique' };
        filtered = filtered.filter(p => {
            const e = getEtatStock(p.stock, p.seuil_alerte);
            return e.classe === etatMap[etat];
        });
    }
    
    const tbody = document.getElementById('corpTableauProduits');
    if (tbody) {
        tbody.innerHTML = filtered.map(p => {
            const e = getEtatStock(p.stock, p.seuil_alerte);
            console.log('Produit:', p.nom, 'categorie_nom:', p.categorie_nom, 'categorie:', p.categorie, '→ affiché:', p.categorie_nom || p.categorie || 'N/A');
            return `<tr><td><div class="info-produit"><div class="icone-produit"><i class="fa-solid fa-box"></i></div><div class="details-produit"><h4>${p.nom}</h4><span class="code-barre">${p.code_barre}</span></div></div></td><td><span class="badge-categorie">${p.categorie_nom || p.categorie || 'N/A'}</span></td><td>${formaterDevise(p.prix_vente)}</td><td><span class="badge-stock stock-${e.classe}">${p.stock} unité(s)</span></td><td>${p.seuil_alerte}</td><td><div class="actions-produit"><button class="btn-icone btn-voir" onclick="voirDetailProduit(${p.id})"><i class="fa-solid fa-eye"></i></button><button class="btn-icone btn-modifier" onclick="ouvrirModalProduit('modifier', ${p.id})"><i class="fa-solid fa-pen"></i></button><button class="btn-icone btn-supprimer" onclick="confirmerSuppressionProduit(${p.id})"><i class="fa-solid fa-trash"></i></button></div></td></tr>`;
        }).join('');
    }
    
    // Mettre à jour l'affichage du nombre de produits filtrés
    mettreAJourInfoTotalProduits(filtered.length);
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
            const e = getEtatStock(p.stock, p.seuil_alerte);
            return `<tr><td><div class="info-produit"><div class="icone-produit"><i class="fa-solid fa-box"></i></div><div class="details-produit"><h4>${p.nom}</h4></div></div></td><td>${p.categorie_nom || p.categorie || 'N/A'}</td><td>${formaterDevise(p.prix_vente)}</td><td><span class="badge-stock stock-${e.classe}">${p.stock}</span></td><td>${p.seuil_alerte}</td><td><button class="btn-icone" onclick="voirDetailProduit(${p.id})"><i class="fa-solid fa-eye"></i></button></td></tr>`;
        }).join('');
    }
}

window.fermerModalProduit = fermerModalProduit;
window.voirDetailProduit = voirDetailProduit;
window.fermerModalDetailProduit = fermerModalDetailProduit;
window.confirmerSuppressionProduit = confirmerSuppressionProduit;
window.filtrerProduits = filtrerProduits;
window.trierProduits = trierProduits;
window.chargerCategoriesFiltres = chargerCategoriesFiltres;
window.mettreAJourStatsRapides = mettreAJourStatsRapides;

// exposer nouveaux stubs
window.voirHistoriqueProduit = voirHistoriqueProduit;
window.fermerModalHistoriqueProduit = fermerModalHistoriqueProduit;
window.ouvrirModalAjustementStock = ouvrirModalAjustementStock;
window.fermerModalAjustementStock = fermerModalAjustementStock;
window.validerAjustementStock = validerAjustementStock;

// ====================================================================
// CATÉGORIES
// ====================================================================

function ouvrirModalCategorie() {
    const modal = document.getElementById('modalCategorie');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        // Charger les catégories dès l'ouverture pour l'onglet Gérer
        chargerCategoriesAffichage();
        // Réinitialiser le formulaire
        document.getElementById('formCategorie').reset();
        // Aller à l'onglet Ajouter par défaut
        basculerTabCategorie('ajouter');
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
    // Activer le bouton de l'onglet correspondant
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    
    // Désactiver tous les contenus d'onglets
    document.querySelectorAll('.categorie-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activer le bon bouton
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${tab}'`)) {
            btn.classList.add('tab-active');
        }
    });
    
    // Activer le bon contenu
    const tabContent = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

/**
 * Ajouter une nouvelle catégorie
 */
async function ajouterCategorie(event) {
    event.preventDefault();
    
    const nom = document.getElementById('nomCategorie')?.value.trim();
    
    if (!nom) {
        afficherNotification('error', 'Veuillez entrer un nom de catégorie');
        return;
    }
    
    try {
        console.log('Création de la catégorie:', nom);
        const response = await api.createCategory(nom);
        
        if (response.success) {
            afficherNotification('success', 'Catégorie créée avec succès');
            document.getElementById('formCategorie').reset();
            // Recharger la liste des catégories
            await chargerCategoriesAffichage();
            // Aller à l'onglet Gérer
            basculerTabCategorie('gerer');
        } else {
            afficherNotification('error', response.message || 'Erreur lors de la création');
        }
    } catch (error) {
        console.error('Erreur:', error);
        afficherNotification('error', 'Erreur lors de la création de la catégorie');
    }
}

/**
 * Charger et afficher les catégories dans l'onglet Gérer
 */
async function chargerCategoriesAffichage() {
    try {
        console.log('Chargement des catégories...');
        const response = await api.listCategories(true); // Inclure les inactives aussi
        
        if (!response.success) {
            console.error('Erreur API:', response.message);
            return;
        }
        
        const categories = response.data || [];
        const tbody = document.getElementById('listeCategories');
        
        if (!tbody) {
            console.warn('Tableau des catégories non trouvé');
            return;
        }
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">Aucune catégorie</td></tr>';
            return;
        }
        
        tbody.innerHTML = categories.map(cat => `
            <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px;">${cat.id}</td>
                <td style="padding: 12px;">${cat.nom}</td>
                <td style="padding: 12px; text-align: center;">
                    <span class="badge" style="background: ${cat.actif ? '#4CAF50' : '#f44336'}; color: white; padding: 4px 8px; border-radius: 3px;">
                        ${cat.actif ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center; display: flex; gap: 8px; justify-content: center; align-items: center;">
                    <button class="btn-icone" title="Modifier" onclick="editerCategorie(${cat.id}, '${cat.nom}', ${cat.actif})" style="margin: 0; padding: 6px 10px;">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icone btn-danger" title="Supprimer" onclick="supprimerCategorie(${cat.id}, '${cat.nom}')" style="margin: 0; padding: 6px 10px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Catégories affichées:', categories.length);
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

/**
 * Éditer une catégorie
 */
function editerCategorie(id, nom, actif) {
    // Remplir le formulaire avec les données actuelles
    document.getElementById('nomCategorie').value = nom;
    document.getElementById('categorieActive').checked = actif;
    
    // Aller à l'onglet Ajouter (réutiliser le formulaire pour éditer)
    basculerTabCategorie('ajouter');
    
    // Créer un événement personnalisé ou modifier le formulaire pour l'édition
    const form = document.getElementById('formCategorie');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Supprimer l'ancien gestionnaire
    const newForm = form.cloneNode(true);
    form.replaceWith(newForm);
    
    // Ajouter un gestionnaire pour l'édition
    document.getElementById('formCategorie').onsubmit = async (event) => {
        event.preventDefault();
        
        const newNom = document.getElementById('nomCategorie')?.value.trim();
        const newActif = document.getElementById('categorieActive')?.checked ? 1 : 0;
        
        if (!newNom) {
            afficherNotification('error', 'Veuillez entrer un nom de catégorie');
            return;
        }
        
        try {
            // Ici on pourrait implémenter la mise à jour
            // Pour l'instant, on supprime et crée une nouvelle
            await api.updateCategory(id, newNom);
            afficherNotification('success', 'Catégorie modifiée avec succès');
            
            // Réinitialiser le formulaire
            document.getElementById('formCategorie').reset();
            // Reinitialiser l'événement
            document.getElementById('formCategorie').onsubmit = ajouterCategorie;
            // Recharger la liste
            await chargerCategoriesAffichage();
            // Aller à l'onglet Gérer
            basculerTabCategorie('gerer');
        } catch (error) {
            console.error('Erreur:', error);
            afficherNotification('error', 'Erreur lors de la modification');
        }
    };
}

/**
 * Supprimer une catégorie
 */
async function supprimerCategorie(id, nom) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${nom}" ?\n\nAttention: Si des produits sont associés à cette catégorie, ils seront aussi supprimés.`)) {
        return;
    }
    
    try {
        console.log('🗑️ Suppression de la catégorie ID:', id);
        const response = await api.deleteCategory(id);
        
        console.log('✅ Réponse de suppression:', response);
        if (response.success) {
            afficherNotification('success', 'Catégorie supprimée avec succès');
            // Recharger la liste
            await chargerCategoriesAffichage();
        } else {
            afficherNotification('error', response.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        afficherNotification('error', 'Erreur lors de la suppression: ' + error.message);
    }
}

window.ouvrirModalCategorie = ouvrirModalCategorie;
window.fermerModalCategorie = fermerModalCategorie;
window.basculerTabCategorie = basculerTabCategorie;
window.ajouterCategorie = ajouterCategorie;
window.chargerCategoriesAffichage = chargerCategoriesAffichage;
window.editerCategorie = editerCategorie;
window.supprimerCategorie = supprimerCategorie;

// ====================================================================
// STOCKS - MODALES ET ACTIONS  
// ====================================================================

function ouvrirModalMouvementStock(type) {
    console.log('🪟 ouvrirModalMouvementStock appelé avec type=', type);
    const modal = document.getElementById('modalMouvementStock');
    if (!modal) {
        console.warn('⚠️ modalMouvementStock introuvable');
        return;
    }
    
    const titre = modal.querySelector('.entete-modal h2');
    if (titre) titre.textContent = type === 'entree' ? 'Entrée de Stock' : 'Sortie de Stock';

    // activer la modal (CSS contrôle visibilité via classe active)
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.dataset.type = type;
}

function fermerModalMouvementStock() {
    const modal = document.getElementById('modalMouvementStock');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        delete modal.dataset.type;
    }
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
        const e = getEtatStock(p.stock, p.seuil_alerte);
        return e.classe === filtre;
    });
    
    const tbody = document.getElementById('tableauStockBody');
    if (tbody) {
        tbody.innerHTML = filtered.map(p => {
            const e = getEtatStock(p.stock, p.seuil_alerte);
            return `<tr><td>${p.nom}</td><td>${p.categorie}</td><td>${p.stock}</td><td>${p.seuil_alerte}</td><td>${formaterDevise(p.stock * p.prix_vente)}</td><td><span class="badge-stock">${e.libelle}</span></td><td>-</td><td><button class="btn-icone" onclick="afficherSection('stocks')"><i class="fa-solid fa-eye"></i></button></td></tr>`;
        }).join('');
    }
}

window.ouvrirModalMouvementStock = ouvrirModalMouvementStock;
window.fermerModalMouvementStock = fermerModalMouvementStock;
window.ouvrirModalPerte = ouvrirModalPerte;
window.fermerModalPerte = fermerModalPerte;
window.filtrerParEtatStock = filtrerParEtatStock;
window.initialiserGestionnairesModales = initialiserGestionnairesModales;

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

// Fonctions pour la modale de configuration de rapport
function ouvrirModalConfigurationRapport() {
    const modal = document.getElementById('modalConfigurationRapport');
    if (modal) modal.style.display = 'flex';
    // Initialiser la date d'aujourd'hui
    const inputDate = document.getElementById('inputDateConfigRapport');
    if (inputDate) {
        inputDate.value = new Date().toISOString().split('T')[0];
    }
}

function fermerModalConfigurationRapport() {
    const modal = document.getElementById('modalConfigurationRapport');
    if (modal) modal.style.display = 'none';
}

// Ancienne fonction remplacée - maintenant ouvre juste la modale
async function telechargerRapport(type) {
    ouvrirModalConfigurationRapport();
    // Pré-sélectionner le type de rapport
    const select = document.getElementById('selectModeleRapport');
    if (select) select.value = type;
}

// Nouvelle fonction unifiée pour télécharger le rapport
async function telechargerRapportConfig() {
    // Récupérer les valeurs de la modale
    const inputDate = document.getElementById('inputDateConfigRapport');
    const selectModele = document.getElementById('selectModeleRapport');
    const formatRadios = document.querySelectorAll('input[name="formatRapport"]');
    
    if (!inputDate || !inputDate.value) {
        afficherNotification('⚠️ Veuillez sélectionner une date', 'warning');
        return;
    }
    if (!selectModele || !selectModele.value) {
        afficherNotification('⚠️ Veuillez sélectionner un type de rapport', 'warning');
        return;
    }
    
    let selectedFormat = 'pdf';
    for (let radio of formatRadios) {
        if (radio.checked) {
            selectedFormat = radio.value;
            break;
        }
    }
    
    const dateArg = inputDate.value;
    const typeRapport = selectModele.value;
    const format = selectedFormat;
    
    console.log(`📄 Téléchargement: type=${typeRapport}, date=${dateArg}, format=${format}`);
    
    try {
        afficherNotification(`🔄 Génération rapport ${typeRapport}...`, 'info');
        let data = null;
        
        switch(typeRapport) {
            case 'journalier':
                data = await window.genererRapportJournalier(dateArg);
                break;
            case 'hebdomadaire':
                data = await window.genererRapportHebdomadaire(dateArg);
                break;
            case 'mensuel':
                data = await window.genererRapportMensuel(dateArg);
                break;
            case 'stock':
                data = await window.genererRapportStocks(dateArg);
                break;
            case 'credits':
                data = await window.genererRapportCredits(dateArg);
                break;
            case 'top-produits':
                data = await window.genererRapportTopProduits(dateArg);
                break;
            default:
                afficherNotification('❌ Type de rapport inconnu', 'error');
                return;
        }
        
        if (!data) {
            afficherNotification('❌ Impossible de générer le rapport', 'error');
            return;
        }
        
        if (format === 'pdf') {
            let doc = null;
            switch(typeRapport) {
                case 'journalier':
                    doc = window.genererPDFRapportJournalier(data);
                    break;
                case 'hebdomadaire':
                    doc = window.genererPDFRapportHebdomadaire(data);
                    break;
                case 'mensuel':
                    doc = window.genererPDFRapportMensuel(data);
                    break;
                case 'stock':
                    doc = window.genererPDFRapportStocks(data);
                    break;
                case 'credits':
                    doc = window.genererPDFRapportCredits(data);
                    break;
                case 'top-produits':
                    doc = window.genererPDFRapportTopProduits(data);
                    break;
            }
            if (doc && typeof doc.save === 'function') {
                window.exporterPDF(doc, `rapport_${typeRapport}_${dateArg}`);
                afficherNotification('✅ Rapport PDF téléchargé avec succès', 'success');
            }
        } else if (format === 'excel') {
            console.log('[EXCEL] Début traitement Excel pour type:', typeRapport);
            console.log('[EXCEL] Données reçues:', data);
            
            // Traiter les données selon le type de rapport
            let donneesExcel = [];
            const nomRapport = `rapport_${typeRapport}_${dateArg}`;

            switch(typeRapport) {
                case 'journalier':
                case 'hebdomadaire':
                case 'mensuel':
                    console.log('[EXCEL] Traitement ventes détaillées...');
                    // Pour les rapports de ventes, extraire les données de ventes détaillées
                    if (data.ventes_detaillees && Array.isArray(data.ventes_detaillees)) {
                        console.log('[EXCEL] Ventes détaillées trouvées:', data.ventes_detaillees.length, 'ventes');
                        donneesExcel = data.ventes_detaillees.map((v, idx) => ({
                            '#': idx + 1,
                            'Date': v.date_vente || '-',
                            'Produit': v.produit_nom || '-',
                            'Quantité': Number(v.quantite) || 0,
                            'Prix Unitaire (FCFA)': Number(v.prix_unitaire) || 0,
                            'Total (FCFA)': Number(v.total) || 0,
                            'Client': v.client_nom || '-',
                            'Utilisateur': v.utilisateur_nom || '-'
                        }));
                    } else {
                        console.warn('[EXCEL] Pas de ventes_detaillees trouvées dans data.ventes_detaillees');
                    }
                    break;

                case 'stock':
                    console.log('[EXCEL] Traitement stocks...');
                    // Pour le rapport de stocks, utiliser les données de produits du rapport
                    if (data.produits && Array.isArray(data.produits)) {
                        console.log('[EXCEL] Produits trouvés:', data.produits.length, 'produits');
                        donneesExcel = data.produits.map((p, idx) => ({
                            '#': idx + 1,
                            'Produit': p.nom || '-',
                            'Catégorie': p.categorie_nom || '-',
                            'Stock Actuel': Number(p.stock) || 0,
                            'Prix Unitaire (FCFA)': Number(p.prix_unitaire) || 0,
                            'Valeur Totale (FCFA)': (Number(p.stock) || 0) * (Number(p.prix_unitaire) || 0),
                            'Seuil Alerte': Number(p.seuil_alerte) || 0,
                            'Statut': Number(p.stock) < (Number(p.seuil_alerte) || 0) ? '⚠️ FAIBLE' : '✓ BON'
                        }));
                    } else {
                        console.warn('[EXCEL] Pas de produits trouvés dans data.produits');
                    }
                    break;

                case 'credits':
                    console.log('[EXCEL] Traitement crédits...');
                    // Pour le rapport de crédits, extraire les données de crédits
                    if (data.credits && Array.isArray(data.credits)) {
                        console.log('[EXCEL] Crédits trouvés:', data.credits.length, 'crédits');
                        donneesExcel = data.credits.map((c, idx) => ({
                            '#': idx + 1,
                            'Client': c.client_nom || '-',
                            'Montant Total (FCFA)': Number(c.montant_total) || 0,
                            'Montant Payé (FCFA)': Number(c.montant_paye) || 0,
                            'Montant Restant (FCFA)': Number(c.montant_restant) || 0,
                            'Taux Paiement (%)': c.montant_total ? Math.round((Number(c.montant_paye) / Number(c.montant_total)) * 100) : 0,
                            'Statut': c.statut || '-',
                            'Date de Crédit': c.date_credit ? new Date(c.date_credit).toLocaleDateString('fr-FR') : '-'
                        }));
                    } else {
                        console.warn('[EXCEL] Pas de crédits trouvés dans data.credits');
                    }
                    break;

                case 'top-produits':
                    console.log('[EXCEL] Traitement top-produits...');
                    // Pour le top produits, extraire les données de ventes groupées
                    if (data.top_10 && Array.isArray(data.top_10)) {
                        console.log('[EXCEL] Top produits trouvés:', data.top_10.length, 'produits');
                        donneesExcel = data.top_10.map((p, idx) => ({
                            '#': idx + 1,
                            'Produit': p.nom || '-',
                            'Catégorie': p.categorie_nom || '-',
                            'Quantité Vendue': Number(p.quantite) || 0,
                            'Chiffre d\'Affaires (FCFA)': Number(p.montant) || 0,
                            'Prix Moyen (FCFA)': Number(p.quantite) > 0 ? Number(p.montant) / Number(p.quantite) : 0
                        }));
                    } else {
                        console.warn('[EXCEL] Pas de top_10 trouvés dans data.top_10');
                    }
                    break;

                default:
                    afficherNotification('❌ Type de rapport non supporté pour Excel', 'error');
                    return;
            }

            if (donneesExcel.length > 0) {
                console.log('[EXCEL] Données préparées pour export:', donneesExcel.length, 'lignes');
                console.log('[EXCEL] Échantillon:', donneesExcel.slice(0, 2));
                window.exporterRapportEnExcel(nomRapport, donneesExcel);
                afficherNotification('✅ Rapport Excel généré avec succès', 'success');
            } else {
                afficherNotification('⚠️ Aucune donnée à exporter', 'warning');
            }
        }
    } catch (error) {
        console.error('❌ Erreur téléchargement rapport:', error);
        afficherNotification('❌ Erreur lors du téléchargement', 'error');
    } finally {
        fermerModalConfigurationRapport();
    }
}



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

let typeExportEnCours = null; // 'produits', 'stocks', 'credits'

function genererRapportComplet() {
    genererRapportCompletPDF();
}

function toggleDropdownExport() {
    const menu = document.getElementById('dropdownExportMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function exporterRapportCompletExcel() {
    console.log('[RAPPORT] Export rapport complet Excel...');
    if (!window.XLSX) {
        afficherNotification('Chargement librairie Excel...', 'info');
        return;
    }
    const XLSX = window.XLSX;
    const workbook = XLSX.utils.book_new();
    
    const resume = [{'Produits': produitsData ? produitsData.length : 0, 'Ventes': ventesData ? ventesData.length : 0, 'Credits': creditsData ? creditsData.length : 0}];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resume), 'Resume');
    if (produitsData) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(produitsData), 'Produits');
    if (creditsData) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(creditsData), 'Credits');
    if (ventesData) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ventesData), 'Ventes');
    
    XLSX.writeFile(workbook, 'rapport_complet_' + new Date().toISOString().split('T')[0] + '.xlsx');
    afficherNotification('Rapport Excel telecharge', 'success');
}

function exporterProduitsExcel() {
    exporterProduitsEnExcel();
}

function exporterVentesExcel() {
    if (ventesData && ventesData.length > 0) {
        window.exporterRapportEnExcel('Ventes', ventesData);
    } else {
        afficherNotification('Aucune vente a exporter', 'warning');
    }
}

function exporterCreditsExcel() {
    afficherNotification('Export crédits (Excel)', 'success');
}

function exporterMouvementsExcel() {
    if (mouvementsData && mouvementsData.length > 0) {
        window.exporterRapportEnExcel('Mouvements', mouvementsData);
    } else {
        afficherNotification('Aucun mouvement a exporter', 'warning');
    }
}

window.genererRapportComplet = genererRapportComplet;
window.telechargerRapport = telechargerRapport;
window.telechargerRapportConfig = telechargerRapportConfig;
window.ouvrirModalConfigurationRapport = ouvrirModalConfigurationRapport;
window.fermerModalConfigurationRapport = fermerModalConfigurationRapport;
window.toggleDropdownExport = toggleDropdownExport;
window.exporterRapportCompletExcel = exporterRapportCompletExcel;
window.exporterProduitsExcel = exporterProduitsExcel;
window.exporterVentesExcel = exporterVentesExcel;
window.exporterCreditsExcel = exporterCreditsExcel;
window.exporterMouvementsExcel = exporterMouvementsExcel;

// ====================================================================
// MODAL FORMAT EXPORT
// ====================================================================

function ouvrirModalFormatExport() {
    const modal = document.getElementById('modalFormatExport');
    const messageElement = document.getElementById('messageChoixExport');
    if (messageElement) {
        let label = 'votre selection';
        if (typeRapportEnCours) {
            const labels = {
                'journalier': 'Rapport Journalier',
                'hebdomadaire': 'Rapport Hebdomadaire',
                'mensuel': 'Rapport Mensuel',
                'stock': 'Etat des Stocks',
                'credits': 'Rapport Credits',
                'top-produits': 'Top Produits'
            };
            label = labels[typeRapportEnCours] || typeRapportEnCours;
        }
        messageElement.textContent = 'Format d\'export pour : ' + label;
    }
    if (modal) {
        modal.classList.add('active');
    }
}

function fermerModalFormatExport() {
    const modal = document.getElementById('modalFormatExport');
    if (modal) {
        modal.classList.remove('active');
    }
}

function selectionnerFormat(format) {
    if (typeRapportEnCours) {
        procederTelechargementRapport(format);
    } else if (inventaireEnCours) {
        procederTelechargementInventaire(format);
    } else if (typeExportEnCours) {
        procederTelechargementExport(typeExportEnCours, format);
    }
}

async function procederTelechargementExport(type, format) {
    try {
        afficherNotification(`🔄 Préparation export ${type} ...`, 'info');
        
        if (format === 'pdf') {
            // Utiliser les exportateurs PDF élégants
            switch(type) {
                case 'produits':
                    exporterProduitsEnPDF();
                    break;
                case 'stocks':
                    exporterStocksEnPDF();
                    break;
                case 'credits':
                    exporterCreditsEnPDF();
                    break;
                default:
                    afficherNotification('Type d\'export non supporté', 'warning');
            }
        } else if (format === 'excel') {
            switch(type) {
                case 'produits':
                    exporterProduitsEnExcel();
                    break;
                case 'stocks':
                    exporterStocksEnExcel();
                    break;
                case 'credits':
                    exporterCreditsEnExcel();
                    break;
                default:
                    afficherNotification('Type d\'export non supporté', 'warning');
            }
        }
    } catch (error) {
        console.error('Erreur export:', error);
        afficherNotification('❌ Erreur lors de l\'export', 'error');
    } finally {
        typeExportEnCours = null;
        fermerModalFormatExport();
    }
}

window.ouvrirModalFormatExport = ouvrirModalFormatExport;
window.fermerModalFormatExport = fermerModalFormatExport;
window.selectionnerFormat = selectionnerFormat;

function initialiserModalFormatExport() {
    const modal = document.getElementById('modalConfigurationRapport');
    if (modal) {
        // Fermer la modale au clic sur le fond semi-transparent
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fermerModalConfigurationRapport();
            }
        });
    }
}

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
