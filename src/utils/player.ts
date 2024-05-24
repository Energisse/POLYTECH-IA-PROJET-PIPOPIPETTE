import { Board } from "./game";
import { MctsNode } from "./mcts";
import negamax from "./negamax";
import nigamax from "./nigamax";

interface Coup {
    x: number,
    y: number,
    orientation: "vertical" | "horizontal"
}

export type Player = {
    play(board: Board, player: number): Promise<Coup>
}

export class HumanPlayer extends EventTarget implements Player {
    play(board: Board, player: number) {
        return new Promise<Coup>((resolve) => {
            this.addEventListener("play", (e: Event) => {
                const customEvent = e as CustomEvent<{ x: number, y: number, orientation: "vertical" | "horizontal" }>;
                resolve(customEvent.detail);
            }, { once: true })
        })
    }
}

export abstract class iaPlayer implements Player {
    async play(board: Board, player: number): Promise<Coup> {
        return (await Promise.all([
            (async (): Promise<Coup> => {
                const start = performance.now()
                const result = await this.playIa(board, player)
                const end = performance.now()
                console.log(`Player ${player} (${(this as any).constructor.name}) Time to play: ${end - start}ms`)
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

    constructor({ iteration, simulation, c }: { iteration: number, simulation: number, c?: number }) {
        super();
        this.iteration = iteration;
        this.simulation = simulation;
        this.c = c || Math.sqrt(2);
    }

    playIa(board: Board, player: number): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            let root = new MctsNode(board, player, this.simulation, this.c);
            while (root.getNumberVisited() < this.iteration) {
                root.run();
            }
            let bestChild = root.getBestChild();
            resolve({ x: bestChild.x, y: bestChild.y, orientation: bestChild.orientation });
        })
    }
}

export class RandomPlayer extends iaPlayer {
    playIa(board: Board, player: number): Promise<Coup> {
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

    playIa(board: Board, player: number): Promise<Coup> {
        return new Promise<Coup>((resolve) => {
            resolve(negamax(board, this.depth, true, player));
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

    playIa(board: Board, player: number) {
        const workers: Worker[] = []

        return Promise.race(this.ias.map(ia => {
            return new Promise<[Coup, "minimax" | "alphabeta" | "mcts"]>((resolve) => {
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

    playIa(board: Board, player: number) {
        return new Promise<Coup>((resolve) => {
            resolve(nigamax(board, this.depth, true, player));
        })
    }
}
