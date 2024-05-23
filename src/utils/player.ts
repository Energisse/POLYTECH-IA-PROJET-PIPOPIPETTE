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
        return (await Promise.all([this.playIa(board, player),
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
            console.log(board, this.depth, true, player)
            resolve(negamax(board, this.depth, true, player));
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

