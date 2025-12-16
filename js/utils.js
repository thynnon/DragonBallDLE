// js/utils.js - Fonctions utilitaires

// Mélanger un tableau (Fisher-Yates shuffle)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Obtenir un élément aléatoire d'un tableau
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Formater le temps écoulé
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Sauvegarder dans le localStorage
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        return false;
    }
}

// Charger depuis le localStorage
function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return null;
    }
}

// Supprimer du localStorage
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Erreur de suppression:', error);
        return false;
    }
}

// Créer un délai (promesse)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Vérifier si un objet est vide
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Capitaliser la première lettre
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Normaliser une chaîne (pour comparaisons)
function normalizeString(str) {
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}