const WebSocket = require('ws');
const http = require('http');

const PORT = 3000;
const HOST = '0.0.0.0';

console.log('🚀 Vérification du serveur WebSocket...');
console.log(`  Port: ${PORT}`);
console.log(`  Host: ${HOST}`);

try {
    const server = http.createServer();
    const wss = new WebSocket.Server({ server });

    server.listen(PORT, HOST, () => {
        console.log('✅ Serveur WebSocket LANCÉ');
        console.log(`   ws://localhost:${PORT}`);
        console.log(`   ws://127.0.0.1:${PORT}`);
        console.log(`   ws://0.0.0.0:${PORT}`);
        console.log('\n⏳ En écoute de connexions...\n');
    });

    wss.on('connection', (ws) => {
        console.log('✅ Client connecté!');
        ws.send(JSON.stringify({ status: 'CONNECTED' }));
        
        ws.on('message', (data) => {
            console.log('📡 Message:', data.toString());
        });
        
        ws.on('close', () => {
            console.log('❌ Client déconnecté');
        });
    });

    server.on('error', (error) => {
        console.error('❌ Erreur serveur:', error.message);
        if (error.code === 'EADDRINUSE') {
            console.error(`   Port ${PORT} déjà utilisé!`);
        }
    });

    // Afficher que le serveur est prêt
    setTimeout(() => {
        console.log('⚠️ Serveur prêt à accepter les connexions...');
    }, 500);

} catch (err) {
    console.error('❌ ERREUR:', err.message);
    process.exit(1);
}
