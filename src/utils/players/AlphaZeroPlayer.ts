import { models } from "../../models";
import { Board } from "../board";
import { MctsNodePipopipetteGo } from "../mctsAlphaZero";
import { IaPlayer } from "./IAPlayer"
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";

tf.setBackend("wasm");


export default class AlplhaZeroPlayer extends IaPlayer {
    private model: tf.LayersModel | null = null;
    private modelString: string;
    private root: MctsNodePipopipetteGo | null = null
    private mctsIteration: number

    /**
    * 
    * @param {number} minTimeToPlay - Le temps minimal pour jouer un coup.
    */
    constructor({ minTimeToPlay, model, mctsIteration, }: { minTimeToPlay?: number, model: string, mctsIteration: number }) {
        super({ minTimeToPlay })
        this.mctsIteration = mctsIteration
        this.modelString = model
    }

    async playIa(board: Board, player: 0 | 1) {
        if (!this.model) {
            await tf.ready()
            const { model, weights } = models.get(board.cells.length)!.get(this.modelString)!
            this.model = await fetch((weights as any).default).then(async (res) => tf.loadLayersModel(tf.io.fromMemory({
                weightData: base64ToArrayBuffer(await res.text()),
                ...model
            })))


            if (!this.model) {
                throw new Error("Model not loaded")
            }
        }

        this.root = new MctsNodePipopipetteGo(this.model, board, player)

        for (let i = 0; i < this.mctsIteration; i++) {
            await this.root.run()
        }
        console.log(this.root)
        const { bestNode, ...coup } = this.root.getBestChild()
        return coup
    }

    static createModelInput(board: Board) {
        const historySize = 7
        const size = board.cells.length + 1

        const player1History: Pick<Board, "horizontals" | "verticals">[] = []
        const player2History: Pick<Board, "horizontals" | "verticals">[] = []

        let current: Board | null = board
        while (current?.previousBoard) {
            if (player1History.length === historySize && player2History.length === historySize) break
            if (current.previousBoard.tour === 0 && player1History.length < historySize) {
                player1History.push({
                    verticals: [...current.verticals.map(v => v.map(v => v === 0 ? 1 : 0)), Array(size).fill(0)],
                    horizontals: current.horizontals.map(h => [...h.map(h => h === 0 ? 1 : 0), 0]),
                    // cells: [...current.cells.map(c => [...c.map(c => c === 0 ? 1 : 0), 0]), Array(size).fill(0)],
                })
            } else if (player2History.length < historySize) {
                player2History.push({
                    verticals: [...current.verticals.map(v => v.map(v => v === 1 ? 1 : 0)), Array(size).fill(0)],
                    horizontals: current.horizontals.map(h => [...h.map(h => h === 1 ? 1 : 0), 0]),
                    // cells: [...current.cells.map(c => [...c.map(c => c === 1 ? 1 : 0), 0]), Array(size).fill(0)],
                })
            }
            current = current.previousBoard
        }

        if (player1History.length < historySize) {
            player1History.push(...new Array(historySize - player1History.length).fill({
                verticals: new Array(size).fill(new Array(size).fill(0)),
                horizontals: new Array(size).fill(new Array(size).fill(0)),
                // cells: new Array(size).fill(new Array(size).fill(0)),
            }))
        }

        if (player2History.length < historySize) {
            player2History.push(...new Array(historySize - player2History.length).fill({
                verticals: new Array(size).fill(new Array(size).fill(0)),
                horizontals: new Array(size).fill(new Array(size).fill(0)),
                // cells: new Array(size).fill(new Array(size).fill(0)),
            }))
        }

        return [
            ...player1History.map(({ verticals }) => verticals),
            ...player1History.map(({ horizontals }) => horizontals),
            // ...player1History.map(({ cells }) => cells),
            ...player2History.map(({ verticals }) => verticals),
            ...player2History.map(({ horizontals }) => horizontals),
            // ...player2History.map(({ cells }) => cells),
            new Array(size).fill(Array(size).fill(board.tour ? 0 : 1))
        ];
    }
}

const base64ToArrayBuffer = (base64String: string) => {
    const binaryString = atob(base64String); // Décoder la chaîne Base64 en binaire
    const len = binaryString.length;
    const bytes = new Uint8Array(len); // Créer un tableau d'octets (ArrayBuffer)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // Retourner le buffer sous-jacent
};