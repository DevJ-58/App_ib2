# Help and Test Files

Ce dossier contient des scripts, pages et tests qui ne font pas partie du coeur de l'application.
Ils servent uniquement à des fins de débogage ou de démonstration et peuvent être supprimés en production.

- `test-*.php`, `test-*.html`, `test-*.ps1` : suites de tests
- `check-db*.php`, `verify-db-complete.php` : vérification base de données
- `send_*` : scripts d'envoi de requêtes de test
- divers autres utilitaires (seed, debug)

Garder ce dossier séparé afin de ne pas polluer la racine du projet.
