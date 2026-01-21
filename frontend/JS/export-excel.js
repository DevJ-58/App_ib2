// ====================================================================
// EXPORT-EXCEL.JS - Export de donnees en fichiers Excel
// ====================================================================

console.log('[OK] export-excel.js charge');

/**
 * Exporter les produits en Excel
 */
function exporterProduitsExcel() {
    console.log('[EXCEL] Export produits...');
    afficherNotification('Export produits en cours...', 'info');
    
    if (!produitsData || produitsData.length === 0) {
        afficherNotification('Aucun produit a exporter', 'warning');
        return;
    }
    
    // Preparer les donnees
    const donnees = produitsData.map((produit, index) => ({
        'N°': index + 1,
        'Nom': produit.nom,
        'Categorie': produit.categorie,
        'Prix Unitaire': formaterDeviseExcel(produit.prix_unitaire),
        'Stock Actuel': produit.stock || 0,
        'Seuil Alerte': produit.seuil_alerte || 0,
        'Valeur Stock': formaterDeviseExcel((produit.stock || 0) * (produit.prix_unitaire || 0)),
        'Statut': getStatutProduit(produit.stock, produit.seuil_alerte),
        'Date Ajout': formatDate(produit.date_creation)
    }));
    
    creerExcel(donnees, 'PRODUITS', 'produits_' + new Date().toISOString().split('T')[0]);
}

/**
 * Exporter les ventes en Excel
 */
function exporterVentesExcel() {
    console.log('[EXCEL] Export ventes...');
    afficherNotification('Export ventes en cours...', 'info');
    
    if (!ventesData || ventesData.length === 0) {
        afficherNotification('Aucune vente a exporter', 'warning');
        return;
    }
    
    const donnees = ventesData.map((vente, index) => ({
        'N°': index + 1,
        'Date': formatDate(vente.date_vente),
        'Reference': vente.reference,
        'Client': vente.client_nom || 'Client comptant',
        'Produit': vente.nom_produit,
        'Quantite': vente.quantite || 0,
        'P.U.': formaterDeviseExcel(vente.prix_unitaire),
        'Total': formaterDeviseExcel(vente.montant_total),
        'Type': vente.type_paiement === 'comptant' ? 'Comptant' : 'Credit',
        'Status': vente.statut || 'Confirmee'
    }));
    
    creerExcel(donnees, 'VENTES', 'ventes_' + new Date().toISOString().split('T')[0]);
}

/**
 * Exporter les credits en Excel
 */
function exporterCreditsExcel() {
    console.log('[EXCEL] Export credits...');
    afficherNotification('Export credits en cours...', 'info');
    
    if (!creditsData || creditsData.length === 0) {
        afficherNotification('Aucun credit a exporter', 'warning');
        return;
    }
    
    const donnees = creditsData.map((credit, index) => ({
        'N°': index + 1,
        'Reference': credit.reference,
        'Client': credit.client_nom,
        'Montant Accorde': formaterDeviseExcel(credit.montant_total),
        'Montant Paye': formaterDeviseExcel(credit.montant_paye),
        'Montant Restant': formaterDeviseExcel(credit.montant_restant),
        'Taux Interet': (credit.taux_interet || 0) + '%',
        'Date Accordage': formatDate(credit.date_accordage),
        'Date Echeance': formatDate(credit.date_echeance),
        'Statut': credit.statut === 'solde' ? 'Solde' : 'En cours',
        'Jours': Math.floor((new Date() - new Date(credit.date_accordage)) / (1000 * 60 * 60 * 24))
    }));
    
    creerExcel(donnees, 'CREDITS', 'credits_' + new Date().toISOString().split('T')[0]);
}

/**
 * Exporter les mouvements de stock en Excel
 */
