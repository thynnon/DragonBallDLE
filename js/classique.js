// ===== VARIABLES GLOBALES MODE CLASSIQUE =====
let personnages = [];
let personnagesSelectionnes = [];
let personnageDuJour = null;

let userStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    averageAttempts: 0,
    totalAttempts: 0
};

let enabledSeries = ["Dragon Ball", "Dragon Ball Z", "Dragon Ball Super"]; // Par défaut toutes les séries

// ===== SYSTÈME D'INDICES =====
let hintButtonsClassique = {
    cheveux: { unlockAt: 5, visible: false, unlocked: false, revealed: false },
    apparition: { unlockAt: 9, visible: false, unlocked: false, revealed: false },
    affiliation: { unlockAt: 13, visible: false, unlocked: false, revealed: false }
};

// ===== CHARGEMENT DES DONNÉES =====
async function loadPersonnages() {
    try {
        const response = await fetch('js/data.json');
        if (!response.ok) throw new Error('Erreur de chargement des données');
        
        const data = await response.json();
        personnages = data.personnages;
        
        console.log(`${personnages.length} personnages chargés`);
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

// ===== UTILITAIRES =====
function getPersonnagePhotoUrl(perso) {
    if (perso.photo && perso.photo.startsWith('http')) return perso.photo;
    if (perso.photo) return `assets/img/personnages/${perso.photo}`;
    return `https://via.placeholder.com/80x80/FF9900/FFFFFF?text=${perso.nom.charAt(0)}`;
}

function getDailySeed() {
    const today = new Date();
    const baseSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const resetCounter = parseInt(localStorage.getItem('dbResetCounter_classique') || '0');
    return baseSeed + (resetCounter * 123456);
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
}

function updateCountdown() {
    const countdownElement = document.getElementById('countdown-timer-classique');
    if (countdownElement) countdownElement.textContent = getTimeUntilMidnight();
}

function getArrowIcon(direction) {
    if (!direction) return '';
    const path = direction === 'up' 
        ? 'M12 5L12 19M12 5L6 11M12 5L18 11' 
        : 'M12 19L12 5M12 19L18 13M12 19L6 13';
    return `<span class="arrow-indicator"><svg viewBox="0 0 24 24" fill="none"><path d="${path}" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeRace(race) {
    if (Array.isArray(race)) return race.join(', ');
    return race;
}

// ===== LOGIQUE DU JEU =====
function selectDailyPersonnage() {
    if (personnages.length === 0) {
        console.error('Aucun personnage chargé');
        return null;
    }
    
    const filteredPersonnages = personnages.filter(p => enabledSeries.includes(p.serie));
    
    if (filteredPersonnages.length === 0) {
        console.warn('Aucun personnage disponible - Réactivation de toutes les séries');
        enabledSeries = ["Dragon Ball", "Dragon Ball Z", "Dragon Ball Super"];
        saveEnabledSeries();
        return selectDailyPersonnage();
    }
    
    const seed = getDailySeed();
    const randomValue = seededRandom(seed);
    const index = Math.floor(randomValue * filteredPersonnages.length);
    personnageDuJour = filteredPersonnages[index];
    
    console.log('✅ Personnage du jour:', personnageDuJour.nom, '- Série', personnageDuJour.serie);
    return personnageDuJour;
}

function compareWithDailyPersonnage(perso) {
    if (!personnageDuJour) return null;
    
    const compareValue = (val1, val2) => {
        const num1 = parseInt(val1);
        const num2 = parseInt(val2);
        
        if (isNaN(num1) || isNaN(num2)) {
            return { status: val1 === val2 ? 'correct' : 'incorrect', direction: null };
        }
        
        return {
            status: num1 === num2 ? 'correct' : 'incorrect',
            direction: num1 < num2 ? 'up' : (num1 > num2 ? 'down' : null)
        };
    };
    
    const compareRace = (race1, race2) => {
        const r1 = normalizeRace(race1);
        const r2 = normalizeRace(race2);
        return r1 === r2 ? 'correct' : 'incorrect';
    };
    
    return {
        race: compareRace(perso.race, personnageDuJour.race),
        origine: perso.origine === personnageDuJour.origine ? 'correct' : 'incorrect',
        genre: perso.genre === personnageDuJour.genre ? 'correct' : 'incorrect',
        transformations: compareValue(perso.NbTransformation, personnageDuJour.NbTransformation),
        morts: compareValue(perso.NbMorts, personnageDuJour.NbMorts),
        saga: perso.saga === personnageDuJour.saga ? 'correct' : 'incorrect',
        serie: perso.serie === personnageDuJour.serie ? 'correct' : 'incorrect',
        cheveux: perso.couleurCheveuxBase === personnageDuJour.couleurCheveuxBase ? 'correct' : 'incorrect',
        isCorrectPersonnage: perso.id === personnageDuJour.id
    };
}

// ===== SYSTÈME D'INDICES =====
function updateHintButtonsClassique() {
    const attempts = personnagesSelectionnes.length;
    
    if (attempts >= 1) {
        hintButtonsClassique.cheveux.visible = true;
        hintButtonsClassique.apparition.visible = true;
        hintButtonsClassique.affiliation.visible = true;
    }
    
    if (attempts >= 5) hintButtonsClassique.cheveux.unlocked = true;
    if (attempts >= 9) hintButtonsClassique.apparition.unlocked = true;
    if (attempts >= 13) hintButtonsClassique.affiliation.unlocked = true;
    
    renderHintButtonsClassique();
}

function toggleHintClassique(hintType) {
    const config = hintButtonsClassique[hintType];
    if (!config || !config.unlocked) return;
    
    config.revealed = !config.revealed;
    renderHintButtonsClassique();
}

function renderHintButtonsClassique() {
    const container = document.querySelector('#classique-mode .hint-buttons-container');
    if (!container) return;
    
    const attempts = personnagesSelectionnes.length;
    
    const hints = [
        {
            type: 'cheveux',
            icon: '💇',
            label: 'Cheveux',
            value: personnageDuJour?.couleurCheveuxBase || 'N/A',
            unlockAt: 5
        },
        {
            type: 'apparition',
            icon: '📺',
            label: 'Apparition',
            value: personnageDuJour?.premierEpisodeApparition || 'N/A',
            unlockAt: 9
        },
        {
            type: 'affiliation',
            icon: '⭐',
            label: 'Affiliation',
            value: 'À venir',
            unlockAt: 13
        }
    ];
    
    const previousStates = {};
    container.querySelectorAll('.hint-button').forEach(btn => {
        const type = btn.getAttribute('data-hint');
        previousStates[type] = {
            visible: btn.classList.contains('visible'),
            unlocked: btn.classList.contains('unlocked'),
            revealed: btn.classList.contains('active')
        };
    });
    
    container.innerHTML = hints.map(hint => {
        const config = hintButtonsClassique[hint.type];
        const isVisible = config.visible;
        const isUnlocked = config.unlocked;
        const attemptsNeeded = hint.unlockAt - attempts;
        
        const wasVisible = previousStates[hint.type]?.visible || false;
        const isFirstReveal = isVisible && !wasVisible;
        
        return `
            <div class="hint-button ${isVisible ? 'visible' : ''} ${isUnlocked ? 'unlocked' : ''} ${config.revealed ? 'active' : ''} ${isFirstReveal ? 'first-reveal' : ''}" 
                 data-hint="${hint.type}"
                 ${isUnlocked ? `onclick="toggleHintClassique('${hint.type}')"` : ''}>
                <div class="hint-icon">${hint.icon}</div>
                <div class="hint-label">${hint.label}</div>
                ${!isUnlocked ? `
                    <div class="hint-lock">
                        🔒
                        <span class="hint-unlock-text">
                            ${attemptsNeeded > 0 ? `${attemptsNeeded} essai${attemptsNeeded > 1 ? 's' : ''}` : 'Bientôt...'}
                        </span>
                    </div>
                ` : `
                    <div class="hint-value ${config.revealed ? 'revealed' : ''}">
                        ${hint.value}
                    </div>
                `}
            </div>
        `;
    }).join('');
    
    setTimeout(() => {
        container.querySelectorAll('.hint-button.first-reveal').forEach(btn => {
            btn.classList.remove('first-reveal');
        });
    }, 500);
}

// ===== VICTOIRE =====
function showVictoryBoxClassique() {
    if (document.getElementById('victory-box-classique')) return;
    
    const searchInput = document.getElementById('searchInputClassique');
    searchInput.disabled = true;
    searchInput.placeholder = "Personnage trouvé ! Revenez demain...";
    
    const victoryHTML = `
        <div class="victory-container" id="victory-box-classique">
            <div class="box">
                <div class="title victory-title">🎉 VICTOIRE ! 🎉</div>
                <div class="victory-content">
                    <img src="${getPersonnagePhotoUrl(personnageDuJour)}" 
                         alt="${personnageDuJour.nom}" 
                         class="victory-photo"
                         onerror="this.src='https://via.placeholder.com/150x150/FF9900/FFFFFF?text=${personnageDuJour.nom.charAt(0)}'">
                    <div class="victory-text">
                        Bravo ! Vous avez trouvé <strong>${personnageDuJour.nom}</strong> !
                    </div>
                    <div class="victory-stats">
                        <div class="stat-item">
                            <span class="stat-label">Nombre d'essais :</span>
                            <span class="stat-value">${personnagesSelectionnes.length}</span>
                        </div>
                        <div class="stat-item countdown-item">
                            <span class="stat-label">Personnage suivant dans : </span>
                            <span class="stat-value" id="countdown-timer-classique">${getTimeUntilMidnight()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const selectedContainer = document.getElementById('resultsClassique');
    selectedContainer.insertAdjacentHTML('afterend', victoryHTML);
    
    setTimeout(() => {
        const victoryBox = document.getElementById('victory-box-classique');
        if (victoryBox) {
            victoryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
    
    setInterval(updateCountdown, 1000);
    saveGameStateClassique();
    updateStatsOnWin();
}

// ===== RECHERCHE =====
function searchPersonnages(query) {
    if (!query || query.length < 1) return [];
    
    const normalizedQuery = removeAccents(query.toLowerCase());
    
    return personnages.filter(perso => {
        const matchesSearch = removeAccents(perso.nom.toLowerCase()).includes(normalizedQuery);
        const notSelected = !personnagesSelectionnes.some(selected => selected.id === perso.id);
        const serieEnabled = enabledSeries.includes(perso.serie);
        
        return matchesSearch && notSelected && serieEnabled;
    }).slice(0, 8);
}

function showSuggestionsClassique(personnages) {
    const suggestionsContainer = document.getElementById('suggestionsClassique');
    
    if (personnages.length === 0) {
        suggestionsContainer.innerHTML = '<div class="no-results">🔍 Aucun personnage trouvé</div>';
        suggestionsContainer.className = 'suggestions show';
        return;
    }

    suggestionsContainer.innerHTML = personnages.map(perso => `
        <div class="suggestion-item" data-perso-id="${perso.id}">
            <img src="${getPersonnagePhotoUrl(perso)}" alt="${perso.nom}" class="player-photo"
                 onerror="this.src='https://via.placeholder.com/50x50/FF9900/FFFFFF?text=${perso.nom.charAt(0)}'">
            <div class="player-info">
                <div class="player-name">${perso.nom}</div>
            </div>
        </div>
    `).join('');
    
    suggestionsContainer.className = 'suggestions show';

    document.querySelectorAll('#suggestionsClassique .suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            selectPersonnage(parseInt(item.getAttribute('data-perso-id')));
        });
    });
}

function hideSuggestionsClassique() {
    const suggestionsContainer = document.getElementById('suggestionsClassique');
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.className = 'suggestions';
}

// ===== SÉLECTION DE PERSONNAGE =====
function selectPersonnage(persoId) {
    const perso = personnages.find(p => p.id === persoId);
    if (!perso || personnagesSelectionnes.some(s => s.id === persoId)) return;

    personnagesSelectionnes.push(perso);
    const searchInput = document.getElementById('searchInputClassique');
    searchInput.value = '';
    hideSuggestionsClassique();

    const comparison = compareWithDailyPersonnage(perso);
    const alreadyWon = document.getElementById('victory-box-classique') !== null;

    displaySelectedPersonnages();
    updateHintButtonsClassique();

    setTimeout(() => {
        const selectedContainer = document.getElementById('resultsClassique');
        selectedContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    if (comparison?.isCorrectPersonnage && !alreadyWon) {
        setTimeout(() => {
            showVictoryBoxClassique();
        }, 3000);
    }

    saveGameStateClassique();
}

// ===== AFFICHAGE =====
function displaySelectedPersonnages() {
    const container = document.getElementById('resultsClassique');
    
    if (personnagesSelectionnes.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <div class="categories-header">
            <div class="category-header-item">Personnage</div>
            <div class="category-header-item">Race</div>
            <div class="category-header-item">Origine</div>
            <div class="category-header-item">Genre</div>
            <div class="category-header-item">Transformations</div>
            <div class="category-header-item">Morts</div>
            <div class="category-header-item">Saga</div>
            <div class="category-header-item">Série</div>
        </div>
        <div id="personnages-list">
    `;

    [...personnagesSelectionnes].reverse().forEach((perso, index) => {
        const c = compareWithDailyPersonnage(perso);
        const isNewPerso = index === 0 ? ' new-player' : '';
        
        html += `
            <div class="selected-player${isNewPerso}">
                <div class="player-categories">
                    <div class="category">
                        <div class="category-content">
                            <img src="${getPersonnagePhotoUrl(perso)}" alt="${perso.nom}" class="player-main-photo"
                                 onerror="this.src='https://via.placeholder.com/80x80/FF9900/FFFFFF?text=${perso.nom.charAt(0)}'">
                            <span class="player-name-main">${perso.nom}</span>
                        </div>
                    </div>
                    <div class="category ${c.race}">
                        <div class="category-content">
                            <span class="category-value">${normalizeRace(perso.race)}</span>
                        </div>
                    </div>
                    <div class="category ${c.origine}">
                        <div class="category-content">
                            <span class="category-value">${perso.origine}</span>
                        </div>
                    </div>
                    <div class="category ${c.genre}">
                        <div class="category-content">
                            <span class="category-value">${perso.genre}</span>
                        </div>
                    </div>
                    <div class="category ${c.transformations.status}">
                        <div class="category-content">
                            ${c.transformations.direction ? getArrowIcon(c.transformations.direction) : ''}
                            <span class="category-value">${perso.NbTransformation}</span>
                        </div>
                    </div>
                    <div class="category ${c.morts.status}">
                        <div class="category-content">
                            ${c.morts.direction ? getArrowIcon(c.morts.direction) : ''}
                            <span class="category-value">${perso.NbMorts}</span>
                        </div>
                    </div>
                    <div class="category ${c.saga}">
                        <div class="category-content">
                            <span class="category-value">${perso.saga}</span>
                        </div>
                    </div>
                    <div class="category ${c.serie}">
                        <div class="category-content">
                            <span class="category-value">${perso.serie}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
    
    setTimeout(() => {
        const newPersoEl = document.querySelector('#resultsClassique .selected-player.new-player');
        if (newPersoEl) {
            setTimeout(() => {
                newPersoEl.classList.remove('new-player');
            }, 2600);
        }
    }, 50);
}

// ===== ÉVÉNEMENTS =====
function initClassiqueEvents() {
    const searchInput = document.getElementById('searchInputClassique');
    const searchBtn = document.querySelector('#classique-mode .search-btn');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        query.length === 0 ? hideSuggestionsClassique() : showSuggestionsClassique(searchPersonnages(query));
    });

    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) showSuggestionsClassique(searchPersonnages(query));
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideSuggestionsClassique();
            searchInput.blur();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const results = searchPersonnages(searchInput.value.trim());
            if (results.length > 0) selectPersonnage(results[0].id);
        }
    });

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const results = searchPersonnages(searchInput.value.trim());
        results.length === 1 ? selectPersonnage(results[0].id) : showSuggestionsClassique(results);
    });
}

