// ====================================================================
// REPORTS-API.JS - IntÃ©gration Rapports Frontend
// ====================================================================

console.log('âœ… reports-api.js chargÃ©');

/**
 * GÃ©nÃ©rer rapport journalier
 */
async function genererRapportJournalier(refDate = null) {
    console.log('ðŸ“‹ GÃ©nÃ©ration rapport journalier...', refDate);
    try {
        // VÃ©rifier que les donnÃ©es sont chargÃ©es
        if (!window.ventesData || !Array.isArray(window.ventesData) || window.ventesData.length === 0) {
            console.warn('âš ï¸ ventesData non chargÃ©, tentative de chargement...');
            await window.chargerVentesAPI(1000, 0);
        }
        if (!window.creditsData || !Array.isArray(window.creditsData)) {
            console.warn('âš ï¸ creditsData non chargÃ©, tentative de chargement...');
            await window.chargerCreditsAPI();
        }
        
        const aujourd_hui = refDate || new Date().toISOString().split('T')[0];
        
        const ventesAujourdhui = window.ventesData.filter(v => v.date_vente.startsWith(aujourd_hui));
        const totalVentes = ventesAujourdhui.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesAujourdhui.length;
        
        const creditsAujourdhui = window.creditsData.filter(c => c.date_credit.startsWith(aujourd_hui));
        const montantCreditsAccordes = creditsAujourdhui.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        const remboursementsAujourdhui = window.creditsData.filter(c => 
            c.date_remboursement_complet && c.date_remboursement_complet.startsWith(aujourd_hui)
        );
        const montantRembourses = remboursementsAujourdhui.reduce((sum, c) => sum + parseFloat(c.montant_paye), 0);
        
        const rapport = {
            date: aujourd_hui,
            type: 'journalier',
            ventes: {
                nombre: nombreVentes,
                montant: totalVentes,
                panier_moyen: nombreVentes > 0 ? totalVentes / nombreVentes : 0
            },
            ventes_detaillees: ventesAujourdhui.map(v => ({
                date_vente: v.date_vente,
                produit_nom: v.descriptions || v.produit_nom || v.nom_produit || 'Produit inconnu',
                quantite: parseInt(v.quantite_totale) || parseInt(v.quantite) || 0,
                prix_unitaire: parseFloat(v.prix_unitaire) || 0,
                total: parseFloat(v.montant_total) || parseFloat(v.total) || 0,
                client_nom: v.client_nom || '-',
                utilisateur_nom: v.utilisateur_nom || '-'
            })),
            credits: {
                accordes: montantCreditsAccordes,
                remboursements: montantRembourses
            },
            resume: {
                recettes_total: totalVentes,
                ventes_comptant: ventesAujourdhui.filter(v => v.type_paiement === 'comptant').reduce((s, v) => s + parseFloat(v.montant_total), 0),
                credits_accordes: montantCreditsAccordes,
                remboursements_recus: montantRembourses
            }
        };
        
        console.log('[OK] Rapport journalier genere:', rapport);
        return rapport;
    } catch (error) {
        console.error('[ERROR] Erreur generation rapport journalier:', error);
        return null;
    }
}

/**
 * Generer rapport hebdomadaire
 */
