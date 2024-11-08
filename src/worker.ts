import { MainToWorkerEventMap } from "./@types/worker";
import { PlayerValue, PlayValue } from "./utils/board";
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

type Node = {
    visits: number,
    wins: number,
    nodes: Map<string, Map<number, Map<number, Node>>>
}

type Data = {
    name: string,
    children: Data[]
}

function formatNode(node: Node): Data {
    const children = new Array<Data>();
    node.nodes.forEach((row, orientation) => {
        row.forEach((cell, x) => {
            cell.forEach((node, y) => {
                children.push(formatNode(node));
            });
        });
    });

    return {
        name: `${node.wins}/${node.visits}`,
        children
    }

}

self.addEventListener("start", ({ detail: { player1, player2, size } }) => {
    if (game) return;

    const player1Instance = createPlayer(player1);
    const player2Instance = createPlayer(player2);

    player1Instance.addEventListener("tree", (e) => {
        self.emit("tree", {
            player: 1,
            tree: formatNode((e as CustomEvent<Node>).detail)
        });
    });

    player2Instance.addEventListener("tree", (e) => {
        self.emit("tree", {
            player: 2,
            tree: formatNode((e as CustomEvent<Node>).detail)
        });
    });


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
        verticals: game.getBoard().getVerticals(),
        horizontals: game.getBoard().getHorizontals(),
        score: game.getBoard().getScore(),
        tour: game.getBoard().getTour(),
        cells: game.getBoard().getCells()
    });

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
        const { board: {
            cells,
            verticals,
            horizontals,
            player,
            score
        } } = (
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
                    player: PlayerValue;
                };
            }>
        ).detail;

        self.emit("change", {
            verticals,
            horizontals,
            score: score,
            tour: player,
            cells
        });
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

