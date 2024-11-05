import * as tf from "@tensorflow/tfjs"
import { Board, playValue } from "./game"

tf.setBackend("wasm")

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



class ResidualBlock {
    private conv1 = tf.layers.conv2d({
        kernelSize: 3,
        filters: 256,
        padding: 'same'
    })

    private conv2 = tf.layers.conv2d({
        kernelSize: 3,
        filters: 256,
        padding: 'same'
    })

    private batchNorm1 = tf.layers.batchNormalization()

    private batchNorm2 = tf.layers.batchNormalization()

    private add = tf.layers.add()

    private reLU = tf.layers.reLU()

    public apply(input: tf.Tensor): tf.Tensor {
        let x = this.conv1.apply(input) as tf.Tensor
        x = this.batchNorm1.apply(x) as tf.Tensor
        x = this.reLU.apply(x) as tf.Tensor
        x = this.conv2.apply(x) as tf.Tensor
        x = this.batchNorm2.apply(x) as tf.Tensor
        x = this.add.apply([input, x]) as tf.Tensor
        return this.reLU.apply(x) as tf.Tensor
    }
}

const convLayer = tf.sequential()
convLayer.add(tf.layers.conv2d({
    inputShape: [43, 6, 6],
    kernelSize: 3,
    filters: 256,
    activation: 'relu',
}))
convLayer.add(tf.layers.batchNormalization())
convLayer.add(tf.layers.reLU())

const headLayer = tf.sequential()
headLayer.add(tf.layers.conv2d({
    inputShape: [41, 4, 256],
    kernelSize: 1,
    filters: 2,
    activation: 'relu'
}))
headLayer.add(tf.layers.batchNormalization())
headLayer.add(tf.layers.reLU())
headLayer.add(tf.layers.flatten())
headLayer.add(tf.layers.dense({
    units: 256,
    activation: 'softmax'
}))
headLayer.add(tf.layers.reLU())
headLayer.add(tf.layers.dense(
    {
        units: 1,
        activation: 'tanh'
    }
))

const policyLayer = tf.sequential()
policyLayer.add(tf.layers.conv2d({
    inputShape: [41, 4, 256],
    kernelSize: 1,
    filters: 2,
    activation: 'relu'
}))
policyLayer.add(tf.layers.batchNormalization())
policyLayer.add(tf.layers.reLU())
policyLayer.add(tf.layers.flatten())
policyLayer.add(tf.layers.dense({
    units: 5 * 6 * 2, // 5 x 6 columns and 5 x 6 rows
    activation: 'softmax'
}))

const residualBlocks = new Array(40).fill(0).map(() => new ResidualBlock())



export default async function pipopipetteGo(board: Board, player: 0 | 1) {
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

    console.time("pipopipetteGo")
    console.time("conv")
    let x = convLayer.apply(tf.tensor(array, [43, 6, 6]).reshape([1, 43, 6, 6])) as tf.Tensor
    console.log(x.print())
    console.timeEnd("conv")
    console.time("residualBlocks")
    for (const residualBlock of residualBlocks) {
        x = residualBlock.apply(x)
    }
    console.timeEnd("residualBlocks")

    console.time("headLayer")
    const h = headLayer.apply(x) as tf.Tensor
    console.log(h.dataSync())
    console.timeEnd("headLayer")

    console.time("policyLayer")

    const p = policyLayer.apply(x) as tf.Tensor
    console.log(p.dataSync())
    console.timeEnd("pipopipetteGo")
    console.timeEnd("policyLayer")
}
