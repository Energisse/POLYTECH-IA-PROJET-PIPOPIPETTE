import { Board } from "./board";
import { AlphaBetaPlayer } from "./players/AlphaBetaPlayer";
import { HumanPlayer } from "./players/HumanPlayer";
import { MctsPlayer } from "./players/MCTSPlayer";
import { MinimaxPlayer } from "./players/MinimaxPlayer";
import { Player } from "./players/Player";
import { RandomPlayer } from "./players/RandomPlayer";

declare var self: DedicatedWorkerGlobalScope;

//remove console.log
console.log = () => { }

self.addEventListener("message", ({ data: { board, player, type } }: {
    data: {
        board: any, player: any, type: string
    }
}) => {
    let playerType: Player;
    switch (type) {
        case "human":
            playerType = new HumanPlayer()
            break;
        case "random":
            playerType = new RandomPlayer()
            break;
        case "minimax":
            playerType = new MinimaxPlayer({ depth: 3 })
            break;
        case "alphabeta":
            playerType = new AlphaBetaPlayer({ depth: 3 })
            break;
        case "mcts":
            playerType = new MctsPlayer({ iteration: 1000, c: 1.41, simulation: 10 })
            break;
        default:
            throw new Error("Invalid player type")
    }


    playerType.play(new Board(board), player).then(self.postMessage)
});

export { };

