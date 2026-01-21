// ====================================================================
// PDF-REPORTS.JS - Generation de rapports PDF stylises
// ====================================================================

console.log('[OK] pdf-reports.js charge');

/**
 * Ajouter en-tete professionnel
 */
function ajouterEnTetePDF(doc, titre, periode = '') {
    // Couleur header
    doc.setFillColor(211, 47, 47); // Rouge professionnel
    doc.rect(0, 0, 210, 30, 'F');
    
    // Texte header
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('BOUTIQUE UIYA', 15, 12);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(titre, 15, 22);
    
    // Bande grise sous header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 30, 210, 10, 'F');
    
    // Texte infos
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    if (periode) {
        doc.text('Periode: ' + periode, 15, 37);
    }
    doc.text('Date generation: ' + new Date().toLocaleString('fr-FR'), 140, 37);
    
    // Retourner Y position apres header
    return 45;
}

/**
 * Ajouter footer professionnel
 */
function ajouterFooterPDF(doc, pageNum, totalPages) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Ligne separatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    
    // Texte footer
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    doc.text('Boutique UIYA - Gestion de Stock', 15, pageHeight - 10);
    doc.text('Page ' + pageNum + ' / ' + totalPages, pageWidth - 40, pageHeight - 10);
}

/**
 * Ajouter titre de section avec fond colore
 */
function ajouterTitreSection(doc, titre, yPos) {
    doc.setFillColor(255, 235, 238); // Rose clair
    doc.rect(15, yPos - 5, 180, 8, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47); // Rouge
    doc.text(titre, 17, yPos + 2);
    
    return yPos + 12;
}

/**
 * Ajouter ligne d'information
 */
function ajouterLigneInfo(doc, label, valeur, yPos, labelWidth = 70) {
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(label + ':', 20, yPos);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(String(valeur), 20 + labelWidth, yPos);
    
    return yPos + 6;
}

/**
 * Generer PDF rapport journalier
 */