async function genererRapportHebdomadaire(refDate = null) {
    console.log('[REPORT] Generation rapport hebdomadaire...', refDate);
    try {
        // VÃ©rifier que les donnÃ©es sont chargÃ©es
        if (!window.ventesData || !Array.isArray(window.ventesData) || window.ventesData.length === 0) {
            console.warn('âš ï¸ ventesData non chargÃ©, tentative de chargement...');
            await window.chargerVentesAPI(1000, 0);
        }
        if (!window.creditsData || !Array.isArray(window.creditsData)) {
            console.warn('âš ï¸ creditsData non chargÃ©, tentative de chargement...');
            await window.chargerCreditsAPI();
        }
        if (!window.mouvementsData || !Array.isArray(window.mouvementsData)) {
            console.warn('âš ï¸ mouvementsData non chargÃ©, tentative de chargement...');
            await window.chargerMouvementsAPI();
        }
        
        const maintenant = refDate ? new Date(refDate) : new Date();
        const jourSemaine = maintenant.getDay();
        const debut_semaine = new Date(maintenant);
        debut_semaine.setDate(maintenant.getDate() - jourSemaine + 1);
        
        const fin_semaine = new Date(debut_semaine);
        fin_semaine.setDate(debut_semaine.getDate() + 6);
        
        const dateDebut = debut_semaine.toISOString().split('T')[0];
        const dateFin = fin_semaine.toISOString().split('T')[0];
        
        const ventesSemaine = window.ventesData.filter(v => v.date_vente >= dateDebut && v.date_vente <= dateFin);
        const totalVentes = ventesSemaine.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesSemaine.length;
        
        const creditsSemaine = window.creditsData.filter(c => c.date_credit >= dateDebut && c.date_credit <= dateFin);
        const montantCredits = creditsSemaine.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        let entreesTotalSemaine = 0;
        let sortiesTotal = 0;
        if (window.mouvementsData) {
            window.mouvementsData.forEach(m => {
                if (m.date_mouvement >= dateDebut && m.date_mouvement <= dateFin) {
                    if (m.type === 'entree') {
                        entreesTotalSemaine += parseInt(m.quantite) || 0;
                    } else if (m.type === 'sortie' || m.type === 'perte') {
                        sortiesTotal += parseInt(m.quantite) || 0;
                    }
                }
            });
        }
        
        const rapport = {
            periode: dateDebut + ' au ' + dateFin,
            type: 'hebdomadaire',
            ventes: {
                nombre: nombreVentes,
                montant: totalVentes,
                panier_moyen: nombreVentes > 0 ? totalVentes / nombreVentes : 0
            },
            ventes_detaillees: ventesSemaine.map(v => ({
                date_vente: v.date_vente,
                produit_nom: v.descriptions || v.produit_nom || v.nom_produit || 'Produit inconnu',
                quantite: parseInt(v.quantite_totale) || parseInt(v.quantite) || 0,
                prix_unitaire: parseFloat(v.prix_unitaire) || 0,
                total: parseFloat(v.montant_total) || parseFloat(v.total) || 0,
                client_nom: v.client_nom || '-',
                utilisateur_nom: v.utilisateur_nom || '-'
            })),
            credits: {
                accordes: montantCredits,
                nombre: creditsSemaine.length
            },
            stocks: {
                entrees: entreesTotalSemaine,
                sorties: sortiesTotal
            }
        };
        
        console.log('[OK] Rapport hebdomadaire genere:', rapport);
        return rapport;
    } catch (error) {
        console.error('[ERROR] Erreur generation rapport hebdomadaire:', error);
        return null;
    }
}

/**
 * Generer rapport mensuel
 */
async function genererRapportMensuel(refDate = null) {
    console.log('ðŸ“‹ GÃ©nÃ©ration rapport mensuel...', refDate);
    try {
        // VÃ©rifier que les donnÃ©es sont chargÃ©es
        if (!window.ventesData || !Array.isArray(window.ventesData) || window.ventesData.length === 0) {
            console.warn('âš ï¸ ventesData non chargÃ©, tentative de chargement...');
            await window.chargerVentesAPI(1000, 0);
        }
        if (!window.creditsData || !Array.isArray(window.creditsData)) {
            console.warn('âš ï¸ creditsData non chargÃ©, tentative de chargement...');
            await window.chargerCreditsAPI();
        }
        if (!window.mouvementsData || !Array.isArray(window.mouvementsData)) {
            console.warn('âš ï¸ mouvementsData non chargÃ©, tentative de chargement...');
            await window.chargerMouvementsAPI();
        }
        
        const now = refDate ? new Date(refDate) : new Date();
        const mois_courant = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        const ventesMois = window.ventesData.filter(v => v.date_vente.startsWith(mois_courant));
        const totalVentes = ventesMois.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesMois.length;
        
        const creditsMois = window.creditsData.filter(c => c.date_credit.startsWith(mois_courant));
        const montantCredits = creditsMois.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        let entreesTotalMois = 0;
        let sortiesTotal = 0;
        if (window.mouvementsData) {
            window.mouvementsData.forEach(m => {
                if (m.date_mouvement.startsWith(mois_courant)) {
                    if (m.type === 'entree') {
                        entreesTotalMois += parseInt(m.quantite) || 0;
                    } else if (m.type === 'sortie' || m.type === 'perte') {
                        sortiesTotal += parseInt(m.quantite) || 0;
                    }
                }
            });
        }
        
        const rapport = {
            periode: mois_courant,
            type: 'mensuel',
            ventes: {
                nombre: nombreVentes,
                montant: totalVentes,
                panier_moyen: nombreVentes > 0 ? totalVentes / nombreVentes : 0
            },
            ventes_detaillees: ventesMois.map(v => ({
                date_vente: v.date_vente,
                produit_nom: v.descriptions || v.produit_nom || v.nom_produit || 'Produit inconnu',
                quantite: parseInt(v.quantite_totale) || parseInt(v.quantite) || 0,
                prix_unitaire: parseFloat(v.prix_unitaire) || 0,
                total: parseFloat(v.montant_total) || parseFloat(v.total) || 0,
                client_nom: v.client_nom || '-',
                utilisateur_nom: v.utilisateur_nom || '-'
            })),
            credits: {
                accordes: montantCredits,
                nombre: creditsMois.length
            },
            stocks: {
                entrees: entreesTotalMois,
                sorties: sortiesTotal
            }
        };
        
        console.log('âœ… Rapport mensuel gÃ©nÃ©rÃ©:', rapport);
        return rapport;
    } catch (error) {
        console.error('âŒ Erreur gÃ©nÃ©ration rapport mensuel:', error);
        return null;
    }
}

