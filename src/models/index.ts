import * as model_3x3_16_5_1 from './3x3_16_5_1.json';
//@ts-ignore
import * as weights_3x3_16_5_1 from './3x3_16_5_1.weights';

import * as model_3x3_16_5_2 from './3x3_16_5_2.json';
//@ts-ignore
import * as weights_3x3_16_5_2 from './3x3_16_5_2.weights';

import * as model_3x3_16_5_3 from './3x3_16_5_3.json';
//@ts-ignore
import * as weights_3x3_16_5_3 from './3x3_16_5_3.weights';

export const models: Map<number, Map<string, { model: object, weights: string }>> = new Map()

models.set(3, new Map([
    ["3x3_16_5_1", { model: model_3x3_16_5_1, weights: weights_3x3_16_5_1 }],
    ["3x3_16_5_2", { model: model_3x3_16_5_2, weights: weights_3x3_16_5_2 }],
    ["3x3_16_5_3", { model: model_3x3_16_5_3, weights: weights_3x3_16_5_3 }],
]))