function exporterMouvementsExcel() {
    console.log('[EXCEL] Export mouvements de stock...');
    afficherNotification('Export mouvements en cours...', 'info');
    
    if (!mouvementsData || mouvementsData.length === 0) {
        afficherNotification('Aucun mouvement a exporter', 'warning');
        return;
    }
    
    const donnees = mouvementsData.map((mouvement, index) => ({
        'N°': index + 1,
        'Date': formatDate(mouvement.date_mouvement),
        'Produit': mouvement.produit_nom || mouvement.nom_produit,
        'Type': mouvement.type === 'entree' ? 'Entree' : 'Sortie',
        'Quantite': mouvement.quantite || 0,
        'Stock Avant': mouvement.stock_avant || mouvement.ancien_stock || 0,
        'Stock Apres': mouvement.stock_apres || mouvement.nouveau_stock || 0,
        'Raison': mouvement.motif || mouvement.raison || '',
        'Utilisateur': mouvement.utilisateur_nom || mouvement.utilisateur || ''
    }));
    
    creerExcel(donnees, 'MOUVEMENTS', 'mouvements_' + new Date().toISOString().split('T')[0]);
}

/**
 * Exporter inventaire en Excel (alias pour mouvements)
 */
function exporterInventaireExcel() {
    console.log('[EXCEL] Export inventaire...');
    exporterMouvementsExcel();
}

/**
 * Exporter un rapport complet en Excel multi-feuilles
 */
