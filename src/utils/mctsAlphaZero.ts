import { LayersModel, Tensor } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs"
import AlplhaZeroPlayer from "./players/AlphaZeroPlayer";
import { Board } from "./board";


export class MctsNodePipopipetteGo {
    //le nombre de visites
    public N: number;

    //La valeur total des prochains noeuds
    public W: number;

    //La moyenne des valeurs des prochains noeuds
    public Q: number;

    //La probabilité de choisir ce noeud
    public P: number

    // public nodes: Map<"vertical" | "horizontal", Map<number, Map<number, MctsNodePipopipetteGo>>>;
    public nodes: [
        vertical: Array<Array<MctsNodePipopipetteGo>>,
        horizontal: Array<Array<MctsNodePipopipetteGo>>,
    ]

    public expanded: boolean = false;

    public parent: MctsNodePipopipetteGo | null;
    public board: Board;
    private player: 0 | 1;
    private model: LayersModel;

    constructor(model: LayersModel, board: Board, player: 0 | 1, parent: MctsNodePipopipetteGo | null = null) {
        this.N = 0;
        this.W = 0;
        this.Q = 0;
        this.P = 0;

        this.nodes = [
            Array.from({ length: board.verticals[0].length }, () => Array(board.verticals.length).fill(null)),
            Array.from({ length: board.horizontals[0].length }, () => Array(board.horizontals.length).fill(null))
        ];

        this.parent = parent;
        this.model = model;
        this.board = board;
        this.player = player;
    }


    public async run() {
        //Si le jeu est fini on simule et on backpropage
        if (this.board.isFinished()) {
            const winner = this.board.getWinner();
            if (winner === -1) return this.backpropagation(0); //Draw
            return this.backpropagation(winner === this.board.tour ? 1 : -1);
        }

        //Si il n'y a pas de noeuds on simule et on backpropage et on ajoute les enfants
        if (!this.expanded) {
            this.expanded = true;
            const [headValue, headPolicy] = await this.simulate();
            this.backpropagation(headValue[0]);
            this.expansion(headPolicy);
        }
        else {
            await this.selection().run();
        }
    }

    private selection():
        MctsNodePipopipetteGo {
        let bestMoveEnnemy: { bestNode: MctsNodePipopipetteGo | null, bestValue: number } = {
            bestNode: null,
            bestValue: -Infinity
        };
        let bestMove: { bestNode: MctsNodePipopipetteGo | null, bestValue: number } = {
            bestNode: null,
            bestValue: -Infinity
        };

        for (let _orientation = 0; _orientation < this.nodes.length; _orientation++) {
            for (let _x = 0; _x < this.nodes[_orientation].length; _x++) {
                for (let _y = 0; _y < this.nodes[_orientation][_x].length; _y++) {
                    const node = this.nodes[_orientation][_x][_y]

                    if (node) {
                        const U = node.P * (Math.log(this.N + 1) / (1 + node.N))
                        const value = node.Q + U;

                        let playerCible = node.board.tour === this.player ? bestMove : bestMoveEnnemy;

                        if (value > playerCible.bestValue) {
                            playerCible.bestValue = value;
                            playerCible.bestNode = node;
                        }
                    }
                }
            }
        }


        if (!bestMoveEnnemy.bestNode && !bestMove.bestNode) {
            throw new Error("No best node found")
        }

        //There is no move for the ennemy
        if (!bestMoveEnnemy.bestNode) return bestMove.bestNode!

        //There is no move for the player
        if (!bestMove.bestNode) return bestMoveEnnemy.bestNode

        //If there is moves for both player we take the best move
        if (bestMove.bestValue > -bestMoveEnnemy.bestValue) return bestMove.bestNode
        return bestMoveEnnemy.bestNode

    }

    private async simulate() {
        const input = tf.tensor([AlplhaZeroPlayer.createModelInput(this.board)]);
        return Promise.all(
            (this.model.apply(input) as [Tensor, Tensor]).map(t =>
                t.data().then(data => (t.dispose(), data))
            )
        ).then(data => (input.dispose(), data));
    }

