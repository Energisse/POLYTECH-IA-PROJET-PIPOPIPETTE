import { Board } from "./board";
import { AlphaBetaPlayer } from "./players/AlphaBetaPlayer";
import { FastestPlayer } from "./players/FastestPlayer";
import { HumanPlayer } from "./players/HumanPlayer";
import { MctsPlayer } from "./players/MCTSPlayer";
import { MinimaxPlayer } from "./players/MinimaxPlayer";
import { Player } from "./players/Player";
import { RandomPlayer } from "./players/RandomPlayer";

declare var self: DedicatedWorkerGlobalScope;

//remove console.log
console.log = () => { }

self.addEventListener("message", ({ data: { board, player, type, parameters } }: {
    data: {
        board: any, player: any, type: string, parameters: typeof FastestPlayer.prototype.parameters
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
            playerType = new MinimaxPlayer(parameters)
            break;
        case "alphabeta":
            playerType = new AlphaBetaPlayer(parameters)
            break;
        case "mcts":
            playerType = new MctsPlayer(parameters)
            break;
        default:
            throw new Error("Invalid player type")
    }


    playerType.play(new Board(board), player).then(self.postMessage)
});

export { };
