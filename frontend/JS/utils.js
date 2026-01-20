// ====================================================================
// FONCTIONS UTILITAIRES - UTILS.JS
// ====================================================================

/* ====================================================================
   GESTION DE L'ÉTAT DU STOCK
   ==================================================================== */

function determinerEtatStock(quantite, seuil) {
    if (quantite === 0) {
        return { classe: 'rupture', libelle: 'Rupture' };
    } else if (quantite < seuil) {
        return { classe: 'critique', libelle: 'Critique' };
    } else if (quantite < seuil * 1.5) {
        return { classe: 'moyen', libelle: 'Moyen' };
    } else {
        return { classe: 'bon', libelle: 'Suffisant' };
    }
}

/* ====================================================================
   NOTIFICATIONS
   ==================================================================== */

function afficherNotification(message, type = 'info') {
    // create a dedicated toast element to avoid conflicts with .notification CSS
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fa-solid fa-${icon}"></i>
            <span class="toast-message">${message}</span>
        </div>
    `;

    const container = document.getElementById('notificationsContainer') || document.body;
    container.appendChild(toast);

    // show then auto-remove
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

/* ====================================================================
   FORMATAGE DE DONNÉES
   ==================================================================== */

function formaterDevise(montant) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
    }).format(montant);
}

function formaterDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formaterHeure(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formaterDateHeure(date) {
    return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* ====================================================================
   VALIDATION DES DONNÉES
   ==================================================================== */

function validerEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validerTelephone(telephone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(telephone);
}

function validerMotDePasse(motDePasse) {
    return motDePasse && motDePasse.length >= 6;
}

function validerNom(nom) {
    return nom && nom.trim().length >= 2;
}

function validerPrix(prix) {
    return prix && !isNaN(prix) && prix > 0;
}

function validerQuantite(quantite) {
    return quantite && !isNaN(quantite) && quantite > 0 && Number.isInteger(Number(quantite));
}

/* ====================================================================
   GESTION DU DOM
   ==================================================================== */

function afficherMessageProfil(divId, message) {
    const messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function effacerDuDOM(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.remove();
    }
}

function montrerElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function cacherElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

/* ====================================================================
   CALCULS UTILITAIRES
   ==================================================================== */

function calculerTotalPanier(panier) {
    return panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
}

function calculerRemise(montantTotal, pourcentageRemise) {
    return (montantTotal * pourcentageRemise) / 100;
}

function calculerTaxe(montantHT, pourcentageTaxe) {
    return (montantHT * pourcentageTaxe) / 100;
}

function calculerMontantFinal(montantHT, pourcentageTaxe = 0, pourcentageRemise = 0) {
    const taxe = calculerTaxe(montantHT, pourcentageTaxe);
    const remise = calculerRemise(montantHT, pourcentageRemise);
    return montantHT + taxe - remise;
}

function calculerRenduMonnaie(montantRecu, montantTotal) {
    return montantRecu - montantTotal;
}

/* ====================================================================
   CONVERSION DE DONNÉES
   ==================================================================== */

function convertirEnBase64(fichier) {
    return new Promise((resolve, reject) => {
        const lecteur = new FileReader();
        lecteur.onload = () => resolve(lecteur.result);
        lecteur.onerror = (error) => reject(error);
        lecteur.readAsDataURL(fichier);
    });
}

function obtenirDateAujourdHui() {
    return new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function obtenirHeureActuelle() {
    return new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/* ====================================================================
   UTILITAIRES DE TABLEAU
   ==================================================================== */

function filtrerTableau(tableau, cle, valeur) {
    return tableau.filter(item => item[cle] === valeur);
}

function trierTableau(tableau, cle, ordre = 'asc') {
    return tableau.sort((a, b) => {
        if (a[cle] < b[cle]) return ordre === 'asc' ? -1 : 1;
        if (a[cle] > b[cle]) return ordre === 'asc' ? 1 : -1;
        return 0;
    });
}

function rechercherDansTableau(tableau, cle, terme) {
    return tableau.filter(item => 
        String(item[cle]).toLowerCase().includes(terme.toLowerCase())
    );
}

/* ====================================================================
   STOCKAGE LOCAL
   ==================================================================== */

function sauvegarderDansLocalStorage(cle, valeur) {
    try {
        localStorage.setItem(cle, JSON.stringify(valeur));
        return true;
    } catch (e) {
        console.error('Erreur lors de la sauvegarde:', e);
        return false;
    }
}

function obtenirDuLocalStorage(cle) {
    try {
        const donnees = localStorage.getItem(cle);
        return donnees ? JSON.parse(donnees) : null;
    } catch (e) {
        console.error('Erreur lors de la lecture:', e);
        return null;
    }
}

function supprimerDuLocalStorage(cle) {
    try {
        localStorage.removeItem(cle);
        return true;
    } catch (e) {
        console.error('Erreur lors de la suppression:', e);
        return false;
    }
}

function viderLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (e) {
        console.error('Erreur lors du vidage:', e);
        return false;
    }
}

/* ====================================================================
   UTILITAIRES DE DÉBOGAGE
   ==================================================================== */

function afficherDebogage(titre, donnees) {
    console.group(titre);
    console.log(donnees);
    console.groupEnd();
}

function afficherAlerte(titre, message) {
    console.warn(`⚠️ ${titre}: ${message}`);
}

function afficherErreur(titre, message) {
    console.error(`❌ ${titre}: ${message}`);
}

function afficherSucces(titre, message) {
    console.log(`✅ ${titre}: ${message}`);
}

/* ====================================================================
   FIN DU FICHIER UTILS.JS
   ==================================================================== */