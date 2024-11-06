import { Board, Coup, PlayerValue } from "../board";

/**
 * Classe abstraite représentant un joueur dans le jeu.
 * Étend la classe EventTarget pour gérer les événements.
 */
export abstract class Player extends EventTarget {
    /**
     * Le temps total pris par le joueur.
     */
    protected totalTime: number = 0;

    /**
     * Le nombre total de mouvements effectués par le joueur.
     */
    protected totalMove: number = 0;

    /**
     * Un tableau pour stocker les temps pris pour chaque mouvement.
     */
    protected times: number[] = [];

    /**
     * Méthode abstraite à implémenter par les sous-classes pour effectuer un mouvement.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    abstract play(board: Board, player: PlayerValue): Promise<Coup>;
}