function genererPDFRapportJournalier(rapport) {
    console.log('[PDF] Generation rapport journalier...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'RAPPORT JOURNALIER', rapport.date);
    let pageNum = 1;
    
    // Section Ventes
    yPos = ajouterTitreSection(doc, 'RECAPITULATIF VENTES', yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de transactions', rapport.ventes.nombre, yPos);
    yPos = ajouterLigneInfo(doc, 'Montant total', formaterDevise(rapport.ventes.montant), yPos);
    yPos = ajouterLigneInfo(doc, 'Panier moyen', formaterDevise(rapport.ventes.panier_moyen), yPos);
    
    // Section Credits
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'MOUVEMENTS DE CREDITS', yPos);
    yPos = ajouterLigneInfo(doc, 'Credits accordes', formaterDevise(rapport.credits.accordes), yPos);
    yPos = ajouterLigneInfo(doc, 'Remboursements recus', formaterDevise(rapport.credits.remboursements), yPos);
    
    // Resume
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'RESUME FINANCIER', yPos);
    yPos = ajouterLigneInfo(doc, 'Recettes totales', formaterDevise(rapport.resume.recettes_total), yPos);
    yPos = ajouterLigneInfo(doc, 'Ventes comptant', formaterDevise(rapport.resume.ventes_comptant), yPos);
    yPos = ajouterLigneInfo(doc, 'Credits accordes', formaterDevise(rapport.resume.credits_accordes), yPos);
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Generer PDF rapport hebdomadaire
 */
function genererPDFRapportHebdomadaire(rapport) {
    console.log('[PDF] Generation rapport hebdomadaire...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'RAPPORT HEBDOMADAIRE', rapport.periode);
    let pageNum = 1;
    
    // Section Ventes
    yPos = ajouterTitreSection(doc, 'VENTES DE LA SEMAINE', yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de ventes', rapport.ventes.nombre, yPos);
    yPos = ajouterLigneInfo(doc, 'Montant total', formaterDevise(rapport.ventes.montant), yPos);
    yPos = ajouterLigneInfo(doc, 'Panier moyen', formaterDevise(rapport.ventes.panier_moyen), yPos);
    
    // Section Credits
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'MOUVEMENTS DE CREDITS', yPos);
    yPos = ajouterLigneInfo(doc, 'Montant accorde', formaterDevise(rapport.credits.accordes), yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de credits', rapport.credits.nombre, yPos);
    
    // Section Stocks
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'MOUVEMENTS DE STOCKS', yPos);
    yPos = ajouterLigneInfo(doc, 'Entrees', rapport.stocks.entrees + ' unites', yPos);
    yPos = ajouterLigneInfo(doc, 'Sorties', rapport.stocks.sorties + ' unites', yPos);
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Generer PDF rapport mensuel
 */
function genererPDFRapportMensuel(rapport) {
    console.log('[PDF] Generation rapport mensuel...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'RAPPORT MENSUEL', rapport.periode);
    let pageNum = 1;
    
    // Section Ventes
    yPos = ajouterTitreSection(doc, 'VENTES DU MOIS', yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de transactions', rapport.ventes.nombre, yPos);
    yPos = ajouterLigneInfo(doc, 'Montant total', formaterDevise(rapport.ventes.montant), yPos);
    yPos = ajouterLigneInfo(doc, 'Panier moyen', formaterDevise(rapport.ventes.panier_moyen), yPos);
    
    // Section Credits
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'CREDITS DU MOIS', yPos);
    yPos = ajouterLigneInfo(doc, 'Montant total accorde', formaterDevise(rapport.credits.accordes), yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de credits', rapport.credits.nombre, yPos);
    
    // Section Stocks
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'MOUVEMENTS DE STOCKS', yPos);
    yPos = ajouterLigneInfo(doc, 'Entrees totales', rapport.stocks.entrees + ' unites', yPos);
    yPos = ajouterLigneInfo(doc, 'Sorties totales', rapport.stocks.sorties + ' unites', yPos);
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Generer PDF rapport stocks
 */
function genererPDFRapportStocks(rapport) {
    console.log('[PDF] Generation rapport stocks...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'ETAT DES STOCKS', rapport.date);
    let pageNum = 1;
    
    // Section Resume
    yPos = ajouterTitreSection(doc, 'RESUME GLOBAL', yPos);
    yPos = ajouterLigneInfo(doc, 'Valeur totale stocks', formaterDevise(rapport.resume.valeur_totale), yPos);
    yPos = ajouterLigneInfo(doc, 'Nombre de produits', rapport.resume.nombre_produits, yPos);
    yPos = ajouterLigneInfo(doc, 'Produits en stock sain', rapport.resume.stock_sain, yPos);
    
    // Section Alertes
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'ALERTES STOCK', yPos);
    yPos = ajouterLigneInfo(doc, 'Produits critiques', rapport.resume.critiques, yPos);
    yPos = ajouterLigneInfo(doc, 'Produits en rupture', rapport.resume.rupture, yPos);
    
    // Liste produits critiques
    if (rapport.produits_critiques && rapport.produits_critiques.length > 0) {
        yPos += 5;
        yPos = ajouterTitreSection(doc, 'DETAIL PRODUITS CRITIQUES', yPos);
        
        rapport.produits_critiques.forEach((produit, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
                ajouterFooterPDF(doc, pageNum, 1);
                pageNum++;
                doc.setPage(pageNum);
                yPos = ajouterEnTetePDF(doc, 'ETAT DES STOCKS (suite)', rapport.date);
            }
            
            doc.setFont('times', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(211, 47, 47);
            doc.text((index + 1) + '. ' + produit.nom, 20, yPos);
            yPos += 5;
            
            doc.setFont('times', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.text('Stock: ' + produit.stock + ' / Seuil alerte: ' + produit.seuil, 25, yPos);
            yPos += 4;
            doc.text('Valeur: ' + formaterDevise(produit.valeur), 25, yPos);
            yPos += 6;
        });
    }
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Generer PDF rapport credits
 */
function genererPDFRapportCredits(rapport) {
    console.log('[PDF] Generation rapport credits...');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'RAPPORT CREDITS', rapport.date);
    let pageNum = 1;
    
    // Section Resume
    yPos = ajouterTitreSection(doc, 'RESUME FINANCIER', yPos);
    yPos = ajouterLigneInfo(doc, 'Montant total accorde', formaterDevise(rapport.resume.montant_total), yPos);
    yPos = ajouterLigneInfo(doc, 'Montant rembourse', formaterDevise(rapport.resume.montant_rembourse), yPos);
    yPos = ajouterLigneInfo(doc, 'Montant restant', formaterDevise(rapport.resume.montant_restant), yPos);
    yPos = ajouterLigneInfo(doc, 'Taux de recouvrement', rapport.resume.taux_recouvrement + '%', yPos);
    
    // Section Status
    yPos += 5;
    yPos = ajouterTitreSection(doc, 'STATUS DES CREDITS', yPos);
    yPos = ajouterLigneInfo(doc, 'Credits soldes', rapport.resume.credits_soldes, yPos);
    yPos = ajouterLigneInfo(doc, 'Credits en cours', rapport.resume.credits_en_cours, yPos);
    
    // Credits impayees
    if (rapport.credits_impayees && rapport.credits_impayees.length > 0) {
        yPos += 5;
        yPos = ajouterTitreSection(doc, 'CREDITS IMPAYEES', yPos);
        
        rapport.credits_impayees.forEach((credit, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
                ajouterFooterPDF(doc, pageNum, 1);
                pageNum++;
                doc.setPage(pageNum);
                yPos = ajouterEnTetePDF(doc, 'RAPPORT CREDITS (suite)', rapport.date);
            }
            
            doc.setFont('times', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(211, 47, 47);
            doc.text((index + 1) + '. ' + credit.client, 20, yPos);
            yPos += 5;
            
            doc.setFont('times', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.text('Montant: ' + formaterDevise(credit.montant) + ' | Jours: ' + credit.jours, 25, yPos);
            yPos += 6;
        });
    }
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Generer PDF top produits
 */
function genererPDFRapportTopProduits(rapport) {
    console.log('[PDF] Generation top produits...', rapport);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = ajouterEnTetePDF(doc, 'TOP 10 PRODUITS', rapport.date || new Date().toLocaleDateString('fr-FR'));
    let pageNum = 1;
    
    // Vérifier s'il y a des données
    if (!rapport.top_10 || rapport.top_10.length === 0) {
        yPos = ajouterTitreSection(doc, 'AUCUNE DONNÉE', yPos);
        yPos += 10;
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Aucune vente enregistrée pour la période sélectionnée', 20, yPos);
        ajouterFooterPDF(doc, pageNum, 1);
        return doc;
    }
    
    // En-tete tableau
    yPos = ajouterTitreSection(doc, 'CLASSEMENT PAR CHIFFRE D AFFAIRES', yPos);
    
    // Lignes tableau
    yPos += 3;
    doc.setFillColor(211, 47, 47);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Rang', 20, yPos);
    doc.text('Produit', 35, yPos);
    doc.text('Montant', 110, yPos);
    doc.text('Quantite', 155, yPos);
    doc.text('Ventes', 185, yPos);
    
    yPos += 7;
    
    // Donnees
    rapport.top_10.forEach((produit, index) => {
        if (yPos > 250) {
            doc.addPage();
            ajouterFooterPDF(doc, pageNum, 1);
            pageNum++;
            doc.setPage(pageNum);
            yPos = ajouterEnTetePDF(doc, 'TOP 10 PRODUITS (suite)', rapport.date || '');
            yPos += 5;
        }
        
        // Alternance couleur de fond
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(15, yPos - 4, 180, 6, 'F');
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        const rang = index + 1;
        const nom = produit.nom.length > 20 ? produit.nom.substring(0, 20) + '...' : produit.nom;
        const montant = formaterDevise(produit.montant);
        const quantite = produit.quantite;
        const ventes = produit.nombre_ventes;
        
        doc.text(rang.toString(), 20, yPos);
        doc.text(nom, 35, yPos);
        doc.text(montant, 110, yPos);
        doc.text(quantite.toString(), 155, yPos);
        doc.text(ventes.toString(), 185, yPos);
        
        yPos += 7;
    });
    
    ajouterFooterPDF(doc, pageNum, 1);
    return doc;
}

/**
 * Exporter PDF
 */
function exporterPDF(doc, nom_fichier) {
    console.log('[PDF] Export:', nom_fichier);
    doc.save(nom_fichier + '.pdf');
    afficherNotification('Rapport ' + nom_fichier + ' telecharge en PDF', 'success');
}

/**
 * Formater une valeur en devise FCFA (format simple: 1 500 000 FCFA)
 */
function formaterDevise(montant) {
    // Formater le montant en nombre entier sans décimales
    const montantNum = Math.round(Number(montant) || 0);
    const montantStr = montantNum.toString();
    // Ajouter des espaces simples comme séparateurs de milliers de droite à gauche
    const montantFormate = montantStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return montantFormate + ' FCFA';
}

/**
 * Exporter PDF Produits
 */
function exporterPDFProduits() {
    console.log('[PDF] Export produits en PDF...');
    afficherNotification('Generation PDF produits en cours...', 'info');
    
    if (!produitsData || produitsData.length === 0) {
        afficherNotification('Aucun produit a exporter', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = ajouterEnTetePDF(doc, 'LISTE COMPLETE DES PRODUITS', new Date().toLocaleDateString('fr-FR'));
    let pageNum = 1;
    
    yPos = ajouterTitreSection(doc, 'INVENTAIRE PRODUITS', yPos);
    
    // En-tete tableau
    yPos += 3;
    doc.setFillColor(211, 47, 47);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('N', 20, yPos);
    doc.text('Produit', 35, yPos);
    doc.text('Categorie', 85, yPos);
    doc.text('Stock', 130, yPos);
    doc.text('P.U.', 150, yPos);
    doc.text('Total', 170, yPos);
    
    yPos += 7;
    
    // Donnees
    produitsData.forEach((produit, index) => {
        if (yPos > 250) {
            doc.addPage();
            pageNum++;
            yPos = ajouterEnTetePDF(doc, 'LISTE COMPLETE DES PRODUITS (suite)', new Date().toLocaleDateString('fr-FR'));
            ajouterFooterPDF(doc, pageNum, 1);
        }
        
        // Alternance couleur
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(15, yPos - 4, 180, 6, 'F');
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        const nom = String(produit.nom).substring(0, 30);
        const cat = String(produit.categorie).substring(0, 15);
        const stock = Number(produit.stock || 0);
        const prix = formaterDevise(Number(produit.prix_unitaire || 0));
        const total = formaterDevise(stock * Number(produit.prix_unitaire || 0));
        
        doc.text((index + 1).toString(), 20, yPos);
        doc.text(nom, 35, yPos);
        doc.text(cat, 85, yPos);
        doc.text(stock.toString(), 130, yPos);
        doc.text(prix, 150, yPos);
        doc.text(total, 170, yPos);
        
        yPos += 6;
    });
    
    ajouterFooterPDF(doc, pageNum, 1);
    doc.save('produits_' + new Date().toISOString().split('T')[0] + '.pdf');
    afficherNotification('PDF produits telecharge', 'success');
}

/**
 * Exporter PDF Credits
 */
function exporterPDFCredits() {
    console.log('[PDF] Export credits en PDF...');
    afficherNotification('Generation PDF credits en cours...', 'info');
    
    if (!creditsData || creditsData.length === 0) {
        afficherNotification('Aucun credit a exporter', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = ajouterEnTetePDF(doc, 'SUIVI COMPLET DES CREDITS', new Date().toLocaleDateString('fr-FR'));
    let pageNum = 1;
    
    yPos = ajouterTitreSection(doc, 'DETAIL DES CREDITS ACCORDES', yPos);
    
    // En-tete tableau
    yPos += 3;
    doc.setFillColor(211, 47, 47);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('N', 20, yPos);
    doc.text('Client', 35, yPos);
    doc.text('Montant', 85, yPos);
    doc.text('Paye', 115, yPos);
    doc.text('Restant', 145, yPos);
    doc.text('Status', 175, yPos);
    
    yPos += 7;
    
    // Donnees
    creditsData.forEach((credit, index) => {
        if (yPos > 250) {
            doc.addPage();
            pageNum++;
            yPos = ajouterEnTetePDF(doc, 'SUIVI COMPLET DES CREDITS (suite)', new Date().toLocaleDateString('fr-FR'));
            ajouterFooterPDF(doc, pageNum, 1);
        }
        
        // Alternance couleur
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(15, yPos - 4, 180, 6, 'F');
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        const client = String(credit.client_nom).substring(0, 25);
        const montant = formaterDevise(Number(credit.montant_total || 0));
        const paye = formaterDevise(Number(credit.montant_paye || 0));
        const restant = formaterDevise(Number(credit.montant_restant || 0));
        const status = credit.statut === 'solde' ? 'Solde' : 'En cours';
        
        doc.text((index + 1).toString(), 20, yPos);
        doc.text(client, 35, yPos);
        doc.text(montant, 85, yPos);
        doc.text(paye, 115, yPos);
        doc.text(restant, 145, yPos);
        doc.text(status, 175, yPos);
        
        yPos += 6;
    });
    
    ajouterFooterPDF(doc, pageNum, 1);
    doc.save('credits_' + new Date().toISOString().split('T')[0] + '.pdf');
    afficherNotification('PDF credits telecharge', 'success');
}

/**
 * Exporter PDF Inventaire
 */
function exporterPDFInventaire() {
    console.log('[PDF] Export inventaire en PDF...');
    afficherNotification('Generation PDF inventaire en cours...', 'info');
    
    if (!mouvementsData || mouvementsData.length === 0) {
        afficherNotification('Aucun mouvement a exporter', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = ajouterEnTetePDF(doc, 'HISTORIQUE DES MOUVEMENTS DE STOCK', new Date().toLocaleDateString('fr-FR'));
    let pageNum = 1;
    
    yPos = ajouterTitreSection(doc, 'MOUVEMENTS DE STOCK DETAILLES', yPos);
    
    // En-tete tableau
    yPos += 3;
    doc.setFillColor(211, 47, 47);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Date', 20, yPos);
    doc.text('Produit', 45, yPos);
    doc.text('Type', 85, yPos);
    doc.text('Qte', 105, yPos);
    doc.text('Avant', 125, yPos);
    doc.text('Apres', 145, yPos);
    doc.text('Raison', 165, yPos);
    
    yPos += 7;
    
    // Donnees
    mouvementsData.forEach((mouvement, index) => {
        if (yPos > 250) {
            doc.addPage();
            pageNum++;
            yPos = ajouterEnTetePDF(doc, 'HISTORIQUE MOUVEMENTS (suite)', new Date().toLocaleDateString('fr-FR'));
            ajouterFooterPDF(doc, pageNum, 1);
        }
        
        // Alternance couleur
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(15, yPos - 4, 180, 6, 'F');
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        
        const date = new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR');
        const produit = String(mouvement.produit_nom || mouvement.nom_produit || 'Produit inconnu').substring(0, 20);
        const type = mouvement.type === 'entree' ? 'Entree' : 'Sortie';
        const qte = Number(mouvement.quantite || 0);
        const avant = Number(mouvement.stock_avant || mouvement.ancien_stock || 0);
        const apres = Number(mouvement.stock_apres || mouvement.nouveau_stock || 0);
        const raison = String(mouvement.motif || mouvement.raison || '').substring(0, 15);
        
        doc.text(date, 20, yPos);
        doc.text(produit, 45, yPos);
        doc.text(type, 85, yPos);
        doc.text(qte.toString(), 105, yPos);
        doc.text(avant.toString(), 125, yPos);
        doc.text(apres.toString(), 145, yPos);
        doc.text(raison, 165, yPos);
        
        yPos += 5;
    });
    
    ajouterFooterPDF(doc, pageNum, 1);
    doc.save('inventaire_' + new Date().toISOString().split('T')[0] + '.pdf');
    afficherNotification('PDF inventaire telecharge', 'success');
}

/**
 * Exporter l'état des stocks en PDF
 */
function exporterPDFStock() {
    console.log('[PDF] Export état des stocks en PDF...');
    afficherNotification('Generation PDF stocks en cours...', 'info');
    
    if (!produitsData || produitsData.length === 0) {
        afficherNotification('Aucun produit a exporter', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = ajouterEnTetePDF(doc, 'ÉTAT DES STOCKS', new Date().toLocaleDateString('fr-FR'));
    let pageNum = 1;
    
    yPos = ajouterTitreSection(doc, 'INVENTAIRE STOCKS ACTUELS', yPos);
    
    // En-tete tableau
    yPos += 3;
    doc.setFillColor(33, 150, 243);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('N', 20, yPos);
    doc.text('Produit', 35, yPos);
    doc.text('Categorie', 85, yPos);
    doc.text('Stock', 120, yPos);
    doc.text('Seuil', 140, yPos);
    doc.text('Etat', 165, yPos);
    
    yPos += 7;
    
    // Donnees
    produitsData.forEach((produit, index) => {
        if (yPos > 250) {
            doc.addPage();
            pageNum++;
            yPos = ajouterEnTetePDF(doc, 'ÉTAT DES STOCKS (suite)', new Date().toLocaleDateString('fr-FR'));
            ajouterFooterPDF(doc, pageNum, 1);
        }
        
        // Alternance couleur
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(15, yPos - 4, 180, 6, 'F');
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        const seuil = produit.seuil_alerte || produit.seuilAlerte || 0;
        const stock = produit.stock || 0;
        
        let etat = 'Bon';
        if (stock === 0) etat = 'Rupture';
        else if (stock < seuil) etat = 'Critique';
        else if (stock < seuil * 1.5) etat = 'Moyen';
        
        doc.text((index + 1).toString(), 20, yPos);
        doc.text(produit.nom.substring(0, 25), 35, yPos);
        doc.text(produit.categorie.substring(0, 12), 85, yPos);
        doc.text(stock.toString(), 120, yPos);
        doc.text(seuil.toString(), 140, yPos);
        doc.text(etat, 165, yPos);
        
        yPos += 5;
    });
    
    // Resume statistiques
    const stocksCritiques = produitsData.filter(p => p.stock < (p.seuil_alerte || p.seuilAlerte || 0) && p.stock > 0).length;
    const ruptures = produitsData.filter(p => p.stock === 0).length;
    const stocksNormaux = produitsData.filter(p => p.stock >= (p.seuil_alerte || p.seuilAlerte || 0)).length;
    
    yPos += 5;
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 150, 243);
    doc.text('RÉSUMÉ:', 15, yPos);
    
    yPos += 6;
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Stocks normaux: ' + stocksNormaux, 20, yPos);
    yPos += 4;
    doc.text('Stocks critiques: ' + stocksCritiques, 20, yPos);
    yPos += 4;
    doc.text('Ruptures de stock: ' + ruptures, 20, yPos);
    
    ajouterFooterPDF(doc, pageNum, 1);
    doc.save('etat_stocks_' + new Date().toISOString().split('T')[0] + '.pdf');
    afficherNotification('PDF état des stocks telecharge', 'success');
}


