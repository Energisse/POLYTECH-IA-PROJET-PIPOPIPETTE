import { MainToWorkerEventMap } from "./@types/worker";
import Game from "./utils/game";
import { AlphaBetaPlayer, FastestPlayer, HumanPlayer, MctsPlayer, MinimaxPlayer, RandomPlayer } from "./utils/player";

declare var self: DedicatedWorkerGlobalScope;

DedicatedWorkerGlobalScope.prototype.emit = function (...data) {
    this.postMessage({ type: data[0], data: data[1] });
}

self.addEventListener("message", ({ data: { data, type } }) => {
    self.dispatchEvent(new CustomEvent(type, {
        detail: data
    }));
});

let game: Game | null = null;
self.addEventListener("start", ({ detail: { player1, player2, size } }) => {
    if (game) return;

    const player1Instance = createPlayer(player1);
    const player2Instance = createPlayer(player2);

    game = new Game(size, player1Instance, player2Instance);

    if (player1Instance instanceof HumanPlayer) {
        self.addEventListener("play", (e) => {
            player1Instance.dispatchEvent(new CustomEvent("play", {
                detail: e.detail
            }));
        });
    }

    if (player2Instance instanceof HumanPlayer) {
        self.addEventListener("play", (e) => {
            player2Instance.dispatchEvent(new CustomEvent("play", {
                detail: e.detail
            }));
        });
    }

    self.emit("change", {
        verticals: game.board.getVerticals(),
        horizontals: game.board.getHorizontals(),
        score: game.board.getScore(),
        tour: game.board.getTour(),
        cells: game.board.getCells()
    });

    game.board.addEventListener("end", (e) => {
        const { winner } = (
            e as CustomEvent<{
                winner: number
            }>
        ).detail;
        self.emit("end", {
            winner
        });
    });

    game.board.addEventListener("boardChange", (e) => {
        const { verticals, horizontals, cells } = (
            e as CustomEvent<{
                verticals: number[][];
                horizontals: number[][];
                cells: number[][];
            }>
        ).detail;

        self.emit("change", {
            verticals,
            horizontals,
            score: game!.board.getScore(),
            tour: game!.board.getTour(),
            cells
        });
    });
});


function createPlayer(player: MainToWorkerEventMap["start"]["detail"]["player1"]) {
    switch (player.type) {
        case "human":
            return new HumanPlayer();
        case "random":
            return new RandomPlayer();
        case "minimax":
            return new MinimaxPlayer(player);
        case "alphabeta":
            return new AlphaBetaPlayer(player);
        case "mcts":
            return new MctsPlayer(player);
        case "fastest":
            return new FastestPlayer(player);
    }
}


export { };

