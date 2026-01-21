// ====================================================================
// REPORTS-API.JS - Intégration Rapports Frontend
// ====================================================================

console.log('✅ reports-api.js chargé');

/**
 * Générer rapport journalier
 */
async function genererRapportJournalier() {
    console.log('📋 Génération rapport journalier...');
    try {
        const aujourd_hui = new Date().toISOString().split('T')[0];
        
        // Filtrer les ventes d'aujourd'hui
        const ventesAujourdhui = ventesData.filter(v => v.date_vente.startsWith(aujourd_hui));
        const totalVentes = ventesAujourdhui.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesAujourdhui.length;
        
        // Crédits accordés aujourd'hui
        const creditsAujourdhui = creditsData.filter(c => c.date_credit.startsWith(aujourd_hui));
        const montantCreditsAccordes = creditsAujourdhui.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        // Remboursements aujourd'hui
        const remboursementsAujourdhui = creditsData.filter(c => 
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
async function genererRapportHebdomadaire() {
    console.log('[REPORT] Generation rapport hebdomadaire...');
    try {
        const maintenant = new Date();
        const jourSemaine = maintenant.getDay();
        const debut_semaine = new Date(maintenant);
        debut_semaine.setDate(maintenant.getDate() - jourSemaine + 1);
        
        const fin_semaine = new Date(debut_semaine);
        fin_semaine.setDate(debut_semaine.getDate() + 6);
        
        const dateDebut = debut_semaine.toISOString().split('T')[0];
        const dateFin = fin_semaine.toISOString().split('T')[0];
        
        // Filtrer les ventes de la semaine
        const ventesSemaine = ventesData.filter(v => v.date_vente >= dateDebut && v.date_vente <= dateFin);
        const totalVentes = ventesSemaine.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesSemaine.length;
        
        // Credits de la semaine
        const creditsSemaine = creditsData.filter(c => c.date_credit >= dateDebut && c.date_credit <= dateFin);
        const montantCredits = creditsSemaine.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        // Mouvements de stock de la semaine
        let entreesTotalSemaine = 0;
        let sortiesTotal = 0;
        if (mouvementsData) {
            mouvementsData.forEach(m => {
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
async function genererRapportMensuel() {
    console.log('📋 Génération rapport mensuel...');
    try {
        const maintenant = new Date();
        const mois_courant = maintenant.getFullYear() + '-' + String(maintenant.getMonth() + 1).padStart(2, '0');
        
        // Filtrer les ventes du mois
        const ventesMois = ventesData.filter(v => v.date_vente.startsWith(mois_courant));
        const totalVentes = ventesMois.reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
        const nombreVentes = ventesMois.length;
        
        // Crédits du mois
        const creditsMois = creditsData.filter(c => c.date_credit.startsWith(mois_courant));
        const montantCredits = creditsMois.reduce((sum, c) => sum + parseFloat(c.montant_total), 0);
        
        // Mouvements de stock du mois
        let entreesTotalMois = 0;
        let sortiesTotal = 0;
        if (mouvementsData) {
            mouvementsData.forEach(m => {
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
            credits: {
                accordes: montantCredits,
                nombre: creditsMois.length
            },
            stocks: {
                entrees: entreesTotalMois,
                sorties: sortiesTotal
            }
        };
        
        console.log('✅ Rapport mensuel généré:', rapport);
        return rapport;
    } catch (error) {
        console.error('❌ Erreur génération rapport mensuel:', error);
        return null;
    }
}

/**
 * Générer rapport stocks
 */
async function genererRapportStocks() {
    console.log('📋 Génération rapport stocks...');
    try {
        // Calculer la valeur totale
        let valeurTotal = 0;
        let nombreProduits = produitsData.length;
        let produitsCritiques = 0;
        let produitRupture = 0;
        
        produitsData.forEach(p => {
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
            date: new Date().toISOString().split('T')[0],
            resume: {
                valeur_totale: valeurTotal,
                nombre_produits: nombreProduits,
                critiques: produitsCritiques,
                rupture: produitRupture,
                stock_sain: nombreProduits - produitsCritiques - produitRupture
            },
            produits_critiques: produitsData
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
        
        console.log('✅ Rapport stocks généré:', rapport);
        return rapport;
    } catch (error) {
        console.error('❌ Erreur génération rapport stocks:', error);
        return null;
    }
}

/**
 * Générer rapport crédits
 */
async function genererRapportCredits() {
    console.log('📋 Génération rapport crédits...');
    try {
        let montantTotal = 0;
        let montantRembourse = 0;
        let montantRestant = 0;
        let creditsEnCours = 0;
        let creditsSoldes = 0;
        
        creditsData.forEach(c => {
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
            date: new Date().toISOString().split('T')[0],
            resume: {
                montant_total: montantTotal,
                montant_rembourse: montantRembourse,
                montant_restant: montantRestant,
                taux_recouvrement: tauxRecouvrement.toFixed(2),
                credits_en_cours: creditsEnCours,
                credits_soldes: creditsSoldes
            },
            credits_impayees: creditsData
                .filter(c => c.statut !== 'solde' && c.montant_restant > 0)
                .map(c => ({
                    client: c.client_nom,
                    montant: parseFloat(c.montant_restant),
                    jours: Math.floor((new Date() - new Date(c.date_credit)) / (1000 * 60 * 60 * 24))
                }))
        };
        
        console.log('✅ Rapport crédits généré:', rapport);
        return rapport;
    } catch (error) {
        console.error('❌ Erreur génération rapport crédits:', error);
        return null;
    }
}

/**
 * Générer rapport top produits
 */
async function genererRapportTopProduits() {
    console.log('📋 Génération rapport top produits...');
    try {
        // S'assurer que les données sont chargées
        if (!ventesData || ventesData.length === 0) {
            console.warn('⚠️ ventesData vide, chargement des ventes...');
            await chargerVentesAPI(1000, 0);
        }
        
        if (!ventesData || ventesData.length === 0) {
            console.error('❌ Aucune vente a traiter');
            return {
                type: 'top_produits',
                date: new Date().toISOString().split('T')[0],
                top_10: []
            };
        }
        
        // Compter les ventes par produit
        const ventesParProduit = {};
        
        ventesData.forEach(v => {
            // L'API retourne 'descriptions' qui contient les noms de produits séparés par des virgules
            // et 'quantite_totale' pour la quantité
            const descriptions = v.descriptions || v.produit_nom || v.nom_produit || 'Produit inconnu';
            
            // Si plusieurs produits, prendre le premier
            const produits = String(descriptions).split(',').map(p => p.trim());
            
            // Créer une entrée par produit
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
                    // Partager la quantité et le montant entre les produits
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
        
        console.log('✅ Top produits généré:', topProduits.length, 'produits');
        console.log('Détails:', topProduits);
        
        const rapport = {
            type: 'top_produits',
            date: new Date().toISOString().split('T')[0],
            top_10: topProduits
        };
        
        return rapport;
    } catch (error) {
        console.error('❌ Erreur génération top produits:', error);
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
        afficherNotification('Erreur: impossible de générer le rapport', 'error');
        return;
    }
    
    console.log('📊 Affichage du rapport:', rapport);
    afficherNotification(`Rapport ${rapport.type} généré avec succès`, 'success');
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
    
    afficherNotification('Rapport exporté en JSON', 'success');
}

/**
 * Exporter rapport en CSV
 */
function exporterRapportCSV(donnees, nom_fichier) {
    // À implémenter si nécessaire
    console.log('Export CSV:', donnees);
    afficherNotification('Export CSV en développement', 'info');
}
