// ====================================================================
// API CLIENT - Gestion des appels à l'API REST
// ====================================================================

class APIClient {
    constructor(baseURL = 'http://localhost/APP_IB') {
        this.baseURL = baseURL;
    }

    /**
     * Effectuer une requête HTTP générique
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Pour les cookies de session
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            
            // Vérifier si c'est du JSON avant de parser
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Réponse non-JSON (HTML error, etc.)
                const text = await response.text();
                console.error(`❌ Réponse non-JSON reçue de ${url}`);
                console.error('Content-Type:', contentType);
                console.error('Réponse:', text.substring(0, 500));
                throw new Error(`Erreur API: Réponse non-JSON du serveur. Status ${response.status}`);
            }

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    /**
     * Connexion (Login)
     */
    async login(telephone, motDePasse) {
        return this.request('/Api/Auth/login.php', {
            method: 'POST',
            body: JSON.stringify({
                telephone,
                mot_de_passe: motDePasse
            })
        });
    }

    /**
     * Inscription (Register)
     */
    async register(nom, prenom, telephone, email, motDePasse, confirmMotDePasse) {
        return this.request('/Api/Auth/register.php', {
            method: 'POST',
            body: JSON.stringify({
                nom,
                prenom,
                telephone,
                email,
                mot_de_passe: motDePasse,
                confirm_mot_de_passe: confirmMotDePasse
            })
        });
    }

    /**
     * Déconnexion (Logout)
     */
    async logout() {
        return this.request('/Api/Auth/logout.php', {
            method: 'POST',
            body: JSON.stringify({})
        });
    }

    /**
     * Vérifier la session actuelle
     */
    async checkSession() {
        try {
            return await this.request('/Api/Auth/check.php');
        } catch (error) {
            return { success: false, authenticated: false };
        }
    }

