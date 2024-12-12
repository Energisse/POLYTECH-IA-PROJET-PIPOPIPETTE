import { Board, Coup, PlayerValue } from "../board";
import { AlphaBetaPlayer } from "./AlphaBetaPlayer";
import { IaPlayer } from "./IAPlayer";
import { MctsPlayer } from "./MCTSPlayer";
import { MinimaxPlayer } from "./MinimaxPlayer";


/**
 * Classe représentant un joueur IA qui est un sous ensemble des joueurs IA. Dans ce cas se sont "minimax", "alphabeta" et "mcts".
 * @extends IaPlayer
 */
export class FastestPlayer extends IaPlayer {

    readonly parameters: ConstructorParameters<typeof MinimaxPlayer>[0] & ConstructorParameters<typeof AlphaBetaPlayer>[0] & ConstructorParameters<typeof MctsPlayer>[0]

    /*
     * Les IA à jouer.
     */
    readonly ias: ("minimax" | "alphabeta" | "mcts")[] = ["minimax", "alphabeta", "mcts"]

    /**
     * 
     * @param {number} depth - La profondeur de recherche.
     */
    constructor(parameters: ConstructorParameters<typeof MinimaxPlayer>[0] & ConstructorParameters<typeof AlphaBetaPlayer>[0] & ConstructorParameters<typeof MctsPlayer>[0]) {
        super(parameters);
        this.parameters = parameters;
    }

    /**
     * Joue un coup sur le plateau.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    async playIa(board: Board, player: PlayerValue): Promise<Coup> {
        const workers: Worker[] = []

        const [coup, ia_1] = await Promise.race(this.ias.map(ia => {
            return new Promise<[Coup, typeof ia]>((resolve) => {
                const worker = new Worker(new URL("../playerWorker.ts", import.meta.url));
                workers.push(worker);
                worker.postMessage({ board: JSON.parse(JSON.stringify(board)), parameters: this.parameters, player, type: ia });
                worker.addEventListener("message", (e) => {
                    resolve([e.data, ia]);
                });
            });
        }));
        workers.forEach(w => w.terminate());
        console.log(`Player ${player} (${ia_1})`)
        return coup;
    }
}