function exporterRapportCompletExcel() {
    console.log('[EXCEL] Export rapport complet multi-feuilles...');
    afficherNotification('Generation du rapport Excel en cours...', 'info');
    
    Promise.all([
        genererRapportMensuel(),
        genererRapportStocks(),
        genererRapportCredits(),
        genererRapportTopProduits()
    ]).then(rapports => {
        // Creer le workbook
        const wb = XLSX.utils.book_new();
        
        // Feuille 1: Resume General
        const resumeData = [
            { 'Indicateur': 'Ventes Totales', 'Valeur': formaterDeviseExcel(rapports[0]?.ventes?.montant || 0) },
            { 'Indicateur': 'Nombre de Ventes', 'Valeur': rapports[0]?.ventes?.nombre || 0 },
            { 'Indicateur': 'Panier Moyen', 'Valeur': formaterDeviseExcel(rapports[0]?.ventes?.panier_moyen || 0) },
            { 'Indicateur': 'Credits Accordes', 'Valeur': formaterDeviseExcel(rapports[0]?.credits?.accordes || 0) },
            { 'Indicateur': 'Valeur Stock', 'Valeur': formaterDeviseExcel(rapports[1]?.resume?.valeur_totale || 0) },
            { 'Indicateur': 'Nombre Produits', 'Valeur': rapports[1]?.resume?.nombre_produits || 0 },
            { 'Indicateur': 'Produits Critiques', 'Valeur': rapports[1]?.resume?.critiques || 0 },
            { 'Indicateur': 'Credits en Cours', 'Valeur': rapports[2]?.resume?.credits_en_cours || 0 },
            { 'Indicateur': 'Taux Recouvrement', 'Valeur': (rapports[2]?.resume?.taux_recouvrement || 0) + '%' }
        ];
        const ws1 = XLSX.utils.json_to_sheet(resumeData);
        ajusterLargeurColonnes(ws1, [30, 20]);
        XLSX.utils.book_append_sheet(wb, ws1, 'Resume');
        
        // Feuille 2: Rapport Mensuel
        const mensuelData = [
            { 'Categorie': 'VENTES', 'Metrique': 'Nombre de transactions', 'Valeur': rapports[0]?.ventes?.nombre || 0 },
            { 'Categorie': 'VENTES', 'Metrique': 'Montant total', 'Valeur': formaterDeviseExcel(rapports[0]?.ventes?.montant || 0) },
            { 'Categorie': 'VENTES', 'Metrique': 'Panier moyen', 'Valeur': formaterDeviseExcel(rapports[0]?.ventes?.panier_moyen || 0) },
            { 'Categorie': 'CREDITS', 'Metrique': 'Credits accordes', 'Valeur': formaterDeviseExcel(rapports[0]?.credits?.accordes || 0) },
            { 'Categorie': 'CREDITS', 'Metrique': 'Nombre de credits', 'Valeur': rapports[0]?.credits?.nombre || 0 },
            { 'Categorie': 'STOCKS', 'Metrique': 'Entrees', 'Valeur': (rapports[0]?.stocks?.entrees || 0) + ' unites' },
            { 'Categorie': 'STOCKS', 'Metrique': 'Sorties', 'Valeur': (rapports[0]?.stocks?.sorties || 0) + ' unites' }
        ];
        const ws2 = XLSX.utils.json_to_sheet(mensuelData);
        ajusterLargeurColonnes(ws2, [15, 25, 20]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Mensuel');
        
        // Feuille 3: Etat des Stocks
        const stocksData = [];
        if (rapports[1]?.resume) {
            stocksData.push({
                'Type': 'RESUME',
                'Info': 'Valeur totale',
                'Donnee': formaterDeviseExcel(rapports[1].resume.valeur_totale)
            });
            stocksData.push({
                'Type': 'RESUME',
                'Info': 'Nombre de produits',
                'Donnee': rapports[1].resume.nombre_produits
            });
            stocksData.push({
                'Type': 'RESUME',
                'Info': 'Stock sain',
                'Donnee': rapports[1].resume.stock_sain
            });
            stocksData.push({
                'Type': 'RESUME',
                'Info': 'Produits critiques',
                'Donnee': rapports[1].resume.critiques
            });
            stocksData.push({
                'Type': 'RESUME',
                'Info': 'Produits en rupture',
                'Donnee': rapports[1].resume.rupture
            });
        }
        
        if (rapports[1]?.produits_critiques && rapports[1].produits_critiques.length > 0) {
            rapports[1].produits_critiques.forEach((produit, idx) => {
                stocksData.push({
                    'Type': 'CRITIQUE #' + (idx + 1),
                    'Info': produit.nom,
                    'Donnee': 'Stock: ' + produit.stock + ' / Seuil: ' + produit.seuil + ' / Valeur: ' + formaterDeviseExcel(produit.valeur)
                });
            });
        }
        
        const ws3 = XLSX.utils.json_to_sheet(stocksData);
        ajusterLargeurColonnes(ws3, [15, 20, 40]);
        XLSX.utils.book_append_sheet(wb, ws3, 'Stocks');
        
        // Feuille 4: Top 10 Produits
        const top10Data = [];
        if (rapports[3]?.top_10 && rapports[3].top_10.length > 0) {
            rapports[3].top_10.forEach((produit, idx) => {
                top10Data.push({
                    'Rang': idx + 1,
                    'Nom': produit.nom,
                    'Chiffre Affaires': formaterDeviseExcel(produit.montant),
                    'Quantite': produit.quantite,
                    'Nombre Ventes': produit.nombre_ventes
                });
            });
        }
        
        const ws4 = XLSX.utils.json_to_sheet(top10Data);
        ajusterLargeurColonnes(ws4, [8, 20, 20, 12, 15]);
        XLSX.utils.book_append_sheet(wb, ws4, 'Top 10');
        
        // Feuille 5: Credits
        const creditsExcelData = [];
        if (rapports[2]?.resume) {
            creditsExcelData.push({
                'Metrique': 'Montant total accorde',
                'Valeur': formaterDeviseExcel(rapports[2].resume.montant_total)
            });
            creditsExcelData.push({
                'Metrique': 'Montant rembourse',
                'Valeur': formaterDeviseExcel(rapports[2].resume.montant_rembourse)
            });
            creditsExcelData.push({
                'Metrique': 'Montant restant',
                'Valeur': formaterDeviseExcel(rapports[2].resume.montant_restant)
            });
            creditsExcelData.push({
                'Metrique': 'Taux de recouvrement',
                'Valeur': (rapports[2].resume.taux_recouvrement || 0) + '%'
            });
            creditsExcelData.push({
                'Metrique': 'Credits soldes',
                'Valeur': rapports[2].resume.credits_soldes
            });
            creditsExcelData.push({
                'Metrique': 'Credits en cours',
                'Valeur': rapports[2].resume.credits_en_cours
            });
        }
        
        const ws5 = XLSX.utils.json_to_sheet(creditsExcelData);
        ajusterLargeurColonnes(ws5, [25, 20]);
        XLSX.utils.book_append_sheet(wb, ws5, 'Credits');
        
        // Telecharger le fichier
        const nomFichier = 'rapport_complet_' + new Date().toISOString().split('T')[0] + '.xlsx';
        XLSX.writeFile(wb, nomFichier);
        afficherNotification('Rapport Excel genere et telecharge', 'success');
        console.log('[EXCEL] Rapport complete telecharge:', nomFichier);
        
    }).catch(error => {
        console.error('[ERROR] Erreur export Excel:', error);
        afficherNotification('Erreur lors de la generation du rapport Excel', 'error');
    });
}

/**
 * Creer un fichier Excel simple
 */
function creerExcel(donnees, nomFeuille, nomFichier) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(donnees);
    
    // Ajuster les largeurs de colonnes
    const maxLengths = {};
    donnees.forEach(row => {
        Object.keys(row).forEach(key => {
            maxLengths[key] = Math.max(
                maxLengths[key] || 0,
                String(row[key] || '').length,
                key.length
            );
        });
    });
    
    ws['!cols'] = Object.keys(donnees[0] || {}).map(key => ({
        wch: Math.min(maxLengths[key] + 2, 50)
    }));
    
    XLSX.utils.book_append_sheet(wb, ws, nomFeuille);
    XLSX.writeFile(wb, nomFichier + '.xlsx');
    afficherNotification('Fichier ' + nomFichier + '.xlsx telecharge', 'success');
    console.log('[EXCEL] Fichier telecharge:', nomFichier);
}

