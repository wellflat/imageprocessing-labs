/**
 * AROW (Adaptive Regularization of Weight Vectors) class
 */

import {Feature, DataSet} from './types';

export class AROW {
    private mean: Float32Array;
    private cov: Float32Array;
    private f: number;
    private r: number;

    constructor(featureSize: number, r: number = 0.1) {
        this.f = featureSize;
        this.mean = new Float32Array(featureSize);
        this.cov = new Float32Array(featureSize);
        this.cov.fill(1.0);
        this.r = r;
    }

    public predict(x: Feature): number {
        return this.computeMargin(x) > 0 ? 1 : -1;
    }

    public clear(): void {
        this.mean = new Float32Array(this.f);
        this.cov = new Float32Array(this.f);
        this.cov.fill(1.0);
    }

    public update(x: Feature, label: number): number {
        let margin: number = this.computeMargin(x);
        let loss: number = margin * label < 0 ? 1 : 0;
        if (margin * label >= 1) {
            return 0;
        }
        let confidence: number = this.computeConfidence(x);
        let beta: number = 1.0 / (confidence + this.r);
        let alpha: number = (1.0 - label * margin) * beta;
        x.forEach(e => {
            this.mean[e.index] += alpha * label * this.cov[e.index] * e.value;
        })
        x.forEach(e => {
            this.cov[e.index] = 1.0 / ((1.0 / this.cov[e.index]) + e.value * e.value / this.r);
        });
        return loss;
    }

    private computeMargin(x: Feature): number {
        let res:number = 0.0;
        x.forEach(e => res += this.mean[e.index] * e.value);
        return res;
    }

    private computeConfidence(x: Feature): number {
        let res:number = 0.0;
        x.forEach(e => res += this.cov[e.index] * e.value * e.value);
        return res;
    }
}