    private expansion(policyValues: Float32Array | Int32Array | Uint8Array) {
        const numberOfMovesHorizontals = this.board.cells.length * (this.board.cells.length + 1);

        //On enleve les coups deja joué
        policyValues = policyValues.map((v, index) => {
            const orientation = index < numberOfMovesHorizontals ? "vertical" : "horizontal";
            const x = index < numberOfMovesHorizontals ? index % (this.board.cells.length + 1) : (index - numberOfMovesHorizontals) % this.board.cells.length;
            const y = index < numberOfMovesHorizontals ? Math.floor(index / (this.board.cells.length + 1)) : Math.floor((index - numberOfMovesHorizontals) / this.board.cells.length);
            if (orientation === "vertical" && this.board.verticals[y][x] !== -1) return 0;
            if (orientation === "horizontal" && this.board.horizontals[y][x] !== -1) return 0;

            return v;
        })

        const sum = Array.from(policyValues).reduce((a, b) => {
            if (b === 0) return a;
            return a + Math.E ** b
        }, 0);


        policyValues = policyValues.map(v => {
            if (v === 0) return 0;
            return Math.E ** v / sum;
        });


        for (let index = 0; index < policyValues.length; index++) {
            if (policyValues[index] === 0) continue;
            const orientation = index < numberOfMovesHorizontals ? "vertical" : "horizontal";
            const x = index < numberOfMovesHorizontals ? index % (this.board.cells.length + 1) : (index - numberOfMovesHorizontals) % this.board.cells.length;
            const y = index < numberOfMovesHorizontals ? Math.floor(index / (this.board.cells.length + 1)) : Math.floor((index - numberOfMovesHorizontals) / this.board.cells.length);

            const child = new MctsNodePipopipetteGo(this.model, this.board.play(orientation, x, y)!, this.player, this);
            child.P = policyValues[index];

            this.nodes[orientation === "vertical" ? 0 : 1][x][y] = child;
        }
    }

    private backpropagation(leafW: number) {
        this.N++;
        this.W += leafW;
        this.Q = this.W / this.N;

        if (this.parent) this.parent.backpropagation((this.parent.board.tour === this.board.tour ? 1 : -1) * leafW);
    }

    /**
     * 
     * @returns 
     */
    public getBestChild(stochastic: boolean = false): {
        bestNode: MctsNodePipopipetteGo;
        x: number;
        y: number;
        orientation: "vertical" | "horizontal";
    } {
        if (stochastic) {
            let prob = Math.floor(Math.random() * this.N);
            for (let _orientation = 0; _orientation < this.nodes.length; _orientation++) {
                for (let _x = 0; _x < this.nodes[_orientation].length; _x++) {
                    for (let _y = 0; _y < this.nodes[_orientation][_x].length; _y++) {
                        const node = this.nodes[_orientation][_x][_y]
                        if (node) {
                            if (prob <= node.N) {
                                return { bestNode: node, x: _x, y: _y, orientation: (_orientation === 0 ? "vertical" : "horizontal") }
                            }
                            prob -= node.N;
                        }
                    }
                }
            }
            throw new Error("No best node found" + this.nodes.reduce((a, b) => a + b.reduce((a, b) => a + b.reduce((a, b) => a + (b ? b.N : 0), 0), 0), 0))
        }
        let bestNode: MctsNodePipopipetteGo | null = null;
        let x: number = 0;
        let y: number = 0;
        let orientation: "vertical" | "horizontal" = "vertical";
        let bestValue = -Infinity;

        for (let _orientation = 0; _orientation < this.nodes.length; _orientation++) {
            for (let _x = 0; _x < this.nodes[_orientation].length; _x++) {
                for (let _y = 0; _y < this.nodes[_orientation][_x].length; _y++) {
                    const node = this.nodes[_orientation][_x][_y]
                    if (node) {
                        //En mode deterministe on prend le meilleur coup
                        const value = node.N
                        if (value > bestValue) {
                            orientation = (_orientation === 0 ? "vertical" : "horizontal");
                            x = +_x;
                            y = +_y;
                            bestValue = value;
                            bestNode = node;
                        }
                    }
                }
            }
        }

        return { bestNode: bestNode!, x, y, orientation };
    }
}