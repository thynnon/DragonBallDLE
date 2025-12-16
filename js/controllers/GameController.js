// js/controllers/GameController.js - Contrôleur du jeu

class GameController {
    constructor(characters) {
        this.characters = characters.map(data => new Character(data));
        this.view = new GameView();
        this.targetCharacter = null;
        this.attempts = [];
        this.maxAttempts = 6;
        this.gameOver = false;
        
        this.init();
    }

    // Initialiser le jeu
    init() {
        this.selectRandomCharacter();
        this.view.populateCharacterSelect(this.characters);
        this.setupEventListeners();
        this.view.updateAttemptsCounter(0, this.maxAttempts);
    }

    // Sélectionner un personnage aléatoire à deviner
    selectRandomCharacter() {
        const randomIndex = Math.floor(Math.random() * this.characters.length);
        this.targetCharacter = this.characters[randomIndex];
        console.log('Personnage à deviner:', this.targetCharacter.name); // Pour debug
    }

    // Configurer les événements
    setupEventListeners() {
        this.view.submitButton.addEventListener('click', () => this.handleGuess());
        
        this.view.characterSelect.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGuess();
            }
        });

        this.view.playAgainButton.addEventListener('click', () => this.resetGame());
        this.view.homeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Gérer une tentative
    handleGuess() {
        if (this.gameOver) return;

        const selectedId = parseInt(this.view.getSelectedCharacter());
        
        if (!selectedId) {
            this.view.showError('Veuillez sélectionner un personnage !');
            return;
        }

        const guessedCharacter = this.characters.find(c => c.id === selectedId);
        
        // Vérifier si le personnage a déjà été essayé
        if (this.attempts.some(attempt => attempt.character.id === guessedCharacter.id)) {
            this.view.showError('Vous avez déjà essayé ce personnage !');
            return;
        }

        // Comparer avec le personnage cible
        const comparison = guessedCharacter.compareWith(this.targetCharacter);
        
        // Enregistrer la tentative
        this.attempts.push({
            character: guessedCharacter,
            comparison: comparison
        });

        // Afficher la tentative
        this.view.displayAttempt(guessedCharacter, comparison, this.attempts.length);
        
        // Afficher un indice
        const hint = this.targetCharacter.getHint(this.attempts.length);
        this.view.displayHint(hint, this.attempts.length);

        // Mettre à jour le compteur
        this.view.updateAttemptsCounter(this.attempts.length, this.maxAttempts);

        // Réinitialiser la sélection
        this.view.resetSelection();

        // Vérifier si le joueur a gagné
        if (guessedCharacter.id === this.targetCharacter.id) {
            this.endGame(true);
            return;
        }

        // Vérifier si le joueur a perdu
        if (this.attempts.length >= this.maxAttempts) {
            this.endGame(false);
        }
    }

    // Terminer le jeu
    endGame(isWin) {
        this.gameOver = true;
        this.view.disableForm();
        
        setTimeout(() => {
            this.view.showResultModal(
                isWin, 
                this.targetCharacter.name, 
                this.attempts.length
            );
        }, 500);
    }

    // Réinitialiser le jeu
    resetGame() {
        this.attempts = [];
        this.gameOver = false;
        this.selectRandomCharacter();
        this.view.reset();
        this.view.hideResultModal();
        this.view.updateAttemptsCounter(0, this.maxAttempts);
    }
}