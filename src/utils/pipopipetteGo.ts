import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-wasm"
import { Board, playValue } from "./game"
import { Coup } from "./player";

tf.setBackend("wasm");
// tf.setBackend("webgl")

// 5 x 5 grid 

// columns => 6 x 5 => 6 x 6 (padding) 
// rows => 5 x 6 => 6 x 6 (padding)
// cells => 5 x 5 => 6 x 6 (padding)

//https://medium.com/applied-data-science/alphago-zero-explained-in-one-diagram-365f5abf67e0

//first er 
// 8  x 3 (6x6)
// => current + 7 last moves
//second er
// 8 x (6x6)
// => current + 7 last moves 
// 6 x 6 x 1 
// => All 1 for the first er
// => All 0 for the second er


export class ResidualBlock extends tf.layers.Layer {
    private conv1: tf.layers.Layer;
    private conv2: tf.layers.Layer;
    private batchNorm1: tf.layers.Layer;
    private batchNorm2: tf.layers.Layer;
    private add: tf.layers.Layer;
    private reLU: tf.layers.Layer;

    constructor() {
        super({});
        this.conv1 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 256,
            padding: 'same'
        });
        this.conv2 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 256,
            padding: 'same'
        });
        this.batchNorm1 = tf.layers.batchNormalization();
        this.batchNorm2 = tf.layers.batchNormalization();
        this.add = tf.layers.add();
        this.reLU = tf.layers.reLU();
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        let x = this.conv1.apply(input) as tf.Tensor;
        x = this.batchNorm1.apply(x) as tf.Tensor;
        x = this.reLU.apply(x) as tf.Tensor;
        x = this.conv2.apply(x) as tf.Tensor;
        x = this.batchNorm2.apply(x) as tf.Tensor;
        x = this.add.apply([input, x]) as tf.Tensor;
        return this.reLU.apply(x) as tf.Tensor;
    }

    getClassName(): string {
        return 'ResidualBlock';
    }
}

export class ResidualLayer extends tf.layers.Layer {
    private residualBlocks: ResidualBlock[];

    constructor() {
        super({});
        this.residualBlocks = new Array(5).fill(0).map(() => new ResidualBlock());
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        console.log(input)
        let x = input;
        for (const residualBlock of this.residualBlocks) {
            x = residualBlock.apply(x) as tf.Tensor;
        }
        return x;
    }

    getClassName(): string {
        return 'ResidualLayer';
    }
}

export class ConvLayer extends tf.layers.Layer {
    private conv: tf.layers.Layer;
    private batchNorm: tf.layers.Layer;
    private reLU: tf.layers.Layer;

    constructor() {
        super({
            inputShape: [1,43, 6, 6]
        });
        this.conv = tf.layers.conv2d({
            kernelSize: 3,
            filters: 256,
            padding: 'same'
        });
        this.batchNorm = tf.layers.batchNormalization();
        this.reLU = tf.layers.reLU();
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [43, 6, 6];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        let x = this.conv.apply(input) as tf.Tensor;
        x = this.batchNorm.apply(x) as tf.Tensor;
        return this.reLU.apply(x) as tf.Tensor;
    }

    getClassName(): string {
        return 'ConvLayer';
    }
}

export class HeadLayer extends tf.layers.Layer {
    private conv: tf.layers.Layer;
    private batchNorm: tf.layers.Layer;
    private reLU: tf.layers.Layer;
    private flatten: tf.layers.Layer;
    private dense1: tf.layers.Layer;
    private dense2: tf.layers.Layer;

    constructor() {
        super({});
        this.conv = tf.layers.conv2d({
            kernelSize: 1,
            filters: 2,
            activation: 'relu'
        });
        this.batchNorm = tf.layers.batchNormalization();
        this.reLU = tf.layers.reLU();
        this.flatten = tf.layers.flatten();
        this.dense1 = tf.layers.dense({
            units: 256,
            activation: 'softmax'
        });
        this.dense2 = tf.layers.dense({
            units: 1,
            activation: 'tanh'
        });
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        let x = this.conv.apply(input) as tf.Tensor;
        x = this.batchNorm.apply(x) as tf.Tensor;
        x = this.reLU.apply(x) as tf.Tensor;
        x = this.flatten.apply(x) as tf.Tensor;
        x = this.dense1.apply(x) as tf.Tensor;
        x = this.reLU.apply(x) as tf.Tensor;
        return this.dense2.apply(x) as tf.Tensor;
    }

    getClassName(): string {
        return 'HeadLayer';
    }
}

export class PolicyLayer extends tf.layers.Layer {
    private conv: tf.layers.Layer;
    private batchNorm: tf.layers.Layer;
    private reLU: tf.layers.Layer;
    private flatten: tf.layers.Layer;
    private dense: tf.layers.Layer;

