// js/models/Character.js - Modèle Character

class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.race = data.race;
        this.genre = data.genre;
        this.affiliation = data.affiliation;
        this.transformation = data.transformation;
        this.premiereApparition = data.premiereApparition;
        this.statut = data.statut;
        this.couleurCheveux = data.couleurCheveux;
        this.planeteOrigine = data.planeteOrigine;
    }

    // Compare deux personnages et retourne les différences
    compareWith(otherCharacter) {
        return {
            race: this.compareAttribute(this.race, otherCharacter.race),
            genre: this.compareAttribute(this.genre, otherCharacter.genre),
            affiliation: this.compareAttribute(this.affiliation, otherCharacter.affiliation),
            transformation: this.compareAttribute(this.transformation, otherCharacter.transformation),
            premiereApparition: this.compareAttribute(this.premiereApparition, otherCharacter.premiereApparition),
            statut: this.compareAttribute(this.statut, otherCharacter.statut),
            couleurCheveux: this.compareAttribute(this.couleurCheveux, otherCharacter.couleurCheveux),
            planeteOrigine: this.compareAttribute(this.planeteOrigine, otherCharacter.planeteOrigine)
        };
    }

    // Compare un attribut spécifique
    compareAttribute(myValue, otherValue) {
        if (myValue === otherValue) {
            return 'correct';
        }
        return 'incorrect';
    }

    // Obtenir un indice basé sur le nombre d'essais
    getHint(attemptNumber) {
        const hints = [
            `Race: ${this.race}`,
            `Genre: ${this.genre}`,
            `Affiliation: ${this.affiliation}`,
            `Première apparition: ${this.premiereApparition}`,
            `Planète d'origine: ${this.planeteOrigine}`,
            `Transformation: ${this.transformation}`
        ];
        
        return hints[attemptNumber - 1] || "Aucun indice supplémentaire";
    }

    // Convertir en objet simple
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            race: this.race,
            genre: this.genre,
            affiliation: this.affiliation,
            transformation: this.transformation,
            premiereApparition: this.premiereApparition,
            statut: this.statut,
            couleurCheveux: this.couleurCheveux,
            planeteOrigine: this.planeteOrigine
        };
    }
}