import { Board } from "./game";


export class MctsNode {
    public wins: number;
    public visits: number;
    private nodes: Map<"vertical" | "horizontal", Map<number, Map<number, MctsNode>>>;
    public parent: MctsNode | null;
    private board: Board;
    private player: number;
    private simulation: number;
    private c: number
    private generator: Generator<{ orientation: "vertical" | "horizontal"; x: number; y: number, board: Board }, void, unknown>;

    constructor(board: Board, player: number, simulation: number, c: number, parent: MctsNode | null = null) {
        this.wins = 0;
        this.visits = 0;
        this.nodes = new Map();
        this.parent = parent;
        this.generator = board.getNodes();
        this.board = board;
        this.simulation = simulation;
        this.player = player;
        this.c = c;
    }


    public run() {
        if (this.board.isFinished()) {
            for (let i = 0; i < this.simulation; i++) {
                this.backpropagation(this.simulate());
            }
            return
        }

        let newChild = this.expansion()
        if (newChild) {
            for (let i = 0; i < this.simulation; i++) {
                newChild.backpropagation(newChild.simulate());
            }
        }
        else {
            const { bestNode } = this.selection();
            bestNode.run();
        }
    }

    private selection(): {
        bestNode: MctsNode;
        x: number;
        y: number;
        orientation: "vertical" | "horizontal";
    } {
        let bestNode: MctsNode | null = null;
        let x: number = 0;
        let y: number = 0;
        let orientation: "vertical" | "horizontal" = "vertical";
        let bestValue = -Infinity;
        this.nodes.forEach((row, _orientation) => {
            row.forEach((cell, _x) => {
                cell.forEach((node, _y) => {
                    const value = node.wins / node.visits + this.c + Math.sqrt(2 * Math.log(this.visits) / node.visits);
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
        const child = new MctsNode(board, this.player, this.simulation, this.c, this);
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

        return child;
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
        let bestNode: MctsNode | null = null;
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
        return { bestNode: bestNode!, x, y, orientation };
    }

    getNumberVisited() {
        return this.visits;
    }

}