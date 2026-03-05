// ====================================================================
// CHARTS.JS - Gestion des graphiques avec Chart.js
// ====================================================================

// Instances des graphiques (pour mise à jour)
let chartVentes7Jours = null;
let chartCA = null;
let chartCategories = null;
let chartTopProduits = null;

/**
 * Afficher le graphique des ventes sur 7 jours (Dashboard)
 */
async function afficherGraphique7Jours() {
    console.log('📊 Chargement du graphique 7 jours...');
    
    try {
        const response = await api.getChart7Days();
        
        if (!response.success || !response.data) {
            console.error('❌ Erreur API graphique 7 jours:', response.message);
            return;
        }
        
        const data = response.data;
        const canvas = document.getElementById('chartVentes7Jours');
        if (!canvas) {
            console.warn('⚠️ Canvas chartVentes7Jours non trouvé');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire le graphique existant si présent
        if (chartVentes7Jours) {
            chartVentes7Jours.destroy();
        }
        
        // Créer le graphique
        chartVentes7Jours = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: 'Montant des ventes (FCFA)',
                        data: data.montants,
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Nombre de ventes',
                        data: data.nombres,
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Montant (FCFA)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Nombre de ventes'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
        
        console.log('✅ Graphique 7 jours affichés');
    } catch (error) {
        console.error('❌ Erreur chargement graphique 7 jours:', error);
    }
}

/**
 * Afficher le graphique d'évolution du chiffre d'affaires
 */
async function afficherGraphiqueCA() {
    console.log('📊 Chargement du graphique CA...');
    
    try {
        const response = await api.getChartCA();
        
        if (!response.success || !response.data) {
            console.error('❌ Erreur API graphique CA:', response.message);
            return;
        }
        
        const data = response.data;
        const canvas = document.getElementById('canvasCA');
        if (!canvas) {
            console.warn('⚠️ Canvas canvasCA non trouvé');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire le graphique existant si présent
        if (chartCA) {
            chartCA.destroy();
        }
        
        // Créer le graphique
        chartCA = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.mois,
                datasets: [
                    {
                        label: 'Chiffre d\'Affaires (FCFA)',
                        data: data.montants,
                        backgroundColor: [
                            '#1976D2', '#1976D2', '#1976D2', '#1976D2', 
                            '#1976D2', '#1976D2', '#1976D2', '#1976D2',
                            '#1976D2', '#1976D2', '#1976D2', '#1976D2'
                        ],
                        borderColor: '#1565C0',
                        borderWidth: 1
                    },
                    {
                        label: 'Nombre de ventes',
                        data: data.nombres,
                        type: 'line',
                        borderColor: '#FF9800',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Montant (FCFA)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Nombre de ventes'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
        
        console.log('✅ Graphique CA affiché');
    } catch (error) {
        console.error('❌ Erreur chargement graphique CA:', error);
    }
}

/**
 * Afficher le graphique des ventes par catégorie (Pie Chart)
 */
async function afficherGraphiqueCategories() {
    console.log('📊 Chargement du graphique catégories...');
    
    try {
        const response = await api.getChartCategories();
        
        if (!response.success || !response.data) {
            console.error('❌ Erreur API graphique catégories:', response.message);
            return;
        }
        
        const data = response.data;
        const canvas = document.getElementById('canvasCategories');
        if (!canvas) {
            console.warn('⚠️ Canvas canvasCategories non trouvé');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire le graphique existant si présent
        if (chartCategories) {
            chartCategories.destroy();
        }
        
        // Créer le graphique
        chartCategories = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Montant par catégorie (FCFA)',
                    data: data.montants,
                    backgroundColor: data.couleurs,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
        
        console.log('✅ Graphique catégories affiché');
    } catch (error) {
        console.error('❌ Erreur chargement graphique catégories:', error);
    }
}

/**
 * Afficher le graphique des top 10 produits
 */
async function afficherGraphiqueTopProduits() {
    console.log('📊 Chargement du graphique top produits...');
    
    try {
        const response = await api.getChartTopProducts();
        
        if (!response.success || !response.data) {
            console.error('❌ Erreur API graphique top produits:', response.message);
            return;
        }
        
        const data = response.data;
        const canvas = document.getElementById('canvasTopProduits');
        if (!canvas) {
            console.warn('⚠️ Canvas canvasTopProduits non trouvé');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire le graphique existant si présent
        if (chartTopProduits) {
            chartTopProduits.destroy();
        }
        
        // Créer le graphique
        chartTopProduits = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Montant total (FCFA)',
                        data: data.montants,
                        backgroundColor: '#1976D2',
                        borderColor: '#1565C0',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Montant (FCFA)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Graphique top produits affiché');
    } catch (error) {
        console.error('❌ Erreur chargement graphique top produits:', error);
    }
}

/**
 * Charger tous les graphiques de la section rapports
 */
async function chargerTousLesGraphiques() {
    console.log('📊 Chargement de tous les graphiques...');
    
    try {
        await Promise.all([
            afficherGraphiqueCA(),
            afficherGraphiqueCategories(),
            afficherGraphiqueTopProduits()
        ]);
        
        console.log('✅ Tous les graphiques ont été chargés');
    } catch (error) {
        console.error('❌ Erreur chargement des graphiques:', error);
    }
}
