/**
 * Test WebSocket Simple
 */

const WebSocket = require('ws');

console.log('=== TEST WEBSOCKET ===\n');

// Test 1: Créer un serveur WebSocket simple
console.log('Test 1: Créer le serveur...');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

server.listen(3000, '0.0.0.0', () => {
    console.log('✓ Serveur créé sur port 3000\n');

    // Test 2: Créer une connexion client
    console.log('Test 2: Créer une connexion client...');
    const client = new WebSocket('ws://localhost:3000');

    client.onopen = () => {
        console.log('✓ Client connecté!\n');
        
        // Test 3: Envoyer un message
        console.log('Test 3: Envoyer un message...');
        client.send('HELLO');
        console.log('✓ Message envoyé\n');
        
        // Fermer après 1 seconde
        setTimeout(() => {
            console.log('Test 4: Fermeture des connexions...');
            client.close();
            server.close(() => {
                console.log('✓ Serveur fermé');
                console.log('\n=== TOUS LES TESTS PASSENT ===');
                process.exit(0);
            });
        }, 1000);
    };

    client.onerror = (error) => {
        console.error('✗ ERREUR CLIENT:', error.message);
        server.close();
        process.exit(1);
    };

    wss.on('connection', (ws) => {
        console.log('✓ Client accepté par le serveur');
        ws.on('message', (msg) => {
            console.log('✓ Serveur reçu:', msg);
        });
    });
});

server.on('error', (error) => {
    console.error('✗ ERREUR SERVEUR:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.error('  Port 3000 est déjà utilisé!');
    }
    process.exit(1);
});

// Timeout après 5 secondes
setTimeout(() => {
    console.error('✗ TIMEOUT - le test a dépassé 5 secondes');
    process.exit(1);
}, 5000);
