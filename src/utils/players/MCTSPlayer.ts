import { Board, Coup, PlayerValue } from "../board";
import { MctsNode } from "../mcts";
import { IaPlayer } from "./IAPlayer";

/**
 * Classe représentant un joueur IA qui joue avec l'algorithme MCTS.
 * @extends IaPlayer
 */
export class MctsPlayer extends IaPlayer {

    /**
     * Le nombre d'itérations
     */
    private iteration: number;

    /**
     * Le nombre de simulations par itération.
     */
    private simulation: number;

    /**
     * La constante C pour l'exploration.
     */
    private c: number

    /**
     * Le dernier plateau joué.
     */
    private lastBoard: Board | null = null;

    /**
     * Le dernier noeud joué.
     */
    private lastNode: MctsNode | null = null;


    /**
     * 
     * @param {number} iteration - Le nombre d'itérations.
     * @param {number} simulation - Le nombre de simulations par itération.
     * @param {number} c - La constante C pour l'exploration.
     * @param {number} minTimeToPlay - Le temps minimal pour jouer un coup.
     */
    constructor({ iteration, simulation, c, minTimeToPlay }: { iteration: number, simulation: number, c?: number, minTimeToPlay?: number }) {
        super(minTimeToPlay);
        this.iteration = iteration;
        this.simulation = simulation;
        this.c = c || Math.sqrt(2);
    }


    /**
     * Joue un coup sur le plateau.
     * 
     * @param {Board} board - Le plateau de jeu actuel.
     * @param {PlayerValue} player - La valeur du joueur actuel.
     * @returns {Promise<Coup>} - Une promesse qui se résout avec le coup joué.
     */
    playIa(board: Board, player: PlayerValue): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            let bestNode: MctsNode | null = null;
            if (this.lastBoard && this.lastNode) {
                const played = this.lastBoard
                    .horizontals
                    .flatMap((row, y) => row.map((cell, x) => cell === -1 && board.horizontals[y][x] !== -1 ? { x, y, orientation: "horizontal" } : null))
                    .filter(x => x)
                    .concat(
                        this.lastBoard
                            .verticals
                            .flatMap((row, y) => row.map((cell, x) => cell === -1 && board.verticals[y][x] !== -1 ? { x, y, orientation: "vertical" } : null))
                            .filter(x => x)
                    ) as { x: number, y: number, orientation: "vertical" | "horizontal" }[]

                if (played.length === 0) {
                    bestNode = this.lastNode;
                }


                let bestValue = -Infinity;
                if (played.length > 0) {
                    for (const coup of permute(played)) {
                        let currentNode: MctsNode | null = this.lastNode!.nodes.get(coup[0].orientation)?.get(coup[0].x)?.get(coup[0].y) || null;
                        for (let i = 1; i < coup.length; i++) {
                            currentNode = currentNode?.nodes.get(coup[i].orientation)?.get(coup[i].x)?.get(coup[i].y) || null;
                            if (!currentNode) break;
                        }
                        if (currentNode) {
                            if (currentNode.wins > bestValue) {
                                bestValue = currentNode.wins;
                                bestNode = currentNode;
                            }
                        }
                    }
                }

            }

            let root = bestNode || new MctsNode(board, player, this.simulation, this.c);
            while (root.getNumberVisited() < this.iteration * this.simulation) {
                root.run();
            }
            this.dispatchEvent(new CustomEvent("tree", { detail: root }));
            let bestChild = root.getBestChild();
            this.lastNode = bestChild.bestNode;
            this.lastBoard = board.play(bestChild.orientation, bestChild.x, bestChild.y);
            resolve({ x: bestChild.x, y: bestChild.y, orientation: bestChild.orientation });
        })
    }
}


function permute<T>(arr: T[]): T[][] {
    let results: T[][] = [];

    function permuteRecursively(subArr: T[], memo: T[]) {
        if (subArr.length === 0) {
            results.push(memo.slice());
        } else {
            for (let i = 0; i < subArr.length; i++) {
                let curr = subArr.slice();
                let next = curr.splice(i, 1);
                permuteRecursively(curr, memo.concat(next));
            }
        }
    }

    permuteRecursively(arr, []);
    return results;
}