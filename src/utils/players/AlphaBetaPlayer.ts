import { Board, Coup, PlayerValue } from "../board";
import nigamax from "../nigamax";
import { IaPlayer } from "./IAPlayer";

export class AlphaBetaPlayer extends IaPlayer {
    private depth: number;

    constructor({ depth }: { depth: number }) {
        super();
        this.depth = depth;
    }

    playIa(board: Board, player: PlayerValue) {
        return new Promise<Coup>((resolve) => {
            const { nodes, ...coup } = nigamax(board, this.depth, true, player)
            console.log(`Player ${player} (${(this as any).constructor.name}) : ${nodes} nodes`)
            resolve(coup);
        })
    }
}

