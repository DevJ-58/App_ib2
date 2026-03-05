/**
 * EXPORT EXCEL PROFESSIONNEL - SheetJS/XLSX
 * Format professionnel avec en-têtes, formatage et ajustement des colonnes
 */

// Variable pour tracker si les données sont en cours de chargement
let chargementDonneesExportEnCours = false;

/**
 * Charger les données depuis l'API si non disponibles localement
 */
async function assurerDonneesProduitsDisponibles() {
    if (window.produitsData && window.produitsData.length > 0) {
        return window.produitsData;
    }
    
    if (chargementDonneesExportEnCours) {
        console.log('⏳ Chargement des produits en cours...');
        return [];
    }
    
    chargementDonneesExportEnCours = true;
    try {
        console.log('📥 Chargement des produits depuis l\'API...');
        const response = await fetch('/APP_IB/backend/Api/Products/export.php');
        const data = await response.json();
        
        if (data.success && data.data) {
            window.produitsData = data.data;
            console.log('✅ Produits chargés:', data.count, 'produits');
            return data.data;
        }
    } catch (error) {
        console.error('❌ Erreur chargement produits:', error);
    } finally {
        chargementDonneesExportEnCours = false;
    }
    
    return [];
}

/**
 * Charger les crédits depuis l'API si non disponibles localement
 */
async function assurerDonneesCreditsDisponibles() {
    if (window.creditsData && window.creditsData.length > 0) {
        return window.creditsData;
    }
    
    if (chargementDonneesExportEnCours) {
        console.log('⏳ Chargement des crédits en cours...');
        return [];
    }
    
    chargementDonneesExportEnCours = true;
    try {
        console.log('📥 Chargement des crédits depuis l\'API...');
        const response = await fetch('/APP_IB/backend/Api/Credits/export.php');
        const data = await response.json();
        
        if (data.success && data.data) {
            window.creditsData = data.data;
            console.log('✅ Crédits chargés:', data.count, 'crédits');
            return data.data;
        }
    } catch (error) {
        console.error('❌ Erreur chargement crédits:', error);
    } finally {
        chargementDonneesExportEnCours = false;
    }
    
    return [];
}

async function exporterProduitsEnExcel() {
    console.log('[EXCEL] Export produits...');
    
    const produits = await assurerDonneesProduitsDisponibles();
    if (!produits || produits.length === 0) {
        window.afficherNotification?.('⚠️ Aucun produit à exporter', 'warning');
        return;
    }

    const donnees = produits.map((p, idx) => ({
        '#': idx + 1,
        'Produit': p.nom || '-',
        'Catégorie': p.categorie_nom || '-',
        'Prix Unitaire (FCFA)': Number(p.prix_unitaire) || 0,
        'Stock Actuel': Number(p.stock) || 0,
        'Seuil Alerte': Number(p.seuil_alerte) || 0,
        'Statut': Number(p.stock) < (Number(p.seuil_alerte) || 0) ? '⚠️ ALERTE' : '✓ OK'
    }));

    creerFeuilleProfessionnelleExcel(donnees, 'LISTE DES PRODUITS', 'PRODUITS_' + dateEnFR());
}

/**
 * Exporter Rapports en Excel professionnel
 */
function exporterRapportEnExcel(nomRapport, donnees) {
    console.log('[EXCEL] Export rapport:', nomRapport);
    console.log('[EXCEL] Nombre de lignes:', donnees ? donnees.length : 0);
    
    if (!donnees || donnees.length === 0) {
        window.afficherNotification?.('⚠️ Aucune donnée à exporter', 'warning');
        return;
    }

    const donneeFormatee = donnees.map((d, idx) => ({
        '#': idx + 1,
        ...d
    }));

    creerFeuilleProfessionnelleExcel(donneeFormatee, nomRapport.toUpperCase(), nomRapport + '_' + dateEnFR());
}

/**
 * Créer une feuille Excel professionnelle avec formatage
 */
function creerFeuilleProfessionnelleExcel(donnees, titre, nomFichier, avecTotaux = false) {
    try {
        console.log('[EXCEL] Création feuille:', titre);
        
        // Charger la librairie SheetJS si non présente
        if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            
            script.onload = function() {
                creerFeuille(window.XLSX, donnees, titre, nomFichier);
            };
            
            script.onerror = function() {
                console.error('[EXCEL] Erreur chargement XLSX');
                window.afficherNotification?.('❌ Erreur lors du chargement de la librairie Excel', 'error');
            };
            
            document.head.appendChild(script);
        } else {
            creerFeuille(window.XLSX, donnees, titre, nomFichier);
        }
    } catch (err) {
        console.error('[EXCEL] Erreur:', err);
        window.afficherNotification?.('❌ Erreur lors de l\'export Excel', 'error');
    }
}

