INSERT INTO ventes (numero_vente, client_nom, total, type_paiement, utilisateur_id, date_vente) VALUES
('V-001', 'Jean Kouassi', 23500, 'comptant', 1, '2026-01-20 14:35:00'),
('V-002', 'Marie Bamba', 1500, 'comptant', 1, '2026-01-20 13:20:00'),
('V-003', 'Koné Abou', 4500, 'credit', 1, '2026-01-20 12:45:00'),
('V-004', 'Fofana Ali', 2800, 'comptant', 1, '2026-01-20 11:15:00'),
('V-005', 'Personnel UIYA', 6200, 'credit', 1, '2026-01-20 10:30:00');

INSERT INTO credits (reference, vente_id, client_nom, type_client, montant_total, montant_paye, montant_restant, statut) VALUES
('CRD-20260120143500', 3, 'Koné Abou', 'ETUDIANT', 4500, 0, 4500, 'en_cours'),
('CRD-20260120103000', 5, 'Personnel UIYA', 'PERSONNEL', 6200, 2000, 4200, 'en_cours');