/**
 * GÃ©nÃ©rer rapport stocks
 */
async function genererRapportStocks(refDate = null) {
    console.log('ðŸ“‹ GÃ©nÃ©ration rapport stocks...', refDate);
    try {
        // Vérifier que les données sont chargées
        if (!window.produitsData || !Array.isArray(window.produitsData) || window.produitsData.length === 0) {
            console.warn('⚠️ produitsData non chargé, tentative de chargement...');
            try {
                const produitsResponse = await api.getAllProducts();
                if (produitsResponse.success && produitsResponse.data) {
                    window.produitsData = produitsResponse.data;
                    console.log(`✅ ${window.produitsData.length} produits chargés pour le rapport`);
                } else {
                    console.error('❌ Impossible de charger les produits');
                    return null;
                }
            } catch (error) {
                console.error('❌ Erreur chargement produits:', error);
                return null;
            }
        }
        
        // Calculer la valeur totale
        let valeurTotal = 0;
        let nombreProduits = window.produitsData.length;
        let produitsCritiques = 0;
        let produitRupture = 0;
        
        window.produitsData.forEach(p => {
            const stock = p.stock || 0;
            const prix = parseFloat(p.prix) || 0;
            valeurTotal += stock * prix;
            
            const seuil = p.seuil_alerte || p.seuilAlerte || 0;
            if (stock === 0) {
                produitRupture++;
            } else if (stock <= seuil) {
                produitsCritiques++;
            }
        });
        
        const rapport = {
            type: 'stocks',
            date: refDate || new Date().toISOString().split('T')[0],
            resume: {
                valeur_totale: valeurTotal,
                nombre_produits: nombreProduits,
                critiques: produitsCritiques,
                rupture: produitRupture,
                stock_sain: nombreProduits - produitsCritiques - produitRupture
            },
            produits: window.produitsData.map(p => ({
                nom: p.nom,
                categorie_nom: p.categorie_nom,
                stock: p.stock || 0,
                prix_unitaire: parseFloat(p.prix) || 0,
                seuil_alerte: p.seuil_alerte || p.seuilAlerte || 0
            })),
            produits_critiques: window.produitsData
                .filter(p => {
                    const seuil = p.seuil_alerte || p.seuilAlerte || 0;
                    return (p.stock || 0) <= seuil && (p.stock || 0) > 0;
                })
                .map(p => ({
                    nom: p.nom,
                    stock: p.stock,
                    seuil: p.seuil_alerte || p.seuilAlerte,
                    valeur: (p.stock || 0) * (parseFloat(p.prix) || 0)
                }))
        };
        
        console.log('âœ… Rapport stocks gÃ©nÃ©rÃ©:', rapport);
        return rapport;
    } catch (error) {
        console.error('âŒ Erreur gÃ©nÃ©ration rapport stocks:', error);
        return null;
    }
}

/**
 * GÃ©nÃ©rer rapport crÃ©dits
 */
