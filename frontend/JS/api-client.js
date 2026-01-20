// ====================================================================
// API CLIENT - Gestion des appels à l'API REST
// ====================================================================

class APIClient {
    constructor(baseURL = 'http://localhost/APP_IB/backend') {
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
            const data = await response.json();

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
     * Créer une vente
     */
    async createSale(data) {
        return this.request('/Api/Sales/create.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== CRÉDITS ====================

    /**
     * Récupérer tous les crédits
     */
    async getAllCredits() {
        return this.request('/Api/Credits/list.php');
    }

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
        return this.request('/Api/Sales/create.php', {
            method: 'POST',
            body: JSON.stringify({
                client_nom: client_nom,
                total: total,
                type_paiement: type_paiement,
                items: items,
                montant_recu: montant_recu,
                montant_rendu: montant_rendu,
                utilisateur_id: utilisateurConnecte?.id || 1
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
}

// Instance globale du client API
const api = new APIClient();
console.log('✅ api-client.js chargé - api instance créée');