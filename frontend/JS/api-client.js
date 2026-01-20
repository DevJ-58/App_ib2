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
}

// Instance globale du client API
const api = new APIClient();
console.log('✅ api-client.js chargé - api instance créée');