/**
 * Helper pour créer la feuille Excel
 */
function creerFeuille(XLSX, donnees, titre, nomFichier) {
    try {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(donnees);
        
        // Ajuster largeurs colonnes
        const colWidths = calculerLargeursColonnes(donnees);
        worksheet['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 2, 30) }));
        
        // Geler première ligne
        worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
        XLSX.writeFile(workbook, nomFichier + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
        
        console.log('[EXCEL] ✅ Fichier généré:', nomFichier);
        window.afficherNotification?.('✅ Fichier Excel ' + titre + ' téléchargé', 'success');
    } catch (err) {
        console.error('[EXCEL] Erreur création feuille:', err);
        window.afficherNotification?.('❌ Erreur lors de la création de la feuille Excel', 'error');
    }
}

/**
 * Calculer les largeurs de colonne
 */
function calculerLargeursColonnes(donnees) {
    if (!donnees || donnees.length === 0) return [];
    
    const firstRow = donnees[0];
    if (!firstRow) return [];
    
    return Object.keys(firstRow).map(key => {
        let maxLength = String(key).length;
        donnees.forEach(row => {
            const val = String(row[key] || '');
            if (val.length > maxLength) maxLength = val.length;
        });
        return Math.max(10, Math.min(maxLength, 25));
    });
}

/**
 * Obtenir date en format FR
 */
function dateEnFR() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ====================================================================
// EXPORT DES FONCTIONS POUR LES AUTRES MODULES
// ====================================================================

window.exporterRapportEnExcel = exporterRapportEnExcel;
window.exporterProduitsEnExcel = exporterProduitsEnExcel;
window.creerFeuilleProfessionnelleExcel = creerFeuilleProfessionnelleExcel;

/**
 * Exporter Stocks en Excel professionnel
 */
async function exporterStocksEnExcel() {
    console.log('[EXCEL] Export stocks...');
    
    const produits = await assurerDonneesProduitsDisponibles();
    if (!produits || produits.length === 0) {
        window.afficherNotification?.('⚠️ Aucun stock à exporter', 'warning');
        return;
    }

    const donnees = produits.map((p, idx) => {
        const valeur = (Number(p.stock) || 0) * (Number(p.prix_unitaire) || 0);
        return {
            '#': idx + 1,
            'Produit': p.nom || '-',
            'Catégorie': p.categorie_nom || '-',
            'Quantité': Number(p.stock) || 0,
            'Seuil Alerte': Number(p.seuil_alerte) || 0,
            'Statut Stock': Number(p.stock) < (Number(p.seuil_alerte) || 0) ? '⚠️ ALERTE' : '✓ OK',
            'Prix Unitaire (FCFA)': Number(p.prix_unitaire) || 0,
            'Valeur Total (FCFA)': valeur,
            'Code Barre': p.code_barre || '-'
        };
    });

    creerFeuilleProfessionnelleExcel(donnees, 'ÉTAT DES STOCKS', 'STOCKS_' + dateEnFR());
}

/**
 * Exporter Crédits en Excel professionnel
 */
async function exporterCreditsEnExcel() {
    console.log('[EXCEL] Export crédits...');
    
    const credits = await assurerDonneesCreditsDisponibles();
    if (!credits || credits.length === 0) {
        window.afficherNotification?.('⚠️ Aucun crédit à exporter', 'warning');
        return;
    }

    const donnees = credits.map((c, idx) => ({
        '#': idx + 1,
        'Client': c.client_nom || '-',
        'Téléphone': c.client_telephone || '-',
        'Type Client': c.type_client || '-',
        'Montant Total (FCFA)': Number(c.montant_total) || 0,
        'Montant Payé (FCFA)': Number(c.montant_paye) || 0,
        'Montant Restant (FCFA)': Number(c.montant_restant) || 0,
        'Statut': (c.statut || 'en_cours').toUpperCase(),
        'Taux Recouvrement (%)': Number(c.montant_total) > 0 ? ((Number(c.montant_paye) / Number(c.montant_total)) * 100).toFixed(2) : 0,
        'Date Crédit': c.date_credit ? new Date(c.date_credit).toLocaleDateString('fr-FR') : '-',
        'Notes': c.notes || '-'
    }));

    creerFeuilleProfessionnelleExcel(donnees, 'SUIVI DES CRÉDITS', 'CREDITS_' + dateEnFR());
}

window.exporterStocksEnExcel = exporterStocksEnExcel;
window.exporterCreditsEnExcel = exporterCreditsEnExcel;

