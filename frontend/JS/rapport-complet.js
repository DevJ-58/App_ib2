/**
 * RAPPORT COMPLET - Combine tous les rapports en PDF A4
 */

/**
 * Generer rapport complet avec donnees temps reel
 */
function genererRapportCompletPDF() {
    console.log('[RAPPORT] Generation du rapport complet temps reel...');
    afficherNotification('Generation du rapport complet en cours...', 'info');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        let pageNum = 1;
        let yPos = 45;

        // ===== PAGE 1: EN-TETE ET RESUME =====
        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setFont('times', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('BOUTIQUE UIYA', 15, 12);
        
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('RAPPORT COMPLET', 15, 22);
        
        // Bande grise
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 30, 210, 10, 'F');
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Date: ' + new Date().toLocaleString('fr-FR'), 15, 37);
        doc.text('Heure: ' + new Date().toLocaleTimeString('fr-FR'), 140, 37);

        // RESUME GENERAL
        doc.setFillColor(255, 235, 238);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(211, 47, 47);
        doc.text('RESUME GENERAL', 17, yPos + 2);
        yPos += 12;

        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        // Statistiques principales
        const nbProduits = produitsData ? produitsData.length : 0;
        const nbVentes = ventesData ? ventesData.length : 0;
        const valeurStock = produitsData ? produitsData.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.prix_unitaire) || 0)), 0) : 0;
        const creditsTotaux = creditsData ? creditsData.reduce((sum, c) => sum + (Number(c.montant_total) || 0), 0) : 0;
        const creditsRemboursés = creditsData ? creditsData.reduce((sum, c) => sum + (Number(c.montant_paye) || 0), 0) : 0;

        doc.setFont('times', 'bold');
        doc.text('Nombre de produits:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(nbProduits + ' produits', 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Valeur total stock:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(formaterDevise(valeurStock), 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Nombre ventes:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(nbVentes + ' transactions', 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Credits accordes:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(formaterDevise(creditsTotaux), 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Credits remboursés:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(formaterDevise(creditsRemboursés), 85, yPos);
        yPos += 10;

        // ETAT DES STOCKS RESUME
        doc.setFillColor(255, 235, 238);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(211, 47, 47);
        doc.text('ETAT DES STOCKS', 17, yPos + 2);
        yPos += 12;

        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const stocksCritiques = produitsData ? produitsData.filter(p => p.stock < (p.seuil_alerte || 0) && p.stock > 0).length : 0;
        const ruptures = produitsData ? produitsData.filter(p => p.stock === 0).length : 0;
        const stocksNormaux = produitsData ? produitsData.filter(p => p.stock >= (p.seuil_alerte || 0)).length : 0;

        doc.setFont('times', 'bold');
        doc.text('Stocks normaux:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(stocksNormaux + ' produits', 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Stocks critiques:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(stocksCritiques + ' produits', 85, yPos);
        yPos += 6;

        doc.setFont('times', 'bold');
        doc.text('Ruptures de stock:', 20, yPos);
        doc.setFont('times', 'normal');
        doc.text(ruptures + ' produits', 85, yPos);

        // Footer page 1
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 280, 195, 280);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Boutique UIYA - Gestion de Stock', 15, 285);
        doc.text('Page 1', 185, 285);

        // ===== PAGE 2: LISTE DES PRODUITS =====
        doc.addPage();
        pageNum = 2;

        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('LISTE DES PRODUITS', 15, 12);

        yPos = 30;
        if (produitsData && produitsData.length > 0) {
            afficherTableauProduitsPDF(doc, produitsData, pageNum);
        }

        // ===== PAGE 3: CREDITS ET SUIVI =====
        doc.addPage();
        pageNum = 3;

        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('SUIVI DES CREDITS', 15, 12);

        yPos = 30;
        if (creditsData && creditsData.length > 0) {
            afficherTableauCreditsPDF(doc, creditsData, pageNum);
        }

        // Footer derniere page
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setDrawColor(200, 200, 200);
            doc.line(15, 280, 195, 280);
            doc.setFont('times', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Boutique UIYA - Gestion de Stock', 15, 285);
            doc.text('Page ' + i + '/' + totalPages, 180, 285);
        }

        doc.save('rapport_complet_' + new Date().toISOString().split('T')[0] + '.pdf');
        afficherNotification('✅ Rapport complet telecharge', 'success');

    } catch (error) {
        console.error('[RAPPORT] Erreur generation:', error);
        afficherNotification('❌ Erreur lors de la generation', 'error');
    }
}

/**
 * Afficher tableau produits
 */
function afficherTableauProduitsPDF(doc, donnees, pageNum) {
    const startX = 12;
    const colWidth = (210 - 24) / 4;
    let yPos = 35;
    let currentPage = pageNum;

    // En-tete
    doc.setFillColor(211, 47, 47);
    doc.rect(startX, yPos - 4, 186, 6, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    
    const headers = ['Produit', 'Categorie', 'P.U. (FCFA)', 'Stock'];
    const xPositions = [startX + 1, startX + 1 + colWidth, startX + 1 + (colWidth * 2), startX + 1 + (colWidth * 3)];
    headers.forEach((h, i) => doc.text(h, xPositions[i], yPos + 1));

    yPos += 8;

    // Donnees
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);

    donnees.forEach((row, idx) => {
        if (yPos > 270) {
            doc.addPage();
            currentPage++;
            yPos = 20;
        }

        if (idx % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(startX, yPos - 3, 186, 5, 'F');
        }

        doc.setTextColor(0, 0, 0);
        const nom = (row.nom || '').substring(0, 18);
        const cat = (row.categorie_nom || '').substring(0, 12);
        const pu = formaterDevise(Number(row.prix_unitaire) || 0);
        const stock = (row.stock || 0).toString();

        doc.text(nom, xPositions[0], yPos);
        doc.text(cat, xPositions[1], yPos);
        doc.text(pu, xPositions[2], yPos);
        doc.text(stock, xPositions[3], yPos);

        yPos += 5;
    });
}

/**
 * Afficher tableau credits
 */
function afficherTableauCreditsPDF(doc, donnees, pageNum) {
    const startX = 12;
    const colWidth = (210 - 24) / 4;
    let yPos = 35;
    let currentPage = pageNum;

    // En-tete
    doc.setFillColor(211, 47, 47);
    doc.rect(startX, yPos - 4, 186, 6, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    
    const headers = ['Client', 'Montant Total', 'Paye', 'Restant'];
    const xPositions = [startX + 1, startX + 1 + colWidth, startX + 1 + (colWidth * 2), startX + 1 + (colWidth * 3)];
    headers.forEach((h, i) => doc.text(h, xPositions[i], yPos + 1));

    yPos += 8;

    // Donnees
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);

    donnees.forEach((row, idx) => {
        if (yPos > 270) {
            doc.addPage();
            currentPage++;
            yPos = 20;
        }

        if (idx % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(startX, yPos - 3, 186, 5, 'F');
        }

        doc.setTextColor(0, 0, 0);
        const client = (row.client_nom || '').substring(0, 18);
        const total = formaterDevise(Number(row.montant_total) || 0);
        const paye = formaterDevise(Number(row.montant_paye) || 0);
        const restant = formaterDevise(Number(row.montant_restant) || 0);

        doc.text(client, xPositions[0], yPos);
        doc.text(total, xPositions[1], yPos);
        doc.text(paye, xPositions[2], yPos);
        doc.text(restant, xPositions[3], yPos);

        yPos += 5;
    });
}

// Exporter fonctions
window.genererRapportCompletPDF = genererRapportCompletPDF;