async function genererRapportCredits(refDate = null) {
    console.log('ðŸ“‹ GÃ©nÃ©ration rapport crÃ©dits...', refDate);
    try {
        // VÃ©rifier que les donnÃ©es sont chargÃ©es
        if (!creditsData || !Array.isArray(creditsData) || creditsData.length === 0) {
            console.warn('âš ï¸ creditsData non chargÃ©, tentative de chargement...');
            await chargerCreditsAPI();
        }
        
        let montantTotal = 0;
        let montantRembourse = 0;
        let montantRestant = 0;
        let creditsEnCours = 0;
        let creditsSoldes = 0;
        
        window.creditsData.forEach(c => {
            montantTotal += parseFloat(c.montant_total) || 0;
            montantRembourse += parseFloat(c.montant_paye) || 0;
            montantRestant += parseFloat(c.montant_restant) || 0;
            
            if (c.statut === 'solde') {
                creditsSoldes++;
            } else {
                creditsEnCours++;
            }
        });
        
        const tauxRecouvrement = montantTotal > 0 ? (montantRembourse / montantTotal) * 100 : 0;
        
        const rapport = {
            type: 'credits',
            date: refDate || new Date().toISOString().split('T')[0],
            resume: {
                montant_total: montantTotal,
                montant_rembourse: montantRembourse,
                montant_restant: montantRestant,
                taux_recouvrement: tauxRecouvrement.toFixed(2),
                credits_en_cours: creditsEnCours,
                credits_soldes: creditsSoldes
            },
            credits: window.creditsData.map(c => ({
                client_nom: c.client_nom || '-',
                montant_total: parseFloat(c.montant_total) || 0,
                montant_paye: parseFloat(c.montant_paye) || 0,
                montant_restant: parseFloat(c.montant_restant) || 0,
                statut: c.statut || '-',
                date_credit: c.date_credit ? new Date(c.date_credit).toLocaleDateString('fr-FR') : '-'
            })),
            credits_impayees: window.creditsData
                .filter(c => c.statut !== 'solde' && c.montant_restant > 0)
                .map(c => ({
                    client: c.client_nom,
                    montant: parseFloat(c.montant_restant),
                    jours: Math.floor((new Date() - new Date(c.date_credit)) / (1000 * 60 * 60 * 24))
                }))
        };
        
        console.log('âœ… Rapport crÃ©dits gÃ©nÃ©rÃ©:', rapport);
        return rapport;
    } catch (error) {
        console.error('âŒ Erreur gÃ©nÃ©ration rapport crÃ©dits:', error);
        return null;
    }
}

/**
 * GÃ©nÃ©rer rapport top produits
 */
async function genererRapportTopProduits(refDate = null) {
    console.log('ðŸ“‹ GÃ©nÃ©ration rapport top produits...', refDate);
    try {
        // S'assurer que les donnÃ©es sont chargÃ©es
        if (!window.ventesData || window.ventesData.length === 0) {
            console.warn('âš ï¸ ventesData vide, chargement des ventes...');
            await window.chargerVentesAPI(1000, 0);
        }
        
        if (!window.ventesData || window.ventesData.length === 0) {
            console.error('âŒ Aucune vente a traiter');
            return {
                type: 'top_produits',
                date: new Date().toISOString().split('T')[0],
                top_10: []
            };
        }
        
        // Compter les ventes par produit
        const ventesParProduit = {};
        
        window.ventesData.forEach(v => {
            if (refDate && !v.date_vente.startsWith(refDate)) return; // ignorer hors de la date sÃ©lectionnÃ©e
            // L'API retourne 'descriptions' qui contient les noms de produits sÃ©parÃ©s par des virgules
            // et 'quantite_totale' pour la quantitÃ©
            const descriptions = v.descriptions || v.produit_nom || v.nom_produit || 'Produit inconnu';
            
            // Si plusieurs produits, prendre le premier
            const produits = String(descriptions).split(',').map(p => p.trim());
            
            // CrÃ©er une entrÃ©e par produit
            produits.forEach(nomProduit => {
                if (nomProduit && nomProduit !== '') {
                    if (!ventesParProduit[nomProduit]) {
                        ventesParProduit[nomProduit] = {
                            nom: nomProduit,
                            quantite: 0,
                            montant: 0,
                            nombre_ventes: 0
                        };
                    }
                    // Partager la quantitÃ© et le montant entre les produits
                    const qteProduit = (parseInt(v.quantite_totale) || parseInt(v.quantite) || 0) / produits.length;
                    const montantProduit = (parseFloat(v.montant_total) || parseFloat(v.total) || 0) / produits.length;
                    
                    ventesParProduit[nomProduit].quantite += qteProduit;
                    ventesParProduit[nomProduit].montant += montantProduit;
                    ventesParProduit[nomProduit].nombre_ventes++;
                }
            });
        });
        
        // Trier par montant (descending)
        const topProduits = Object.values(ventesParProduit)
            .sort((a, b) => b.montant - a.montant)
            .slice(0, 10);
        
        console.log('âœ… Top produits gÃ©nÃ©rÃ©:', topProduits.length, 'produits');
        console.log('DÃ©tails:', topProduits);
        
        const rapport = {
            type: 'top_produits',
            date: new Date().toISOString().split('T')[0],
            top_10: topProduits
        };
        
        return rapport;
    } catch (error) {
        console.error('âŒ Erreur gÃ©nÃ©ration top produits:', error);
        return {
            type: 'top_produits',
            date: new Date().toISOString().split('T')[0],
            top_10: []
        };
    }
}

