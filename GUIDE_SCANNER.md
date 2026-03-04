# 🎯 Guide de Configuration du Scanner de Code-Barre

## ✅ État actuel

Le scanner WebSocket est **entièrement configuré**. Le système est prêt à fonctionner!

## 📊 Archicture du Scanner

```
┌─────────────────────────────────────────────────────┐
│  Scanner Physique (Hardware)                        │
└───────────────┬─────────────────────────────────────┘
                │ (Envoie code-barre en texte)
                ↓
┌─────────────────────────────────────────────────────┐
│  ws-server.js (Port 3000)                           │
│  Serveur WebSocket Node.js                          │
└───────────────┬─────────────────────────────────────┘
                │ (WebSocket communication)
                ↓
┌─────────────────────────────────────────────────────┐
│  barcode-scanner.js                                 │
│  Client WebSocket côté Frontend                     │
│  • Connexion automatique                            │
│  • Reconnexion intelligente (5 tentatives)          │
│  • Émission d'événements                            │
└───────────────┬─────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────────┐
│  main.js - traiterScanCodeBarre()                   │
│                                                     │
│  Détecte la section active:                         │
│  ├─ VENTES: ajoute produit au panier               │
│  ├─ PRODUITS: modal modification (si produit)     │
│  └─ Autres: modal ajout (si nouveau)               │
└─────────────────────────────────────────────────────┘
```

## 🚀 Démarrage du Serveur WebSocket

### Option 1: Utiliser le script batch (Windows)
```bash
# Double-cliquez sur:
start-scanner-server.bat
```

### Option 2: Commande manuelle Windows
```powershell
cd C:\wamp64\www\APP_IB
npm install  # (première fois seulement)
node ws-server.js
```

### Option 3: Terminal Linux/Mac
```bash
cd /var/www/APP_IB
npm install  # (première fois seulement)
node ws-server.js
```

### Résultat attendu:
```
🚀 Démarrage du serveur WebSocket sur le port 3000
🎯 Serveur WebSocket actif sur ws://localhost:3000
⏹️  Appuyez sur Ctrl+C pour arrêter
```

## 📱 Indicateur Scanner dans l'Interface

L'indicateur scanner se trouve dans le header (en haut à droite, avantl'icône cloche):

- 🟢 **Vert + pulsant** = Scanner **CONNECTÉ**
- 🔴 **Rouge fixe** = Scanner **DÉCONNECTÉ**

### États possible:
- ✅ "Connecté" - Scanner prêt à recevoir des codes-barres
- ❌ "Déconnecté" - Pas de connexion avec le serveur WS
- ⚠️ "Erreur" - Problème de connexion
- ❓ "Indisponible" - JavaScript du scanner non chargé

## 🔧 Configuration Détaillée

### ws-server.js
- **Port**: 3000
- **URL**: `ws://localhost:3000`
- **Fonctionnement**: Reçoit les codes-barres du scanner et les relaye à tous les clients

### barcode-scanner.js
- **Connexion automatique** au démarrage
- **Reconnexion intelligente**: 5 tentatives espacées de 3 secondes
- **Support JSON et texte brut**: accepte `{"barcode": "..."}` ou juste `text`

### main.js (traitement des scans)
```javascript
// Événement déclenché quand un code-barre est détecté:
barcodeScanner.on('barcodeScanned', (codeBarre) => {
    traiterScanCodeBarre(codeBarre);  // Traitement automatique
});
```

## 🧪 Test de Fonctionnement

### 1. Vérifier la connexion WebSocket
1. Démarrez le serveur: `node ws-server.js`
2. Ouvrez le dashboard: http://localhost/APP_IB/frontend/HTML/dashbord.html
3. Regardez l'indicateur scanner dans le header
4. Si vert + pulsant = ✅ Connecté!

### 2. Tester un scan
#### En section VENTES:
- Scannez un code-barre d'un produit existant
- ✅ Le produit se'ajoute automatiquement au panier

- Scannez un code-barre inexistant
- ✅ La modal d'ajout produit s'ouvre avec le code-barre pré-rempli

#### En section PRODUITS/AUTRES:
- Scannez un code-barre d'un produit existant
- ✅ La modal de modification s'ouvre avec les infos pré-remplies

- Scannez un code-barre inexistant
- ✅ La modal d'ajout s'ouvre avec le code-barre pré-rempli

## 📋 Dépendances

Le serveur WebSocket utilise Node.js et le package `ws`:

```json
{
  "name": "app-ib-scanner",
  "version": "1.0.0",
  "dependencies": {
    "ws": "^8.13.0"
  }
}
```

Installation automatique via:
```bash
npm install
```

## ⚠️ Dépannage

### "WebSocket can't connect"
- ✅ Vérifiez que le serveur `ws-server.js` est en cours d'exécution
- ✅ Vérifiez le port (doit être 3000 et non utilisé par autre application)

### "Scanner indisponible"
- ✅ Vérifiez que `barcode-scanner.js` est chargé dans le HTML
- ✅ Vérifiez la console navigateur pour les erreurs JavaScript

### "Scanner déconnecté (mais serveur actif)"
- ✅ Vérifiez que la présentation WebSocket n'est pas bloquée par un firewall
- ✅ Essayez de rafraîchir la page (F5)
- ✅ Vérifiez que le port 3000 est accessible depuis le navigateur

### Scanner ne reçoit pas les codes-barres
- ✅ Vérifiez que le scanner physique est connecté et configuré
- ✅ Testez le scanner avec un autre logiciel WebSocket
- ✅ Vérifiez que le scanner envoie bien du texte (pas d'entête/suffixe spécial)

## 🔐 Notes de Sécurité

En production:
- ✅ Utilisez `wss://` (WebSocket Secure) avec certificats SSL
- ✅ Mettez en place une authentification pour le serveur WS
- ✅ Limitez l'accès au port 3000 aux IP autorisées
- ✅ Ajoutez une validation des codes-barres (format, longueur, etc.)

## 📞 Support

Documents connexes:
- `ws-server.js` - Serveur WebSocket
- `barcode-scanner.js` - Client WebSocket JavaScript
- `main.js` - Logique de traitement (fonction `traiterScanCodeBarre()`)
- `dashbord.html` - Interface (indicateur scanner)
- `dashbord.css` - Styles (animation pulse)
