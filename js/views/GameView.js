// js/views/GameView.js - Vue du jeu

class GameView {
    constructor() {
        this.attemptsContainer = document.getElementById('attempts-container');
        this.hintsContainer = document.getElementById('hints-container');
        this.characterSelect = document.getElementById('character-select');
        this.submitButton = document.getElementById('submit-guess');
        this.attemptsCounter = document.getElementById('attempts-count');
        this.resultModal = document.getElementById('result-modal');
        this.resultMessage = document.getElementById('result-message');
        this.playAgainButton = document.getElementById('play-again');
        this.homeButton = document.getElementById('home-button');
    }

    // Initialiser la liste déroulante avec les personnages
    populateCharacterSelect(characters) {
        this.characterSelect.innerHTML = '<option value="">Choisissez un personnage...</option>';
        
        characters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            option.textContent = char.name;
            this.characterSelect.appendChild(option);
        });
    }

    // Afficher une tentative
    displayAttempt(character, comparison, attemptNumber) {
        const attemptDiv = document.createElement('div');
        attemptDiv.className = 'attempt-card';
        attemptDiv.style.animationDelay = '0.1s';

        let html = `
            <div class="attempt-header">
                <span class="attempt-number">Essai #${attemptNumber}</span>
                <span class="attempt-name">${character.name}</span>
            </div>
            <div class="attempt-grid">
        `;

        const attributes = [
            { label: 'Race', key: 'race', value: character.race },
            { label: 'Genre', key: 'genre', value: character.genre },
            { label: 'Affiliation', key: 'affiliation', value: character.affiliation },
            { label: 'Apparition', key: 'premiereApparition', value: character.premiereApparition },
            { label: 'Planète', key: 'planeteOrigine', value: character.planeteOrigine },
            { label: 'Transformation', key: 'transformation', value: character.transformation },
            { label: 'Statut', key: 'statut', value: character.statut },
            { label: 'Cheveux', key: 'couleurCheveux', value: character.couleurCheveux }
        ];

        attributes.forEach(attr => {
            const status = comparison[attr.key];
            const icon = status === 'correct' ? '✓' : '✗';
            html += `
                <div class="attribute-box ${status}">
                    <div class="attribute-label">${attr.label}</div>
                    <div class="attribute-value">${attr.value}</div>
                    <div class="attribute-icon">${icon}</div>
                </div>
            `;
        });

        html += `</div>`;
        attemptDiv.innerHTML = html;

        this.attemptsContainer.insertBefore(attemptDiv, this.attemptsContainer.firstChild);
    }

    // Afficher un indice
    displayHint(hint, attemptNumber) {
        const hintDiv = document.createElement('div');
        hintDiv.className = 'hint-card';
        hintDiv.innerHTML = `
            <span class="hint-number">💡 Indice ${attemptNumber}</span>
            <span class="hint-text">${hint}</span>
        `;
        this.hintsContainer.appendChild(hintDiv);
    }

    // Mettre à jour le compteur d'essais
    updateAttemptsCounter(current, max) {
        this.attemptsCounter.textContent = `${current} / ${max}`;
        
        if (current >= max - 1) {
            this.attemptsCounter.style.color = '#ff4444';
        } else if (current >= max - 2) {
            this.attemptsCounter.style.color = '#ff9800';
        }
    }

    // Obtenir le personnage sélectionné
    getSelectedCharacter() {
        return this.characterSelect.value;
    }

    // Réinitialiser la sélection
    resetSelection() {
        this.characterSelect.value = '';
    }

    // Désactiver le formulaire
    disableForm() {
        this.characterSelect.disabled = true;
        this.submitButton.disabled = true;
    }

    // Activer le formulaire
    enableForm() {
        this.characterSelect.disabled = false;
        this.submitButton.disabled = false;
    }

    // Afficher le modal de résultat
    showResultModal(isWin, characterName, attempts) {
        this.resultModal.classList.add('show');
        
        if (isWin) {
            this.resultMessage.innerHTML = `
                <div class="result-icon success">🎉</div>
                <h2 class="result-title">BRAVO !</h2>
                <p class="result-text">Vous avez trouvé <strong>${characterName}</strong> en ${attempts} essai${attempts > 1 ? 's' : ''} !</p>
            `;
        } else {
            this.resultMessage.innerHTML = `
                <div class="result-icon fail">😢</div>
                <h2 class="result-title">PERDU !</h2>
                <p class="result-text">Le personnage était <strong>${characterName}</strong></p>
            `;
        }
    }

    // Cacher le modal
    hideResultModal() {
        this.resultModal.classList.remove('show');
    }

    // Réinitialiser l'affichage
    reset() {
        this.attemptsContainer.innerHTML = '';
        this.hintsContainer.innerHTML = '';
        this.resetSelection();
        this.enableForm();
        this.attemptsCounter.style.color = '#FFD700';
    }

    // Afficher un message d'erreur
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.querySelector('.game-content').insertBefore(
            errorDiv, 
            document.querySelector('.game-form')
        );

        setTimeout(() => errorDiv.remove(), 3000);
    }
}