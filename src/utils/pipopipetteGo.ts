
import * as tf from "@tensorflow/tfjs"
import { Board } from "./game"


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



class ResidualBlock extends tf.layers.Layer {
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
    inputShape: [6, 6, 17],
    kernelSize: 3,
    filters: 256,
    activation: 'relu'
}))
convLayer.add(tf.layers.batchNormalization())
convLayer.add(tf.layers.reLU())

const headLayer = tf.sequential()
headLayer.add(tf.layers.conv2d({
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

export default function pipopipetteGo(board: Board, player: 0 | 1) {
    // TODO: Implement pipopipetteGo
    // const array = [
    //     ...
    //     new Array(6).fill(player)
    // ];

    // const input = tf.tensor(array, [6, 6, 1])
    // const residualBlock = new ResidualBlock()
    // const x = residualBlock.apply(input)
    // const conv = convLayer.apply(x)
    // const head = headLayer.apply(conv)
    // const policy = policyLayer.apply(conv)

    // return {
    //     head,
    //     policy
    // }
}
