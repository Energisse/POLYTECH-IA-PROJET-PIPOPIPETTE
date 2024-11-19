import { Board, Coup, PlayerValue } from "../board";
import { Player } from "./Player";

/**
 * Classe abstraite représentant un joueur IA.
 */
export abstract class IaPlayer extends Player {

    /**
     * Le temps minimal pour jouer un coup.
     */
    protected minTimeToPlay: number = 0;


    /**
     * 
     * @param {number} minTimeToPlay - Le temps minimal pour jouer un coup.
     */
    constructor(minTimeToPlay: number = 500) {
        super()
        this.minTimeToPlay = minTimeToPlay;
    }

    /**
     * Joue un coup sur le plateau.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    async play(board: Board, player: PlayerValue): Promise<Coup> {
        return (await Promise.all([
            new Promise<Coup>(async (resolve) => {
                const start = performance.now();
                const result = await this.playIa(board, player);
                const end = performance.now();

                this.totalTime += end - start;
                this.totalMove++;
                this.times.push(end - start);

                console.log(`Player ${player} (${this.constructor.name}) Time: ${end - start}ms Average time: ${this.totalTime / this.totalMove}ms`);

                resolve(result);
            }),
            //Temps minimal de pour jouer
            new Promise<void>((resolve) => setTimeout(resolve, this.minTimeToPlay))
        ]))[0]
    }

    /**
     * Méthode abstraite pour jouer un coup IA.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    abstract playIa(board: Board, player: PlayerValue): Promise<Coup>;
}