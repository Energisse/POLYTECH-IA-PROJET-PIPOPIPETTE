import { playValue, playerValue } from "../utils/game"

export interface MainToWorkerEventMap {
    "start": CustomEvent<{
        player1: {
            type: "human" | "random",
        } | {
            type: "minimax" | "alphabeta",
            depth: number
        } | {
            type: "mcts",
            iteration: number,
            simulation: number,
            c: number
        } | {
            type: "fastest",
            depth: number,
            iteration: number,
            simulation: number,
            c: number
        }
        player2: {
            type: "human" | "random",
        } | {
            type: "minimax" | "alphabeta",
            depth: number
        } | {
            type: "mcts",
            iteration: number,
            simulation: number,
            c: number
        } | {
            type: "fastest",
            depth: number,
            iteration: number,
            simulation: number,
            c: number
        }
        size: number
    }>,
    "play": CustomEvent<{
        x: number,
        y: number,
        orientation: "vertical" | "horizontal"
    }>,
}

export interface WorkerToMainEventMap {
    "change": CustomEvent<{
        verticals: playValue[][],
        horizontals: playValue[][],
        score: [number, number],
        tour: playerValue,
        cells: playValue[][]
    }>,
    "end": CustomEvent<{
        winner: playerValue
    }>,
    "tree": CustomEvent<any>
}

declare global {
    interface DedicatedWorkerGlobalScope {
        emit<K extends keyof WorkerToMainEventMap>(...args: WorkerToMainEventMap[K]["detail"] extends void ? [type: K] : [type: K, data: WorkerToMainEventMap[K]["detail"]]): void;
        addEventListener<K extends keyof MainToWorkerEventMap>(type: K,
            listener: (this: Document, ev: MainToWorkerEventMap[K]) => void): void;
        dispatchEvent<K extends keyof MainToWorkerEventMap>(ev: MainToWorkerEventMap[K]): void;
    }

    interface Worker {
        emit<K extends keyof MainToWorkerEventMap>(...args: MainToWorkerEventMap[K]["detail"] extends void ? [type: K] : [type: K, data: MainToWorkerEventMap[K]["detail"]]): void;
        addEventListener<K extends keyof WorkerToMainEventMap>(type: K,
            listener: (this: Document, ev: WorkerToMainEventMap[K]) => void): void;
        dispatchEvent<K extends keyof WorkerToMainEventMap>(ev: WorkerToMainEventMap[K]): void;
    }
}

DedicatedWorkerGlobalScope.prototype.emit = function (message) {
    this.postMessage(message);
};


export { }; //this is needed to make this file a module
