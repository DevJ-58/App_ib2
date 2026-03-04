/**
 * Barcode Scanner WebSocket Client
 * Gère la connexion WebSocket pour le scanner de codes-barres
 */

class BarcodeScanner {
    constructor(wsUrl = null) {
        // Si pas d'URL fournie, déterminer automatiquement
        if (!wsUrl) {
            // Récupérer le hostname/IP du serveur actuel
            const host = window.location.hostname;
            const port = 3000;
            wsUrl = `ws://${host}:${port}`;
        }
        
        this.wsUrl = wsUrl;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 2000;
        this.listeners = {};
        this.isManualClose = false;
    }

    /**
     * Se connecter au serveur WebSocket
     */
    connect() {
        try {
            console.log(`🔗 Tentative de connexion WebSocket: ${this.wsUrl}`);
            this.ws = new WebSocket(this.wsUrl);
            this.isManualClose = false;

            this.ws.onopen = () => {
                console.log('✅ WebSocket connecté avec succès');
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                console.log('📡 Message reçu RAW:', event.data);
                try {
                    // Essayer de parser en JSON d'abord
                    const data = JSON.parse(event.data);
                    console.log('📡 Message JSON parsé:', data);
                    let barcode = null;
                    if (data.barcode) {
                        barcode = data.barcode;
                    } else if (data.code) {
                        barcode = data.code;
                    } else if (data.data) {
                        barcode = data.data;
                    } else if (typeof data === 'string') {
                        barcode = data;
                    }
                    if (barcode) {
                        console.log('📦 Code-barre détecté:', barcode);
                        this.emit('barcodeScanned', barcode);
                    } else {
                        console.log('⚠️ Message JSON inconnu:', data);
                    }
                } catch (err) {
                    console.log('📡 Message traité comme texte');
                    // Si pas JSON, traiter comme code-barre direct
                    if (event.data && event.data.length > 0 && event.data !== 'CONNECTED') {
                        console.log('📦 Code-barre détecté (texte):', event.data);
                        this.emit('barcodeScanned', event.data);
                    }
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ Erreur WebSocket:', error);
                this.emit('error', error);
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket fermé');
                if (!this.isManualClose) {
                    this.emit('disconnected');
                    this.attemptReconnect();
                }
            };
        } catch (err) {
            console.error('❌ Erreur création WebSocket:', err);
            this.emit('error', err);
            this.attemptReconnect();
        }
    }

    /**
     * Tentative de reconnexion
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const tempsAttente = this.reconnectDelay * this.reconnectAttempts;
            console.log(`🔄 Reconnexion tentée ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${tempsAttente}ms`);
            setTimeout(() => this.connect(), tempsAttente);
        } else {
            console.error('❌ Nombre max de tentatives de reconnexion atteint');
            this.emit('maxReconnectAttemptsReached');
        }
    }

    /**
     * S'abonner à un événement
     */
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
        console.log(`📌 Écouteur ajouté pour événement: ${eventName}`);
    }

    /**
     * Se désabonner d'un événement
     */
    off(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
        }
    }

    /**
     * Émettre un événement
     */
    emit(eventName, data) {
        console.log(`📢 Émission événement: ${eventName}`, data || '');
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (err) {
                    console.error(`❌ Erreur callback ${eventName}:`, err);
                }
            });
        } else {
            console.warn(`⚠️ Aucun écouteur pour l'événement: ${eventName}`);
        }
    }

    /**
     * Envoyer un message au serveur
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ WebSocket pas connecté - message non envoyé');
        }
    }

    /**
     * Obtenir l'état de connexion
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Fermer la connexion
     */
    close() {
        if (this.ws) {
            this.isManualClose = true;
            this.ws.close();
        }
    }
}

// Instance globale du scanner
let barcodeScanner = null;

/**
 * Initialiser le scanner au chargement de la page
 */
function initialiserBarcodeScanner() {
    console.log('📱 Initialisation du scanner de code-barre...');
    
    if (barcodeScanner === null) {
        barcodeScanner = new BarcodeScanner();
        console.log(`🔗 Tentative de connexion à WebSocket...`);
        barcodeScanner.connect();
        console.log('✅ barcodeScanner.js chargé et instance créée');
    }
}

// Initialiser immédiatement si le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserBarcodeScanner);
} else {
    initialiserBarcodeScanner();
}


