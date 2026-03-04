@echo off
cls
echo =============================================================
echo  Démarrage du Serveur WebSocket Scanner de Code-Barre
echo =============================================================
echo.

REM Vérifier que node est installé
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ ERREUR: Node.js n'est pas installé ou non trouvé dans le PATH
    echo.
    echo Téléchargez Node.js depuis: https://nodejs.org/
    echo Puis relancez ce script
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

REM Vérifier les dépendances
echo Vérification des dépendances npm...
if not exist "node_modules" (
    echo.
    echo 📦 Installation des dépendances (première fois)...
    call npm install
    if errorlevel 1 (
        echo ❌ ERREUR lors de l'installation des dépendances
        pause
        exit /b 1
    )
)

echo.
echo =============================================================
echo  ✅ Démarrage du serveur WebSocket...
echo =============================================================
echo.
echo  🎯 URL de connexion: ws://localhost:3000
echo  ⏹️  Appuyez sur Ctrl+C pour arrêter
echo.
echo =============================================================
echo.

call node ws-server.js

pause
