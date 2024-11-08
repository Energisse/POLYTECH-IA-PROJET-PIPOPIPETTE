import { Board } from "./utils/board";
import { AlphaBetaPlayer, HumanPlayer, MctsPlayer, MinimaxPlayer, Player, RandomPlayer } from "./utils/player";

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


    playerType.play(new Board(board), player).then((coup) => {
        self.postMessage(coup);
    })
});



export { };

