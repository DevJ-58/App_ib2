@echo off
cls
echo =============================================================
echo  TEST RAPIDE DE CONNEXION WEBSOCKET
echo =============================================================
echo.

REM Test de connexion au serveur WebSocket
echo Test de connexion au serveur WebSocket...
echo.

curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://192.168.1.119:3000 2>nul
if errorlevel 1 (
    echo ❌ ERREUR: Impossible de contacter le serveur WebSocket
    echo.
    echo Vérifications:
    echo 1. Le serveur WebSocket est-il lancé? (node ws-server.js)
    echo 2. L'adresse IP 192.168.1.119 est-elle correcte?
    echo 3. Le port 3000 est-il ouvert?
    echo.
    pause
    exit /b 1
)

echo ✅ Serveur WebSocket accessible
echo.

REM Test de connexion WebSocket avec PowerShell
echo Test de connexion WebSocket...
powershell -Command "
try {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $uri = [System.Uri]'ws://192.168.1.119:3000'
    $connectTask = $ws.ConnectAsync($uri, $cts.Token)
    $connectTask.Wait(5000)
    if ($connectTask.IsCompleted -and $ws.State -eq 'Open') {
        Write-Host '✅ WebSocket connection successful' -ForegroundColor Green
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, '', $cts.Token).Wait()
    } else {
        Write-Host '❌ WebSocket connection failed' -ForegroundColor Red
    }
} catch {
    Write-Host '❌ WebSocket test error:' $_.Exception.Message -ForegroundColor Red
}
"

echo.
echo =============================================================
echo  INSTRUCTIONS:
echo =============================================================
echo.
echo 1. Ouvrez le dashboard: http://192.168.1.119/APP_IB/frontend/HTML/dashbord.html
echo 2. Appuyez sur Ctrl+Shift+R pour forcer le rechargement
echo 3. Ouvrez la console F12
echo 4. Cliquez sur le bouton "Test" à côté de l'indicateur scanner
echo 5. Vérifiez les logs dans la console
echo.
echo =============================================================
pause