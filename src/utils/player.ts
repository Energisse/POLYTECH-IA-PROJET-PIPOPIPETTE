import { Board } from "./game";
import { MctsNode } from "./mcts";
import negamax from "./negamax";
import nigamax from "./nigamax";
import pipopipetteGo, { ConvLayer, HeadLayer, PolicyLayer, ResidualLayer } from "./pipopipetteGo";

export interface Coup {
    x: number,
    y: number,
    orientation: "vertical" | "horizontal"
}

export abstract class Player extends EventTarget {
    protected totalTime: number = 0;
    protected totalMove: number = 0;
    protected times: number[] = [];

    abstract play(board: Board, player: 0 | 1): Promise<Coup>
}

export class HumanPlayer extends Player {
    play(board: Board, player: 0 | 1) {
        return new Promise<Coup>((resolve) => {
            const start = performance.now()
            this.addEventListener("play", (e: Event) => {
                const end = performance.now()
                this.totalTime += end - start
                this.totalMove++
                this.times.push(end - start)
                console.log(`Player ${player} (${(this as any).constructor.name}) Time: ${end - start} Average time: ${this.totalTime / this.totalMove}ms`)
                const customEvent = e as CustomEvent<{ x: number, y: number, orientation: "vertical" | "horizontal" }>;
                resolve(customEvent.detail);
            }, { once: true })
        })
    }
}

export abstract class iaPlayer extends Player {
    async play(board: Board, player: 0 | 1): Promise<Coup> {
        return (await Promise.all([
            (async (): Promise<Coup> => {
                const start = performance.now()
                const result = await this.playIa(board, player)
                const end = performance.now()
                this.totalTime += end - start
                this.totalMove++
                this.times.push(end - start)
                console.log(result)
                console.log(`Player ${player} (${(this as any).constructor.name}) Time: ${end - start} Average time: ${this.totalTime / this.totalMove}ms`)
                return result
            })(),
            //delay to see the move
            new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve()
                }, 500)
            })
        ]))[0]
    }

    abstract playIa(board: Board, player: number): Promise<Coup>;
}

export class MctsPlayer extends iaPlayer {
    private iteration: number;
    private simulation: number;
    private c: number
    private lastBoard: Board | null = null;
    private lastNode: MctsNode | null = null;

    constructor({ iteration, simulation, c }: { iteration: number, simulation: number, c?: number }) {
        super();
        this.iteration = iteration;
        this.simulation = simulation;
        this.c = c || Math.sqrt(2);
    }

    playIa(board: Board, player: 0 | 1): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            let bestNode: MctsNode | null = null;
            if (this.lastBoard && this.lastNode) {
                const played = this.lastBoard
                    .getHorizontals()
                    .flatMap((row, y) => row.map((cell, x) => cell === -1 && board.getHorizontals()[y][x] !== -1 ? { x, y, orientation: "horizontal" } : null))
                    .filter(x => x)
                    .concat(
                        this.lastBoard
                            .getVerticals()
                            .flatMap((row, y) => row.map((cell, x) => cell === -1 && board.getVerticals()[y][x] !== -1 ? { x, y, orientation: "vertical" } : null))
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
            board.play(bestChild.orientation, bestChild.x, bestChild.y);
            this.lastBoard = board.copy();
            resolve({ x: bestChild.x, y: bestChild.y, orientation: bestChild.orientation });
        })
    }
}

export class RandomPlayer extends iaPlayer {
    playIa(board: Board, player: 0 | 1): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            const { orientation, x, y } = board.getNodes().next().value!
            resolve({ x, y, orientation });
        })
    }
}

export class MinimaxPlayer extends iaPlayer {
    private depth: number;

    constructor({ depth }: { depth: number }) {
        super();
        this.depth = depth;
    }

    playIa(board: Board, player: 0 | 1): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            const { nodes, ...coup } = negamax(board, this.depth, true, player)
            console.log(`Player ${player} (${(this as any).constructor.name}) : ${nodes} nodes`)
            resolve(coup);
        })
    }
}

export class FastestPlayer extends iaPlayer {
    private depth: number;
    private ias: ("minimax" | "alphabeta" | "mcts")[] = ["minimax", "alphabeta", "mcts"]

    constructor({ depth }: { depth: number }) {
        super();
        this.depth = depth;
    }

    playIa(board: Board, player: 0 | 1) {
        const workers: Worker[] = []

        return Promise.race(this.ias.map(ia => {
            return new Promise<[Coup, typeof ia]>((resolve) => {
                const worker = new Worker(new URL("../playerWorker.ts", import.meta.url));
                workers.push(worker)
                worker.postMessage({ board: JSON.parse(JSON.stringify(board)), depth: this.depth, player, type: ia });
                worker.addEventListener("message", (e) => {
                    resolve([e.data, ia]);
                })
            })
        })).then(([coup, ia]) => {
            workers.forEach(worker => worker.terminate())
            console.log(ia)
            return coup
        })

    }
}


export class AlphaBetaPlayer extends iaPlayer {
    private depth: number;

    constructor({ depth }: { depth: number }) {
        super();
        this.depth = depth;
    }

    playIa(board: Board, player: 0 | 1) {
        return new Promise<Coup>((resolve) => {
            const { nodes, ...coup } = nigamax(board, this.depth, true, player)
            console.log(`Player ${player} (${(this as any).constructor.name}) : ${nodes} nodes`)
            resolve(coup);
        })
    }
}

export class PipopipetteGo extends iaPlayer {
    playIa(board: Board, player: 0 | 1) {
        return pipopipetteGo(board, player)
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