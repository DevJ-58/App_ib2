#!/bin/bash

clear

echo "============================================================="
echo "  Démarrage du Serveur WebSocket Scanner de Code-Barre"
echo "============================================================="
echo ""

# Vérifier que node est installé
if ! command -v node &> /dev/null; then
    echo "❌ ERREUR: Node.js n'est pas installé"
    echo ""
    echo "Installez Node.js avec:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS: brew install node"
    echo ""
    echo "Puis relancez ce script"
    exit 1
fi

echo "✅ Node.js détecté"
echo ""

# Vérifier les dépendances
echo "Vérification des dépendances npm..."
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installation des dépendances (première fois)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ ERREUR lors de l'installation des dépendances"
        exit 1
    fi
fi

echo ""
echo "============================================================="
echo "  ✅ Démarrage du serveur WebSocket..."
echo "============================================================="
echo ""
echo "  🎯 URL de connexion: ws://localhost:3000"
echo "  ⏹️  Appuyez sur Ctrl+C pour arrêter"
echo ""
echo "============================================================="
echo ""

node ws-server.js
