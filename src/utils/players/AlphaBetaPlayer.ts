import { Board, Coup, PlayerValue } from "../board";
import nigamax from "../nigamax";
import { IaPlayer } from "./IAPlayer";

export class AlphaBetaPlayer extends IaPlayer {
    private depth: number;

    private depthLimit?: number;

    constructor(paramters: { depth: number, minTimeToPlay?: number, depthLimit?: number }) {
        super(paramters);
        this.depth = paramters.depth;
        this.depthLimit = paramters.depthLimit;
    }

    playIa(board: Board, player: PlayerValue) {
        return new Promise<Coup>((resolve) => {
            const { nodes, ...coup } = nigamax(board, this.depth, true, player, this.depthLimit)
            console.log(`Player ${player} (${(this as any).constructor.name}) : ${nodes} nodes`)
            resolve(coup);
        })
    }
}