    constructor() {
        super({});
        this.conv = tf.layers.conv2d({
            kernelSize: 1,
            filters: 2,
            activation: 'relu'
        });
        this.batchNorm = tf.layers.batchNormalization();
        this.reLU = tf.layers.reLU();
        this.flatten = tf.layers.flatten();
        this.dense = tf.layers.dense({
            units: 5 * 6 * 2, // 5 x 6 columns and 5 x 6 rows
            activation: 'softmax'
        });
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        let x = this.conv.apply(input) as tf.Tensor;
        x = this.batchNorm.apply(x) as tf.Tensor;
        x = this.reLU.apply(x) as tf.Tensor;
        x = this.flatten.apply(x) as tf.Tensor;
        return this.dense.apply(x) as tf.Tensor;
    }

    getClassName(): string {
        return 'PolicyLayer';
    }
}

export class OutputLayer extends tf.layers.Layer {
    private headLayer: HeadLayer;
    private policyLayer: PolicyLayer;

    constructor() {
        super({});
        this.headLayer = new HeadLayer();
        this.policyLayer = new PolicyLayer();
    }

    computeOutputShape(inputShape: tf.Shape): tf.Shape {
        return [];
    }

    call(input: tf.Tensor, kwargs: any): tf.Tensor {
        const x = this.headLayer.apply(input) as tf.Tensor;
        const y = this.policyLayer.apply(input) as tf.Tensor;

        return x.concat(y, 1) as tf.Tensor;
    }

    getClassName(): string {
        return 'OutputLayer';
    }
}

const model = tf.sequential()
model.add(new ConvLayer())
model.add(new ResidualLayer())
model.add(new PolicyLayer())
model.add(new OutputLayer())

export default async function pipopipetteGo(board: Board, player: 0 | 1):Promise<Coup> {
    await tf.ready()
    const historyCount = 7

    const player1History: Omit<typeof board.history[0], "score" | "player">[] = []
    const player2History: Omit<typeof board.history[0], "score" | "player">[] = []

    const history = board.history
    for (let i = history.length - 1; i >= 0; i--) {
        if (player1History.length === historyCount && player2History.length === historyCount) break
        if (history[i].player === 0 && player1History.length < historyCount) {
            player1History.push({
                verticals: history[i].verticals.map(v => v.map(v => v === player ? 1 : 0)),
                horizontals: history[i].horizontals.map(v => v.map(v => v === player ? 1 : 0)),
                cells: history[i].cells.map(v => v.map(v => v === player ? 1 : 0)),
            })
        } else if (history[i].player === 1 && player2History.length < historyCount) {
            player2History.push({
                verticals: history[i].verticals.map(v => v.map(v => v === (player + 1) % 2 ? 1 : 0)),
                horizontals: history[i].horizontals.map(v => v.map(v => v === (player + 1) % 2 ? 1 : 0)),
                cells: history[i].cells.map(v => v.map(v => v === (player + 1) % 2 ? 1 : 0)),
            })
        }
    }

    if (player1History.length < historyCount) {
        player1History.push(...new Array(historyCount - player1History.length).fill({
            verticals: new Array(5).fill(new Array(6).fill(0)),
            horizontals: new Array(6).fill(new Array(5).fill(0)),
            cells: new Array(5).fill(new Array(5).fill(0)),
        }))
    }

    if (player2History.length < historyCount) {
        player2History.push(...new Array(historyCount - player2History.length).fill({
            verticals: new Array(5).fill(new Array(6).fill(0)),
            horizontals: new Array(6).fill(new Array(5).fill(0)),
            cells: new Array(5).fill(new Array(5).fill(0)),
        }))
    }

    const array = [
        ...player1History.map(({ verticals }) => [...verticals, Array(6).fill(0)]),
        ...player1History.map(({ horizontals }) => horizontals.map((v, i) => [...v, 0])),
        ...player1History.map(({ cells }) => [...cells.map(c => [...c, 0]), Array(6).fill(0)]),
        ...player2History.map(({ verticals }) => [...verticals, Array(6).fill(0)]),
        ...player2History.map(({ horizontals }) => horizontals.map((v, i) => [...v, 0])),
        ...player2History.map(({ cells }) => [...cells.map(c => [...c, 0]), Array(6).fill(0)]),
        new Array(6).fill(Array(6).fill(1))
    ];
    const p = model.apply(tf.tensor(array, [43, 6, 6])) as tf.Tensor 
    return p.data().then(d => {
        //find max value (index)
        let max = -Infinity
        let index = -1
        for (let i = 0; i < d.length; i++) {

            if(i < 30){
                if(board.getVerticals()[i % 5][Math.floor(i / 5)] !== -1)continue;
            }
            else{
                if(board.getHorizontals()[(i-30) % 6][Math.floor((i-30) / 6)] !== -1)continue;
            }
            


            if (d[i] > max) {
                max = d[i]
                index = i
            }
        }

        if( index < 30){
            return {
                orientation: "vertical",
                //Grille 5 x 6
                x:  Math.floor(index / 5),
                y:index % 5,
            }
        }

        //enleve les coups verticaux
        index -= 30
        return {
            orientation: "horizontal",
            //Grille 6 x 5
            x: Math.floor(index / 6),
            y: index % 6,
        }
    })
    
    
}