// ===== SAUVEGARDE =====
function saveGameStateClassique() {
    const state = {
        date: getDailySeed(),
        attempts: personnagesSelectionnes.map(p => p.id),
        hasWon: document.getElementById('victory-box-classique') !== null
    };
    localStorage.setItem("dbClassiqueState", JSON.stringify(state));
}

function loadGameStateClassique() {
    const saved = localStorage.getItem("dbClassiqueState");
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        if (state.date !== getDailySeed()) {
            localStorage.removeItem("dbClassiqueState");
            return;
        }

        if (personnageDuJour && !enabledSeries.includes(personnageDuJour.serie)) {
            console.log('⚠️ Personnage sauvegardé dans série désactivée, réinitialisation...');
            localStorage.removeItem("dbClassiqueState");
            selectDailyPersonnage();
            return;
        }

        state.attempts.forEach(id => {
            const perso = personnages.find(p => p.id === id);
            if (perso) personnagesSelectionnes.push(perso);
        });

        displaySelectedPersonnages();
        updateHintButtonsClassique();

        if (state.hasWon) {
            showVictoryBoxClassique();
        }
    } catch (e) {
        console.error("Erreur de chargement du state:", e);
        localStorage.removeItem("dbClassiqueState");
    }
}

// ===== STATISTIQUES =====
function loadUserStats() {
    const saved = localStorage.getItem('dbStats');
    if (saved) {
        userStats = JSON.parse(saved);
    }
}

