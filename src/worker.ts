import { MainToWorkerEventMap } from "./@types/worker";
import Game, { playValue, playerValue } from "./utils/game";
import { AlphaBetaPlayer, FastestPlayer, HumanPlayer, MctsPlayer, MinimaxPlayer, PipopipetteGo, RandomPlayer } from "./utils/player";

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
        verticals: game.board.getVerticals(),
        horizontals: game.board.getHorizontals(),
        score: game.board.getScore(),
        tour: game.board.getTour(),
        cells: game.board.getCells()
    });

    game.board.addEventListener("end", (e) => {
        const { winner } = (
            e as CustomEvent<{
                winner: playerValue
            }>
        ).detail;
        self.emit("end", {
            winner
        });
    });

    game.board.addEventListener("boardChange", (e) => {
        const { verticals, horizontals, cells } = (
            e as CustomEvent<{
                verticals: playValue[][];
                horizontals: playValue[][];
                cells: playValue[][];
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
        case "pipopipetteGo":
            return new PipopipetteGo();
    }
}


export { };

