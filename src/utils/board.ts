export type NodeGenerator = Generator<
    {
        x: number;
        y: number;
        board: Board;
        orientation: "vertical" | "horizontal";
    },
    void,
    void
>;

export interface Coup {
    x: number,
    y: number,
    orientation: "vertical" | "horizontal"
}

export type PlayValue = -1 | 0 | 1;
export type PlayerValue = 0 | 1;

export class Board {
    readonly cells: ReadonlyArray<ReadonlyArray<PlayValue>> = [];
    readonly verticals: ReadonlyArray<ReadonlyArray<PlayValue>> = [];
    readonly horizontals: ReadonlyArray<ReadonlyArray<PlayValue>> = [];
    readonly previousBoard: Board | null = null;
    readonly score: readonly [number, number] = [0, 0];
    readonly tour: PlayerValue = 0;

    constructor(size: number);
    constructor(board: { cells: PlayValue[][]; verticals: PlayValue[][]; horizontals: PlayValue[][]; score: [number, number]; tour: PlayerValue, previousBoard?: Board });
    constructor(BoardOrSize: number | { cells: PlayValue[][]; verticals: PlayValue[][]; horizontals: PlayValue[][]; score: [number, number]; tour: PlayerValue, previousBoard?: Board }) {
        if (typeof BoardOrSize === "number") {
            this.cells = new Array(BoardOrSize).fill(0).map(() => new Array(BoardOrSize).fill(-1));
            this.verticals = new Array(BoardOrSize)
                .fill(0)
                .map(() => new Array(BoardOrSize + 1).fill(-1));
            this.horizontals = new Array(BoardOrSize + 1)
                .fill(0)
                .map(() => new Array(BoardOrSize).fill(-1));
            this.score = [0, 0];
            this.tour = 0;
        } else {
            this.cells = BoardOrSize.cells;
            this.verticals = BoardOrSize.verticals;
            this.horizontals = BoardOrSize.horizontals;
            this.score = BoardOrSize.score;
            this.tour = BoardOrSize.tour;
            this.previousBoard = BoardOrSize.previousBoard || null;
        }
    }

    public getWinner(): -1 | 0 | 1 {
        return this.score[0] > this.score[1] ? 0 : this.score[0] < this.score[1] ? 1 : -1;
    }

    public play(
        orientation: "vertical" | "horizontal",
        x: number,
        y: number
    ): Board | null {

        const newHorizontals = this.horizontals.map((row) => [...row]);
        const newVerticals = this.verticals.map((row) => [...row]);
        const newCells = this.cells.map((row) => [...row]);
        const newScore = [...this.score];
        let newTour = this.tour;

        if (orientation === "vertical") {
            if (newVerticals[y][x] !== -1) {
                console.error("Invalid move " + orientation + x + y)
                return null;
            }
            newVerticals[y][x] = this.tour;
        } else {
            if (newHorizontals[y][x] !== -1) {
                console.error("Invalid move " + orientation + x + y);
                return null;
            }
            newHorizontals[y][x] = this.tour;


        }

        const cells: Array<[x: number, y: number]> = [];

        if (orientation === "horizontal") {
            let result = this.check(newHorizontals, newVerticals, x, y);
            if (result) cells.push(result);
            result = this.check(newHorizontals, newVerticals, x, y - 1);
            if (result) cells.push(result);
        } else {
            let result = this.check(newHorizontals, newVerticals, x, y);
            if (result) cells.push(result);
            result = this.check(newHorizontals, newVerticals, x - 1, y);
            if (result) cells.push(result);
        }

        if (!cells.length) {
            newTour = newTour === 1 ? 0 : 1;
        } else {
            newScore[newTour] += cells.length;

            cells.forEach((cell) => {
                newCells[cell[1]][cell[0]] = newTour;
            });
        }

        return new Board({
            cells: newCells,
            verticals: newVerticals,
            horizontals: newHorizontals,
            score: newScore as [number, number],
            tour: newTour,
            previousBoard: this
        });
    }

    public isFinished() {
        return this.score[0] > this.cells.length ** 2 / 2 || this.score[1] > this.cells.length ** 2 / 2 || this.score[0] + this.score[1] === this.cells.length ** 2;
    }

    private check(horizontals: PlayValue[][], verticals: PlayValue[][], x: number, y: number): false | [x: number, y: number] {
        if (x < 0 || x >= this.cells.length || y < 0 || y >= this.cells.length) {
            return false;
        }
        if (
            verticals[y][x] !== -1 &&
            verticals[y][x + 1] !== -1 &&
            horizontals[y][x] !== -1 &&
            horizontals[y + 1]?.[x] !== -1
        ) {
            return [x, y];
        }
        return false;
    }

    public evaluation(idPlayer: PlayerValue) {
        return this.score[idPlayer] - this.score[idPlayer === 1 ? 0 : 1];
    }


    public *getNodes(depthLimit?: number): NodeGenerator {
        const playable = [
            ...this.verticals
                .flatMap((row, y) => row.map((value, x) => ({ x, y, value, orientation: "vertical" } satisfies Coup & { value: number }))),
            ...this.horizontals
                .flatMap((row, y) => row.map((value, x) => ({ x, y, value, orientation: "horizontal" } satisfies Coup & { value: number })))
        ]
            .filter(({ value }) => value === -1)


        let currentIndex = playable.length;
        while (currentIndex !== 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [playable[currentIndex], playable[randomIndex]] = [
                playable[randomIndex], playable[currentIndex]];
        }

        for (let i = 0; i < playable.length; i++) {
            const { x, y, orientation } = playable[i];
            const board = this.play(orientation, x, y)!;
            if (board.tour === board.previousBoard!.tour && !board.isFinished() && (depthLimit === undefined || depthLimit > 0)) {
                for (const node of board.getNodes(depthLimit ? depthLimit - 1 : undefined)) {
                    yield { ...node, x, y, orientation };
                }
            } else yield { x, y, board, orientation };
        }
    }
}


