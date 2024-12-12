import { MainToWorkerEventMap } from "./@types/worker";
import { PlayerValue, PlayValue } from "./utils/board";
import Game from "./utils/game";
import { AlphaBetaPlayer } from "./utils/players/AlphaBetaPlayer";
import { FastestPlayer } from "./utils/players/FastestPlayer";
import { HumanPlayer } from "./utils/players/HumanPlayer";
import { MctsPlayer } from "./utils/players/MCTSPlayer";
import { MinimaxPlayer } from "./utils/players/MinimaxPlayer";
import { RandomPlayer } from "./utils/players/RandomPlayer";

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

    self.emit("change", game.getBoard());

    game.addEventListener("end", (e) => {
        const { winner } = (
            e as CustomEvent<{
                winner: PlayerValue
            }>
        ).detail;
        self.emit("end", {
            winner
        });
    });

    game.addEventListener("played", (e) => {
        const { board } = (
            e as CustomEvent<{
                played: {
                    x: number;
                    y: number;
                    orientation: string;
                    player: PlayerValue;
                };
                board: {
                    verticals: ReadonlyArray<ReadonlyArray<PlayValue>>;
                    horizontals: ReadonlyArray<ReadonlyArray<PlayValue>>;
                    cells: ReadonlyArray<ReadonlyArray<PlayValue>>;
                    score: readonly [number, number];
                    tour: PlayerValue;
                };
            }>
        ).detail;

        self.emit("change", board);
    });

    game.start().then(() => {
        self.emit("end", {
            winner: game!.getBoard().getWinner()
        });
    });
});


function createPlayer(player: MainToWorkerEventMap["start"]["detail"]["player1"]) {
    switch (player.type) {
        case "human":
            return new HumanPlayer();
        case "random":
            return new RandomPlayer(player);
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

