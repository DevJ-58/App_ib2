#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Serveur WebSocket pour Scanner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\wamp64\www\APP_IB"

Write-Host "Verification de Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js n est pas installe!" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js $nodeVersion trouve" -ForegroundColor Green
Write-Host ""

Write-Host "Verification du package ws..." -ForegroundColor Cyan
$wsCheck = npm list ws 2>&1
if ($wsCheck -match "ws@") {
    Write-Host "Package ws trouve" -ForegroundColor Green
} else {
    Write-Host "Package ws non trouve" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Adresses disponibles:" -ForegroundColor Cyan
Write-Host "   ws://localhost:3000" -ForegroundColor Green
Write-Host "   ws://127.0.0.1:3000" -ForegroundColor Green
Write-Host ""

Write-Host "Lancement du serveur..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

node ws-server.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Serveur arrete" -ForegroundColor Green
