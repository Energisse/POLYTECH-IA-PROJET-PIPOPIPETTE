import { Board } from "./game";

export default function mcts(board: Board, player: number, iterations: number) {
    const root = new Node(board, player);
    while (root.getNumberVisited() < iterations) {
        root.run();
    }

    return root.getBestChild();
}

class Node {
    private wins: number;
    private visits: number;
    private nodes: Map<"vertical" | "horizontal", Map<number, Map<number, Node>>>;
    private parent: Node | null;
    private board: Board;
    private player: number;
    private generator: Generator<{ orientation: "vertical" | "horizontal"; x: number; y: number, board: Board }, void, unknown>;

    constructor(board: Board, player: number, parent: Node | null = null) {
        this.wins = 0;
        this.visits = 0;
        this.nodes = new Map();
        this.parent = parent;
        this.generator = board.getNodes();
        this.board = board;
        this.player = player;
    }

    public mcts() {

    }

    public run() {
        if (this.board.isFinished()) {
            this.backpropagation(this.simulate());
            return
        }

        if (this.expansion()) return;

        const { bestNode } = this.selection();
        bestNode.run();
    }

    private selection(): {
        bestNode: Node;
        x: number;
        y: number;
        orientation: "vertical" | "horizontal";

    } {
        let bestNode: Node | null = null;
        let x: number = 0;
        let y: number = 0;
        let orientation: "vertical" | "horizontal" = "vertical";
        let bestValue = -Infinity;
        this.nodes.forEach((row, _orientation) => {
            row.forEach((cell, _x) => {
                cell.forEach((node, _y) => {
                    const value = node.wins / node.visits + 1.41421356237 + Math.sqrt(2 * Math.log(this.visits) / node.visits);
                    if (value > bestValue) {
                        bestValue = value;
                        orientation = _orientation as "vertical" | "horizontal";
                        x = +_x;
                        y = +_y;
                        bestNode = node;
                    }
                });
            });
        });
        return { bestNode: bestNode!, x, y, orientation };
    }

    private simulate() {
        let result = this.board.getNodes().next()
        let endBoard;
        while (!result.done) {
            endBoard = result.value.board;
            result = result.value.board.getNodes().next();
        }
        if (!endBoard) return false;
        return endBoard.getScore()[this.player] > endBoard.getScore()[this.player === 1 ? 0 : 1];
    }

    private expansion() {
        const { value, done } = this.generator.next();

        if (done) return false;

        const { orientation, x, y, board } = value;
        const child = new Node(board, this.player, this);
        let mapOrientation = this.nodes.get(orientation);
        if (!mapOrientation) {
            mapOrientation = new Map();
            this.nodes.set(orientation, mapOrientation);
        }

        let mapX = mapOrientation.get(x);
        if (!mapX) {
            mapX = new Map();
            mapOrientation.set(x, mapX);
        }

        mapX.set(y, child);

        child.backpropagation(child.simulate());

        return true;
    }

    private backpropagation(won: boolean) {
        if (won) {
            this.wins++;
        }
        this.visits++;
        if (this.parent) {
            this.parent.backpropagation(won);
        }
    }

    public getBestChild() {
        let bestNode: Node | null = null;
        let x: number = 0;
        let y: number = 0;
        let orientation: "vertical" | "horizontal" = "vertical";
        let bestValue = -Infinity;
        this.nodes.forEach((row, _orientation) => {
            row.forEach((cell, _x) => {
                cell.forEach((node, _y) => {
                    const value = node.wins / node.visits;
                    if (value > bestValue) {
                        orientation = _orientation as "vertical" | "horizontal";
                        x = +_x;
                        y = +_y;
                        bestValue = value;
                        bestNode = node;
                    }
                });
            });
        });
        return { bestNode, x, y, orientation };
    }

    getNumberVisited() {
        return this.visits;
    }

}