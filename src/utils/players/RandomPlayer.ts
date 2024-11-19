import { Board, Coup, PlayerValue } from "../board";
import { IaPlayer } from "./IAPlayer";

/**
 * Classe représentant un joueur IA qui joue de manière aléatoire.
 * @extends IaPlayer
 */
export class RandomPlayer extends IaPlayer {
    /**
     * Joue un coup aléatoire sur le plateau.
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    playIa(board: Board, player: PlayerValue): Promise<Coup> {
        return Promise.resolve(board.getNodes().next().value!)
    }
}
