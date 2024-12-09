import { Board, Coup } from "../board";
import negamax from "../negamax";
import { IaPlayer } from "./IAPlayer";

export class MinimaxPlayer extends IaPlayer {
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