    /**
     * Changer le mot de passe
     */
    async changePassword(oldPassword, newPassword, confirmPassword) {
        return this.request('/Api/Auth/change-password.php', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });
    }

    /**
     * Uploader une photo de profil
     */
    async uploadPhoto(fileInput) {
        const url = `${this.baseURL}/Api/Auth/upload-photo.php`;
        const formData = new FormData();
        formData.append('photo', fileInput.files[0]);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Erreur upload:', error);
            throw error;
        }
    }

    // ==================== PRODUITS ====================

    /**
     * Récupérer tous les produits
     */
    async getAllProducts(all = false) {
        return this.request(`/Api/Products/list.php${all ? '?all=true' : ''}`);
    }

    /**
     * Créer un produit
     */
    async createProduct(data) {
        return this.request('/Api/Products/create.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Récupérer les détails d'un produit
     */
    async getProductDetails(id) {
        return this.request(`/Api/Products/details.php?id=${id}`);
    }

    /**
     * Mettre à jour un produit
     */
    async updateProduct(id, data) {
        return this.request(`/Api/Products/update.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Supprimer un produit
     */
    async deleteProduct(id) {
        return this.request(`/Api/Products/delete.php?id=${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== VENTES ====================

    /**
     * Récupérer toutes les ventes
     */
    async getAllSales() {
        return this.request('/Api/Sales/list.php');
    }

    /**
     * Récupérer les détails d'une vente
     */
    async getSaleDetails(id) {
        return this.request(`/Api/Sales/details.php?id=${id}`);
    }

    /**
     * Créer une vente (avec objet data complet)
     */
    async createSaleWithData(data) {
        return this.request('/Api/Sales/create.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== CRÉDITS ====================

    /**
     * Créer un crédit
     */
    async createCredit(data) {
        return this.request('/Api/Credits/create.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Rembourser un crédit
     */
    async reimbourseCredit(id) {
        return this.request(`/Api/Credits/reimburse.php?id=${id}`, {
            method: 'POST',
            body: JSON.stringify({})
        });
    }

    // ==================== STOCKS ====================

    /**
     * Récupérer tous les stocks
     */
    async getAllStocks(limit = 50, offset = 0) {
        return this.request(`/Api/Stocks/list.php?limit=${limit}&offset=${offset}&type=all`);
    }

    /**
     * Récupérer les stocks critiques
     */
    async getCriticalStocks() {
        return this.request('/Api/Stocks/list.php?type=critiques');
    }

    /**
     * Récupérer la valeur totale du stock
     */
    async getStockValue() {
        return this.request('/Api/Stocks/list.php?type=value');
    }

    /**
     * Récupérer les alertes stock
     */
    async getStockAlerts() {
        return this.request('/Api/Stocks/alerts.php');
    }

    /**
     * Enregistrer un mouvement de stock
     */
    async recordMovement(data) {
        return this.request('/Api/Stocks/movement.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Récupérer l'historique des mouvements
     */
    async getMovementHistory(produit_id = null, limit = 50) {
        let url = '/Api/Stocks/history.php?limit=' + limit;
        if (produit_id) {
            url += '&produit_id=' + produit_id;
        }
        return this.request(url);
    }

    /**
     * Récupérer les statistiques des stocks
     */
    async getStockStats(date_debut = null, date_fin = null) {
        let url = '/Api/Stocks/stats.php';
        const params = [];
        if (date_debut) params.push('date_debut=' + date_debut);
        if (date_fin) params.push('date_fin=' + date_fin);
        if (params.length > 0) url += '?' + params.join('&');
        return this.request(url);
    }

    /**
     * Récupérer toutes les informations de stock (ancien nom, pour compatibilité)
     */
    async getStockInfo() {
        return this.getAllStocks();
    }

    // ==================== VENTES ====================

    /**
     * Créer une nouvelle vente
     */
    async createSale(client_nom, total, type_paiement, items, montant_recu = 0, montant_rendu = 0) {
        // Vérifier que l'utilisateur est authentifié
        if (!utilisateurConnecte || !utilisateurConnecte.id) {
            throw new Error('Utilisateur non authentifié');
        }
        
        return this.request('/Api/Sales/create.php', {
            method: 'POST',
            body: JSON.stringify({
                client_nom: client_nom,
                total: total,
                type_paiement: type_paiement,
                items: items,
                montant_recu: montant_recu,
                montant_rendu: montant_rendu,
                utilisateur_id: utilisateurConnecte.id
            })
        });
    }

    /**
     * Enregistrer une vente avec numéro WhatsApp
     */
    async createSaleWithWhatsapp(client_nom, total, type_paiement, items, montant_recu = 0, montant_rendu = 0, whatsapp = null) {
        // Vérifier que l'utilisateur est authentifié
        if (!utilisateurConnecte || !utilisateurConnecte.id) {
            throw new Error('Utilisateur non authentifié');
        }
        
        return this.request('/Api/Sales/create.php', {
            method: 'POST',
            body: JSON.stringify({
                client_nom: client_nom,
                total: total,
                type_paiement: type_paiement,
                items: items,
                montant_recu: montant_recu,
                montant_rendu: montant_rendu,
                whatsapp: whatsapp,
                utilisateur_id: utilisateurConnecte.id
            })
        });
    }

    /**
     * Récupérer la liste des ventes
     */
    async getAllSales(limit = 50, offset = 0) {
        return this.request(`/Api/Sales/list.php?limit=${limit}&offset=${offset}`);
    }

    /**
     * Récupérer les détails d'une vente
     */
    async getSaleDetails(vente_id) {
        return this.request(`/Api/Sales/details.php?id=${vente_id}`);
    }

    /**
     * Récupérer les statistiques des ventes
     */
    async getSalesStats(date_debut = null, date_fin = null) {
        let url = '/Api/Sales/stats.php';
        const params = [];
        if (date_debut) params.push('date_debut=' + date_debut);
        if (date_fin) params.push('date_fin=' + date_fin);
        if (params.length > 0) url += '?' + params.join('&');
        return this.request(url);
    }

    /**
     * Créer un crédit
     */
    async createCredit(vente_id, client_nom, montant_total, type_client = 'AUTRE', whatsapp = null, client_telephone = null) {
        return this.request('/Api/Credits/create.php', {
            method: 'POST',
            body: JSON.stringify({
                vente_id: vente_id,
                client_nom: client_nom,
                montant_total: montant_total,
                type_client: type_client,
                whatsapp: whatsapp,
                client_telephone: client_telephone
            })
        });
    }

    /**
     * Récupérer les crédits
     */
    async getAllCredits(limit = 50, offset = 0, status = null) {
        let url = '/Api/Credits/list.php?limit=' + limit + '&offset=' + offset;
        if (status) url += '&status=' + status;
        return this.request(url);
    }

    /**
     * Enregistrer un remboursement
     */
    async addCreditPayment(credit_id, montant, mode_paiement = 'ESPECES', utilisateur_id = null) {
        if (!utilisateur_id) {
            throw new Error('Utilisateur non authentifié');
        }
        return this.request('/Api/Credits/reimburse.php', {
            method: 'POST',
            body: JSON.stringify({
                credit_id: credit_id,
                montant: montant,
                mode_paiement: mode_paiement,
                utilisateur_id: utilisateur_id
            })
        });
    }

    /**
     * Récupérer les statistiques des crédits
     */
    async getCreditStats() {
        return this.request('/Api/Credits/stats.php');
    }

    /**
     * Récupérer tous les inventaires
     */
    async getAllInventories() {
        return this.request('/backend/Api/Inventaires/list.php');
    }

    /**
     * Récupérer les détails d'un inventaire
     */
    async getInventoryDetails(inventaire_id) {
        return this.request(`/backend/Api/Inventaires/details.php?id=${inventaire_id}`);
    }

    /**
     * Créer un nouvel inventaire
     */
    async createInventory() {
        return this.request('/backend/Api/Inventaires/create.php', {
            method: 'POST',
            body: JSON.stringify({})
        });
    }

    /**
     * Ajouter un produit à l'inventaire
     */
    async addProductToInventory(inventaire_id, produit_id, stock_reel) {
        return this.request('/backend/Api/Inventaires/add-product.php', {
            method: 'POST',
            body: JSON.stringify({
                inventaire_id: parseInt(inventaire_id),
                produit_id: parseInt(produit_id),
                stock_reel: parseInt(stock_reel)
            })
        });
    }

    /**
     * Terminer un inventaire
     */
    async completeInventory(inventaire_id) {
        return this.request('/backend/Api/Inventaires/complete.php', {
            method: 'POST',
            body: JSON.stringify({
                inventaire_id: parseInt(inventaire_id)
            })
        });
    }

    /**
     * Récupérer les statistiques du dashboard
     */
    async getDashboardStats() {
        return this.request('/backend/Api/dashbord.php/stats.php');
    }

    /**
     * Récupérer les ventes récentes
     */
    async getRecentSales() {
        return this.request('/backend/Api/dashbord.php/recent-sales.php');
    }

    /**
     * Récupérer les alertes
     */
    async getDashboardAlerts() {
        return this.request('/backend/Api/dashbord.php/alerts.php');
    }

    /**
     * Récupérer les top produits du jour
     */
    async getTopProductsToday(limit = 5) {
        return this.request(`/backend/Api/Sales/top-products-today.php?limit=${limit}`);
    }

    /**
     * Lister toutes les catégories
     */
    async listCategories(includeInactive = false) {
        const params = includeInactive ? '?include_inactive=true' : '';
        return this.request(`/backend/Api/Categories/list.php${params}`);
    }

    /**
     * Créer une nouvelle catégorie
     */
    async createCategory(nom) {
        return this.request('/backend/Api/Categories/create.php', {
            method: 'POST',
            body: JSON.stringify({
                nom: nom
            })
        });
    }

    /**
     * Mettre à jour une catégorie
     */
    async updateCategory(id, nom) {
        return this.request('/backend/Api/Categories/update.php', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                nom: nom
            })
        });
    }

    /**
     * Supprimer une catégorie
     */
    async deleteCategory(id) {
        return this.request('/backend/Api/Categories/delete.php', {
            method: 'POST',
            body: JSON.stringify({
                id: id
            })
        });
    }

    /**
     * Vérifier les dépendances d'une catégorie
     */
    async checkCategoryDeps(id) {
        return this.request(`/backend/Api/Categories/check-deps.php?id=${id}`);
    }

    /**
     * Récupérer les ventes récentes pour le dashboard
     */
    async getSalesRecent(limit = 10) {
        return this.request(`/backend/Api/Sales/recent.php?limit=${limit}`);
    }

    /**
     * Récupérer les détails d'une vente spécifique
     */
    async getSaleDetails(vente_id) {
        return this.request(`/backend/Api/Sales/details.php?id=${vente_id}`);
    }

    /**
     * Récupérer le résumé du jour
     */
    async getRecapDay() {
        return this.request('/backend/Api/Sales/recap-day.php');
    }

    /**
     * Récupérer les données pour le graphique 7 jours
     */
    async getChart7Days() {
        return this.request('/backend/Api/Sales/chart-7days.php');
    }

    /**
     * Récupérer les données pour le graphique CA
     */
    async getChartCA() {
        return this.request('/backend/Api/Reports/chart-ca.php');
    }

    /**
     * Récupérer les données pour le graphique catégories
     */
    async getChartCategories() {
        return this.request('/backend/Api/Reports/chart-categories.php');
    }

    /**
     * Récupérer les données pour le graphique top produits
     */
    async getChartTopProducts() {
        return this.request('/backend/Api/Reports/chart-top-products.php');
    }
}

// Instance globale du client API
const api = new APIClient();
console.log('✅ api-client.js chargé - api instance créée');
//  / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
//  / /   E X P O R T   D E   L ' A P I   C L I E N T   P O U R   L E S   A U T R E S   M O D U L E S 
//  / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
//  
//  w i n d o w . a p i   =   a p i ; 
//  
//  