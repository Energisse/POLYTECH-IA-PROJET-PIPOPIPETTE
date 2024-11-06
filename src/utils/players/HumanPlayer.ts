import { Board, Coup, PlayerValue } from "../board"
import { Player } from "./Player"

/**
 * Classe représentant un joueur humain.
 * @extends Player
 */
export class HumanPlayer extends Player {

    /**
     * Joue un coup sur le plateau.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    play(board: Board, player: PlayerValue): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            const start = performance.now()
            this.addEventListener("play", (e: Event) => {
                const end = performance.now()
                this.totalTime += end - start
                this.totalMove++
                this.times.push(end - start)
                console.log(`Player ${player} (${this.constructor.name}) Time: ${end - start} Average time: ${this.totalTime / this.totalMove}ms`)
                const customEvent = e as CustomEvent<Coup>;
                resolve(customEvent.detail);
            }, { once: true })
        })
    }
}