/**
 * Ajuster les largeurs de colonnes
 */
function ajusterLargeurColonnes(ws, largeurs) {
    ws['!cols'] = largeurs.map(largeur => ({ wch: largeur }));
}

/**
 * Formater devise pour Excel
 */
function formaterDeviseExcel(montant) {
    // Formater le montant en nombre entier sans décimales
    const montantNum = Math.round(Number(montant) || 0);
    const montantStr = montantNum.toString();
    // Ajouter des espaces simples comme séparateurs de milliers de droite à gauche
    const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return montantFormate + ' FCFA';
}

/**
 * Obtenir le statut d'un produit
 */
function getStatutProduit(stock, seuil) {
    if (stock === 0) return 'Rupture';
    if (stock < seuil) return 'Critique';
    return 'OK';
}

/**
 * Formater une date
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

/**
 * Exporter l'état des stocks en Excel
 */
function exporterStockExcel() {
    console.log('[EXCEL] Export état des stocks...');
    afficherNotification('Export état des stocks en cours...', 'info');
    
    if (!produitsData || produitsData.length === 0) {
        afficherNotification('Aucun produit a exporter', 'warning');
        return;
    }
    
    // Preparer les donnees avec les bonnes colonnes
    const donnees = produitsData.map((produit, index) => {
        const seuil = produit.seuil_alerte || produit.seuilAlerte || 0;
        const stock = produit.stock || 0;
        let etat = 'Bon';
        if (stock === 0) etat = 'Rupture';
        else if (stock < seuil) etat = 'Critique';
        else if (stock < seuil * 1.5) etat = 'Moyen';
        
        return {
            'N°': index + 1,
            'Produit': produit.nom,
            'Categorie': produit.categorie,
            'Stock Actuel': stock,
            'Seuil Alerte': seuil,
            'État': etat,
            'Valeur Stock': formaterDeviseExcel((stock || 0) * (produit.prix_unitaire || 0))
        };
    });
    
    creerExcel(donnees, 'ÉTAT DES STOCKS', 'etat_stocks_' + new Date().toISOString().split('T')[0]);
}
