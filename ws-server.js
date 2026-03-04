#!/usr/bin/env node

/**
 * Simple WebSocket Server for Barcode Scanner
 * Écoute sur ws://0.0.0.0:3000 (accessible de n'importe quelle interface)
 */

const WebSocket = require('ws');
const http = require('http');
const os = require('os');

const PORT = 3000;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clientCount = 0;

// Gestion des requêtes HTTP
server.on('request', (req, res) => {
    if (req.method === 'POST' && req.url === '/barcode') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const barcode = data.barcode || data.code || data.data || body.trim();
                console.log(`   📱 Barcode reçu via HTTP: ${barcode}`);
                
                // Relayer à tous les clients WebSocket
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(barcode);
                    }
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', barcode: barcode }));
            } catch (err) {
                console.error('   ❌ Erreur parsing HTTP barcode:', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

console.log('🚀 Démarrage du serveur WebSocket/HTTP...');

// Afficher les adresses IP disponibles
const interfaces = os.networkInterfaces();
console.log('\n📍 Adresses IP disponibles:');
Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(addr => {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log(`  ✓ ws://${addr.address}:${PORT}`);
        }
    });
});

console.log(`\n🎯 Serveur WebSocket actif sur ws://0.0.0.0:${PORT}`);

wss.on('connection', (ws) => {
    clientCount++;
    console.log(`\n✅ Client connecté (#${clientCount})`);
    
    // Confirmer la connexion au client
    ws.send(JSON.stringify({ status: 'CONNECTED' }));
    
    ws.on('message', (data) => {
        const msg = data.toString().trim();
        console.log(`   📱 Message reçu: ${msg}`);
        
        // Relayer à tous les clients excepté le sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
        
        // Afficher les clients actifs
        console.log(`   👥 Clients connectés: ${clientCount}`);
    });
    
    ws.on('close', () => {
        clientCount--;
        console.log(`\n❌ Client déconnecté (Restant: ${clientCount})\n`);
    });
    
    ws.on('error', (error) => {
        console.error('⚠️ Erreur client:', error.message);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`\n⏹️  Appuyez sur Ctrl+C pour arrêter le serveur`);
    console.log('=====================================\n');
});

process.on('SIGINT', () => {
    console.log('\n\n⏹️  Arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur fermé');
        process.exit(0);
    });
});

process.on('error', (error) => {
    console.error('❌ Erreur serveur:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.error(`   Le port ${PORT} est déjà utilisé!`);
        console.error('   Arrêtez l\'autre processus ou changez le port dans ws-server.js');
    }
});



