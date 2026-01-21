// ====================================================================
// SYSTÈME D'AUTHENTIFICATION - VERSION API REST
// ====================================================================

let utilisateurConnecte = null;

/**
 * Initialiser l'authentification et vérifier la session existante
 */
async function initialiserAuthentification() {
    try {
        // Essayer d'abord localStorage
        const userFromStorage = localStorage.getItem('utilisateur');
        if (userFromStorage) {
            utilisateurConnecte = JSON.parse(userFromStorage);
            console.log('✅ Session utilisateur restaurée depuis localStorage:', utilisateurConnecte);
            return;
        }
        
        // Sinon vérifier via API
        const response = await api.checkSession();
        if (response.success && response.user) {
            utilisateurConnecte = response.user;
            localStorage.setItem('utilisateur', JSON.stringify(response.user));
            localStorage.setItem('username', `${response.user.prenom} ${response.user.nom}`);
            localStorage.setItem('utilisateur_id', response.user.id);
            console.log('✅ Session utilisateur restaurée:', utilisateurConnecte);
        }
    } catch (error) {
        console.log('ℹ️ Aucune session active');
        utilisateurConnecte = null;
    }
}

/**
 * Fonction de connexion avec API
 */
async function seConnecter(telephone, motDePasse) {
    try {
        console.log('📤 seConnecter() début - envoi POST à /Api/Auth/login.php');
        console.log('   Data: telephone=' + telephone + ', mot_de_passe=' + motDePasse);
        
        const response = await api.login(telephone, motDePasse);
        console.log('📥 Réponse reçue:', response);

        if (response.success && response.data) {
            utilisateurConnecte = response.data;
            // Sauvegarder en localStorage
            localStorage.setItem('utilisateur', JSON.stringify(response.data));
            localStorage.setItem('username', `${response.data.prenom} ${response.data.nom}`);
            localStorage.setItem('utilisateur_id', response.data.id);
            console.log('✅ Connexion RÉUSSIE - utilisateur:', utilisateurConnecte);
            afficherUtilisateurHeader();
            console.log('📢 Affichage notification...');
            afficherNotification(`Bienvenue ${response.data.prenom} ${response.data.nom}!`, 'success');

            return {
                success: true,
                message: response.message || 'Connexion réussie'
            };
        } else {
            console.error('❌ Réponse invalide:', response);
            afficherNotification(response.message || 'Erreur de connexion', 'error');
            return {
                success: false,
                message: response.message || 'Erreur de connexion'
            };
        }
    } catch (error) {
        console.error('❌ EXCEPTION dans seConnecter():', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        afficherNotification(error.message, 'error');
        return {
            success: false,
            message: error.message || 'Erreur API'
        };
    }
}

/**
 * Fonction d'inscription avec API
 */
async function sInscrire(nom, prenom, telephone, email, motDePasse, confirmMotDePasse) {
    console.log('🔐 sInscrire() appelée avec:', { nom, prenom, telephone, email });
    
    // Validation basique côté client
    if (!nom || !prenom || !telephone || !email || !motDePasse || !confirmMotDePasse) {
        const msg = 'Tous les champs sont obligatoires';
        console.warn('🔐 sInscrire: validation échouée -', msg);
        afficherNotification(msg, 'error');
        return {
            success: false,
            message: msg
        };
    }

    if (motDePasse !== confirmMotDePasse) {
        const msg = 'Les mots de passe ne correspondent pas';
        console.warn('🔐 sInscrire: mots de passe non identiques');
        afficherNotification(msg, 'error');
        return {
            success: false,
            message: msg
        };
    }

    // Format téléphone (10 chiffres)
    if (!/^\d{10}$/.test(telephone)) {
        const msg = 'Le téléphone doit contenir 10 chiffres';
        console.warn('🔐 sInscrire: format téléphone invalide');
        afficherNotification(msg, 'error');
        return {
            success: false,
            message: msg
        };
    }

    // Format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const msg = 'L\'email n\'est pas valide';
        console.warn('🔐 sInscrire: format email invalide');
        afficherNotification(msg, 'error');
        return {
            success: false,
            message: msg
        };
    }

    try {
        console.log('🔐 sInscrire: appel api.register...');
        const response = await api.register(nom, prenom, telephone, email, motDePasse, confirmMotDePasse);
        
        console.log('🔐 sInscrire: réponse API reçue:', response);
        
        if (response.success && response.data) {
            utilisateurConnecte = response.data;
            // Sauvegarder en localStorage
            localStorage.setItem('utilisateur', JSON.stringify(response.data));
            localStorage.setItem('username', `${response.data.prenom} ${response.data.nom}`);
            localStorage.setItem('utilisateur_id', response.data.id);
            console.log('✅ 🔐 sInscrire: SUCCESS - utilisateur créé:', utilisateurConnecte);
            afficherUtilisateurHeader();
            
            afficherNotification(`Bienvenue ${response.data.prenom} ${response.data.nom}!`, 'success');
            
            // Rediriger vers le dashboard après 1.5s
            setTimeout(() => {
                console.log('🔄 sInscrire: redirection vers dashbord.html...');
                window.location.href = 'dashbord.html';
            }, 1500);

            return {
                success: true,
                message: response.message
            };
        } else {
            const msg = response.message || 'Erreur lors de l\'inscription';
            console.error('❌ 🔐 sInscrire: ERREUR API -', msg);
            afficherNotification(msg, 'error');
            return {
                success: false,
                message: msg
            };
        }
    } catch (error) {
        console.error('❌ 🔐 sInscrire: EXCEPTION -', error.message, error);
        afficherNotification(error.message, 'error');
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Fonction de déconnexion avec API
 */
async function deconnecterUtilisateur() {
    try {
        const response = await api.logout();
        
        utilisateurConnecte = null;
        // Nettoyer localStorage
        localStorage.removeItem('utilisateur');
        localStorage.removeItem('username');
        localStorage.removeItem('utilisateur_id');
        afficherNotification('Vous avez été déconnecté', 'success');
        afficherUtilisateurHeader();
        
        // Rediriger vers la page de connexion après 1s
        setTimeout(() => {
            window.location.href = '../HTML/connexion.html';
        }, 1000);

        return {
            success: true,
            message: response.message
        };
    } catch (error) {
        afficherNotification(error.message, 'error');
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
function estAuthentifie() {
    return utilisateurConnecte !== null;
}

/**
 * Rediriger vers la page de connexion si non authentifié (pour le dashboard)
 */
async function verifierAuthentification() {
    const pageActuelle = window.location.pathname.toLowerCase();
    
    console.log('🔐 verifierAuthentification() - Page actuelle:', pageActuelle);
    
    // Vérifier si on est sur une page protégée
    if (pageActuelle.includes('dashbord.html') || pageActuelle.includes('dashboard')) {
        console.log('🔐 Page protégée détectée - appel check.php...');
        
        try {
            const response = await api.checkSession();
            console.log('📊 Réponse check.php:', response);
            
            if (!response.success || !response.data) {
                console.log('❌ Session invalide (success=false ou no data)');
                console.log('   Response.success:', response.success);
                console.log('   Response.data:', response.data);
                console.log('   Redirection vers connexion.html...');
                window.location.href = '../HTML/connexion.html';
                return false;
            } else {
                console.log('✅ Session VALIDE');
                console.log('   Utilisateur:', response.data);
                utilisateurConnecte = response.data;
                afficherUtilisateurHeader();
                return true;
            }
        } catch (error) {
            console.error('❌ EXCEPTION dans check.php:', error);
            console.error('   Message:', error.message);
            console.log('   Redirection vers connexion.html...');
            window.location.href = '../HTML/connexion.html';
            return false;
        }
    } else {
        console.log('ℹ️ Pas une page protégée');
        return true;
    }
}

/**
 * Changer le mot de passe
 */
async function changerMotDePasse(ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse) {
    if (nouveauMotDePasse !== confirmationMotDePasse) {
        afficherNotification('Les mots de passe ne correspondent pas', 'error');
        return {
            success: false,
            message: "Les mots de passe ne correspondent pas"
        };
    }

    try {
        const response = await api.changePassword(ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse);
        
        if (response.success) {
            afficherNotification('Mot de passe changé avec succès', 'success');
            return {
                success: true,
                message: response.message
            };
        } else {
            afficherNotification(response.message, 'error');
            return {
                success: false,
                message: response.message
            };
        }
    } catch (error) {
        afficherNotification(error.message, 'error');
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Uploader une photo de profil
 */
async function uploaderPhoto(fileInput) {
    try {
        console.log('📤 Uploader photo...');
        const response = await api.uploadPhoto(fileInput);
        console.log('📥 Réponse upload:', response);

        if (response.success && response.data) {
            utilisateurConnecte = response.data;
            console.log('✅ Photo téléchargée avec succès');
            afficherPhotoProfil();
            afficherNotification('Photo téléchargée avec succès', 'success');
            return {
                success: true,
                message: 'Photo téléchargée avec succès'
            };
        } else {
            console.error('❌ Erreur upload:', response);
            afficherNotification(response.message || 'Erreur upload', 'error');
            return {
                success: false,
                message: response.message || 'Erreur upload'
            };
        }
    } catch (error) {
        console.error('❌ EXCEPTION upload:', error);
        afficherNotification(error.message, 'error');
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Afficher la photo du profil utilisateur
 */
function afficherPhotoProfil() {
    if (!utilisateurConnecte) {
        console.log('⚠️ Pas d\'utilisateur connecté');
        return;
    }
    
    const photoURL = utilisateurConnecte.photo;
    console.log('📷 Affichage photo profil:', photoURL || '(null)');
    
    // Mettre à jour l'image du header
    const photoHeader = document.getElementById('photoProfilHeader');
    if (photoHeader && photoURL) {
        photoHeader.src = photoURL;
    }
    
    // Mettre à jour l'image du profil preview
    const photoPreview = document.getElementById('profilPhotoPreview');
    if (photoPreview && photoURL) {
        photoPreview.src = photoURL;
    }
}

/**
 * Mettre à jour l'affichage du header avec le nom de l'utilisateur connecté
 */
function afficherUtilisateurHeader() {
    const nomSpan = document.querySelector('.nom-utilisateur');
    if (!utilisateurConnecte) {
        if (nomSpan) nomSpan.textContent = 'Invité';
        // remettre l'avatar par défaut
        const photoHeader = document.getElementById('photoProfilHeader');
        if (photoHeader) photoHeader.src = 'https://via.placeholder.com/40';
        return;
    }

    if (nomSpan) {
        const prenom = utilisateurConnecte.prenom || '';
        const nom = utilisateurConnecte.nom || '';
        nomSpan.textContent = (prenom || nom) ? `${prenom} ${nom}`.trim() : (utilisateurConnecte.email || utilisateurConnecte.telephone || 'Utilisateur');
    }

    // Mettre à jour la photo si disponible
    afficherPhotoProfil();
}

/**
 * Obtenir l'utilisateur connecté
 */
function getUtilisateurConnecte() {
    return utilisateurConnecte;
}

// Attacher les gestionnaires de formulaires d'authentification
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth-api: DOMContentLoaded - attachement formulaires auth');
    
    // ==================== FORMULAIRE CONNEXION ====================
    const formConn = document.getElementById('formConnexion');
    if (formConn) {
        console.log('auth-api: formConnexion trouvé - attachement submit');
        formConn.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('auth-api: formConnexion submit reçu');
            const telephone = document.getElementById('telephone')?.value.trim();
            const motDePasse = document.getElementById('motDePasse')?.value;
            const zoneErreur = document.getElementById('messageErreur');

            if (zoneErreur) {
                zoneErreur.style.display = 'none';
                zoneErreur.textContent = '';
            }

            if (!telephone || !motDePasse) {
                console.log('auth-api: données manquantes');
                if (zoneErreur) {
                    zoneErreur.style.display = 'block';
                    zoneErreur.textContent = 'Veuillez saisir téléphone et mot de passe';
                }
                return;
            }

            try {
                console.log('auth-api: appel seConnecter', telephone);
                const result = await seConnecter(telephone, motDePasse);
                console.log('auth-api: seConnecter résultat', result);
                if (result && result.success) {
                    // Redirection vers dashboard après un court délai
                    setTimeout(() => {
                        window.location.href = 'dashbord.html';
                    }, 700);
                } else {
                    if (zoneErreur) {
                        zoneErreur.style.display = 'block';
                        zoneErreur.textContent = result?.message || 'Erreur de connexion';
                    }
                }
            } catch (err) {
                console.error('auth-api: exception seConnecter', err);
                if (zoneErreur) {
                    zoneErreur.style.display = 'block';
                    zoneErreur.textContent = err.message || 'Erreur réseau';
                }
            }
        });
    } else {
        console.log('auth-api: formConnexion non trouvé');
    }
    
    // ==================== FORMULAIRE INSCRIPTION ====================
    const formInsc = document.getElementById('formInscription');
    if (formInsc) {
        console.log('auth-api: formInscription trouvé - attachement submit');
        formInsc.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔐 INSCRIPTION: submit event reçu');
            
            const nom = document.getElementById('nom')?.value.trim();
            const prenom = document.getElementById('prenom')?.value.trim();
            const telephone = document.getElementById('telephone')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const motDePasse = document.getElementById('motDePasse')?.value;
            const confirmMotDePasse = document.getElementById('confirmMotDePasse')?.value;
            const zoneErreur = document.getElementById('messageErreur');

            if (zoneErreur) {
                zoneErreur.style.display = 'none';
                zoneErreur.textContent = '';
            }

            console.log('🔐 INSCRIPTION: données du formulaire:', { 
                nom, 
                prenom, 
                telephone, 
                email,
                motDePasse_length: motDePasse?.length,
                confirmMotDePasse_length: confirmMotDePasse?.length
            });

            if (!nom || !prenom || !telephone || !email || !motDePasse || !confirmMotDePasse) {
                console.warn('🔐 INSCRIPTION: champs manquants');
                if (zoneErreur) {
                    zoneErreur.style.display = 'block';
                    zoneErreur.textContent = 'Tous les champs sont obligatoires';
                }
                return;
            }

            try {
                console.log('🔐 INSCRIPTION: appel de sInscrire...');
                const result = await sInscrire(nom, prenom, telephone, email, motDePasse, confirmMotDePasse);
                console.log('🔐 INSCRIPTION: résultat sInscrire', result);
                
                if (result && result.success) {
                    console.log('🔐 INSCRIPTION: succès - redirection prévue par sInscrire()');
                } else {
                    console.warn('🔐 INSCRIPTION: erreur -', result?.message);
                    if (zoneErreur) {
                        zoneErreur.style.display = 'block';
                        zoneErreur.textContent = result?.message || 'Erreur lors de l\'inscription';
                    }
                }
            } catch (err) {
                console.error('🔐 INSCRIPTION: exception', err);
                if (zoneErreur) {
                    zoneErreur.style.display = 'block';
                    zoneErreur.textContent = err.message || 'Erreur réseau';
                }
            }
        });
    } else {
        console.log('auth-api: formInscription non trouvé');
    }
});
