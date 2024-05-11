export class Game {

    private cells: number[][] = [];
    private verticals: number[][] = [];
    private horizontals: number[][] = [];

    private score: number[] = [0, 0];

    private tour: number = 1;

    constructor(size: number) {
        this.cells = new Array(size).fill(0).map(() => new Array(size).fill(0));
        this.verticals = new Array(size).fill(0).map(() => new Array(size + 1).fill(0));
        this.horizontals = new Array(size + 1).fill(0).map(() => new Array(size).fill(0));
    }

    public getCells(): number[][] {
        return this.cells;
    }

    public getVerticals(): number[][] {
        return this.verticals;
    }

    public getHorizontals(): number[][] {
        return this.horizontals;
    }

    public getScore(): number[] {
        return this.score;
    }

    public getTour(): number {
        return this.tour;
    }

    public play(orientation: "vertical" | "horizontal", x: number, y: number): void {
        if (orientation === "vertical") {
            if (this.verticals[y][x] !== 0) return;
            this.verticals[y][x] = this.tour;
        } else {
            if (this.horizontals[y][x] !== 0) return;
            this.horizontals[y][x] = this.tour;
        }

        const cells: Array<[x: number, y: number]> = []

        if (orientation === "horizontal") {
            let result = this.check(x, y);
            if (result) cells.push(result);
            result = this.check(x, y - 1);
            if (result) cells.push(result);
        }
        else {
            let result = this.check(x, y);
            if (result) cells.push(result);
            result = this.check(x - 1, y);
            if (result) cells.push(result);
        }

        if (!cells.length) {
            this.tour = this.tour === 1 ? 2 : 1;
            return;
        }

        this.score[this.tour - 1] += cells.length;

        cells.forEach((cell) => {
            this.cells[cell[1]][cell[0]] = this.tour;
        });
    }

    private check(x: number, y: number): false | [x: number, y: number] {
        if (x < 0 || x >= this.cells.length || y < 0 || y >= this.cells.length) {
            return false;
        }
        if (
            this.verticals[y][x] &&
            this.verticals[y][x + 1] &&
            this.horizontals[y][x] &&
            this.horizontals[y + 1]?.[x]
        ) {
            return [x, y];
        }
        return false;
    }
}