function saveUserStats() {
    localStorage.setItem('dbStats', JSON.stringify(userStats));
}

function updateStatsOnWin() {
    userStats.gamesPlayed++;
    userStats.gamesWon++;
    userStats.currentStreak++;
    userStats.maxStreak = Math.max(userStats.maxStreak, userStats.currentStreak);
    userStats.totalAttempts += personnagesSelectionnes.length;
    userStats.averageAttempts = Math.round(userStats.totalAttempts / userStats.gamesWon * 10) / 10;
    saveUserStats();
}

// ===== GESTION SÉRIES =====
function saveEnabledSeries() {
    localStorage.setItem('dbEnabledSeries', JSON.stringify(enabledSeries));
}

function loadEnabledSeries() {
    const saved = localStorage.getItem('dbEnabledSeries');
    if (saved) {
        enabledSeries = JSON.parse(saved);
    }
}

// ===== INITIALISATION =====
async function initClassiqueMode() {
    console.log("Initialisation du mode Classique Dragon Ball...");
    
    await loadPersonnages();
    loadEnabledSeries();
    selectDailyPersonnage();
    renderHintButtonsClassique();
    loadGameStateClassique();
    initClassiqueEvents();
    
    console.log("Mode Classique Dragon Ball prêt ! 🐉");
}

// ===== EXPORTS =====
window.initClassiqueMode = initClassiqueMode;
window.toggleHintClassique = toggleHintClassique;