/**
 * Afficher rapport dans un modal
 */
async function afficherRapport(rapport) {
    if (!rapport) {
        window.afficherNotification?.('Erreur: impossible de gÃ©nÃ©rer le rapport', 'error');
        return;
    }
    
    console.log('ðŸ“Š Affichage du rapport:', rapport);
    window.afficherNotification?.(`Rapport ${rapport.type} gÃ©nÃ©rÃ© avec succÃ¨s`, 'success');
}

/**
 * Exporter rapport en JSON
 */
function exporterRapportJSON(rapport, nom_fichier) {
    const element = document.createElement('a');
    const fichier = new Blob([JSON.stringify(rapport, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(fichier);
    element.download = nom_fichier + '.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    window.afficherNotification?.('Rapport exportÃ© en JSON', 'success');
}

/**
 * Exporter rapport en CSV
 */
function exporterRapportCSV(donnees, nom_fichier) {
    if (!donnees || !donnees.length) {
        window.afficherNotification?.('âš ï¸ Aucune donnÃ©e Ã  exporter', 'warning');
        return;
    }
    const keys = Object.keys(donnees[0]);
    const rows = donnees.map(r => keys.map(k => {
        // Ã©viter les virgules problÃ©matiques
        let cell = r[k] == null ? '' : String(r[k]);
        if (cell.includes(',')) cell = '"' + cell.replace(/"/g, '""') + '"';
        return cell;
    }).join(','));
    const csv = [keys.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nom_fichier.endsWith('.csv') ? nom_fichier : nom_fichier + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.afficherNotification?.('âœ… Rapport exportÃ© en CSV', 'success');
}

/**
 * Exporter en CSV Ã©purÃ© et Ã©lÃ©gant
 */
function exporterCSVEpure(donnees, nom_fichier) {
    if (!donnees || !donnees.length) {
        window.afficherNotification?.('âš ï¸ Aucune donnÃ©e Ã  exporter', 'warning');
        return;
    }

    // Utiliser les clÃ©s du premier objet comme en-tÃªtes
    const keys = Object.keys(donnees[0]);
    
    // CrÃ©er les lignes CSV
    const rows = donnees.map(r => keys.map(k => {
        let cell = r[k] == null ? '' : String(r[k]);
        // Ã‰chapper les guillemets et envelopper les cellules contenant des virgules
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            cell = '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
    }).join(','));
    
    // CrÃ©er le CSV avec en-tÃªte
    const csv = [keys.join(','), ...rows].join('\n');

    // TÃ©lÃ©charger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nom_fichier.endsWith('.csv') ? nom_fichier : nom_fichier + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.afficherNotification?.('âœ… Fichier ' + nom_fichier + ' tÃ©lÃ©chargÃ©', 'success');
}

// gÃ©nÃ©rique : exporter un tableau d'objets en PDF simple
function exporterPDFFromArray(donnees, nom_fichier, titre = '') {
    if (!donnees || !donnees.length) {
        window.afficherNotification?.('âš ï¸ Aucune donnÃ©e Ã  exporter en PDF', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    if (titre) {
        doc.setFontSize(16);
        doc.text(titre, 15, y);
        y += 10;
    }

    const keys = Object.keys(donnees[0]);
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    // header row
    let headerText = keys.join(' | ');
    doc.text(headerText, 15, y);
    y += 7;
    doc.setFont('times', 'normal');

    donnees.forEach(row => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        const line = keys.map(k => {
            let v = row[k];
            if (v == null) v = '';
            return String(v);
        }).join(' | ');
        doc.text(line, 15, y);
        y += 6;
    });

    doc.save(nom_fichier + '.pdf');
    window.afficherNotification?.('âœ… PDF ' + nom_fichier + ' tÃ©lÃ©chargÃ©', 'success');
}

// ====================================================================
// EXPORT DES FONCTIONS DE RAPPORT POUR LES AUTRES MODULES
// ====================================================================

window.genererRapportJournalier = genererRapportJournalier;
window.genererRapportHebdomadaire = genererRapportHebdomadaire;
window.genererRapportMensuel = genererRapportMensuel;
window.genererRapportStocks = genererRapportStocks;
window.genererRapportCredits = genererRapportCredits;
window.genererRapportTopProduits = genererRapportTopProduits;

