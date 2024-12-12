import { playValue, playerValue } from "../utils/game"


type PlayerStartEvent = {
    type: "human"
} | {
    type: "random",
    minTimeToPlay: number
    depthLimit?: number
} | {
    type: "minimax" | "alphabeta",
    depth: number
    minTimeToPlay: number
    depthLimit?: number
} | {
    type: "mcts",
    iteration: number,
    simulation: number,
    c: number
    minTimeToPlay: number
} | {
    type: "fastest",
    depth: number
    iteration: number,
    simulation: number,
    c: number
    minTimeToPlay: number
    depthLimit?: number
}

export interface MainToWorkerEventMap {
    "start": CustomEvent<{
        player1: PlayerStartEvent
        player2: PlayerStartEvent
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
        verticals: ReadonlyArray<ReadonlyArray<playValue>>,
        horizontals: ReadonlyArray<ReadonlyArray<playValue>>,
        score: readonly [number, number],
        tour: readonly playerValue,
        cells: ReadonlyArray<ReadonlyArray<playValue>>
    }>,
    "end": CustomEvent<{
        winner: playerValue
    }>,
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
