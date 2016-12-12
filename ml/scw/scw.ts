/**
 * SCW (Soft Confidence Weighted Learning) class
 */
export class SCW {
    public static SCW_I = 'scw_i';
    public static SCW_II = 'scw_ii';
    private n: number;
    private eta: number;
    private C: number;
    private phi: number;
    private mu: Float32Array;
    private sigma: Float32Array[];
    private type: string;

    constructor(n: number, eta:number, C:number, type: string = SCW.SCW_I) {
        this.n = n;
        this.eta = eta;
        this.C = C;
        this.mu = new Float32Array(n).fill(0.0);
        this.sigma = [];
        for (let i = 0; i < n; i++) {
            this.sigma[i] = new Float32Array(n).fill(0.0);
        }
        this.phi = this.normcdf(eta);
        for (let i = 0; i < n; i++) {
            this.sigma[i][i] = 1.0;
        }
        this.type = type;
    }

    public predict(x: Float32Array): number {
        return this.dot(x, this.mu) < 0.0 ? -1 : 1;
    }

    public update(x: Float32Array, y: number, verbose: boolean = false) {
        let loss: number = this.loss(x, y);
        if (verbose) {
            console.log('loss: ' + loss.toString());
        }
        if (loss > 0.0) {
            let n: number = this.n;
            let vt: number = this.updateConfidence(x);
            let alpha: number = this.calculateAlpha(x, y, vt);
            let beta: number = this.calculateBeta(alpha, vt);
            this.updateWeights(alpha, x, y);
            this.updateCovariance(beta, x);
        }
    }

    public loss(x: Float32Array, y: number): number {
        return this.phi * Math.sqrt(this.updateConfidence(x)) - y * this.dot(x, this.mu);
    }

    private calculateAlpha(x: Float32Array, y: number, vt: number): number {
        let nt: number = vt + 1.0 / (2.0 * this.C);
        let mt: number = y * this.dot(x, this.mu);
        let phi: number = this.phi;
        let alpha: number = 0.0;
        let tmp: number = 0.0;
        switch (this.type) {
            case SCW.SCW_I:
                let zeta: number = phi * phi;
                let psi: number = 1.0 + (phi * phi) / 2.0;
                tmp = (-mt * psi + Math.sqrt(mt * mt * phi * phi * phi * phi / 4.0 + vt * phi * phi * zeta)) / (vt * zeta);
                let max: number = tmp > 0.0 ? tmp : 0.0;
                alpha = max > this.C ? this.C : max; 
                break;
            case SCW.SCW_II:
                let gamma: number = phi * Math.sqrt(phi * phi * mt * mt * vt * vt + 4.0 * nt * vt * (nt + vt * phi * phi));
                tmp = (-(2.0 * mt * nt + phi * phi * mt * vt) + gamma) /
                    (2.0 * (nt * nt + nt * vt * phi * phi));
                alpha = tmp > 0.0 ? tmp : 0.0;
                break;
        }
        return alpha;
    } 

    private calculateBeta(alpha: number, vt: number): number {
        let phi: number = this.phi;
        let tmp: number = -alpha * vt * phi +
            Math.sqrt(alpha * alpha * vt * vt * phi * phi + 4.0 * vt);
        let ut: number = tmp * tmp / 4.0;
        let beta: number = alpha * phi / (Math.sqrt(ut) + vt * alpha * phi);
        return beta;
    }

    private updateConfidence(x: Float32Array): number { // vt
        let sigma: Float32Array[] = this.sigma;
        let n: number = this.n;
        let tmp: Float32Array = new Float32Array(n).fill(0.0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++){
                tmp[i] += sigma[i][j] * x[j];
            }
        }
        return this.dot(x, tmp);
    }

    private updateWeights(alpha: number, x: Float32Array, y: number): void {
        let n: number = this.n;
        let sigma: Float32Array[] = this.sigma;
        let sigx: Float32Array = new Float32Array(n).fill(0.0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sigx[i] += sigma[i][j] * x[j];
            }
        }
        for (let k = 0; k < n; k++) {
            this.mu[k] += alpha * y * sigx[k];
        }
    }

    private updateCovariance(beta: number, x: Float32Array): void {
        let n: number = this.n;
        let xtx: Float32Array[] = [];
        for (let a = 0; a < n; a++) {
            xtx[a] = new Float32Array(n).fill(0.0);
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                xtx[i][j] = x[i] * x[j];
            }
        }
        let m: Float32Array[] = this.prod(this.sigma, this.prod(xtx, this.sigma));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                this.sigma[i][j] -= beta * m[i][j];
            }
        }
    }

    private normcdf(x: number): number {
        let z: number = x / Math.sqrt(2.0);
        let ret: number = 0.0;
        let N: number = 60;
        for (let n = 0; n <= N; n++) {
            let tmp: number = 1.0;
            for (let k = 1; k <= n; k++) {
                tmp *= -1.0 * z * z / k;
            }
            ret += z / (2.0 * n + 1.0) * tmp;
        }
        return 1.0 / (0.5 * (1.0 + (2.0 / Math.sqrt(Math.PI) * ret)));
    }


    private dot(x: Float32Array, y: Float32Array): number {
        let ret: number = 0.0;
        let n: number = this.n;
        for (let i = 0; i < n; i++) {
            ret += x[i] * y[i];
        }
        return ret;
    }

    private prod(m1: Float32Array[], m2: Float32Array[]): Float32Array[] {
        let ret: Float32Array[] = [];
        let n: number = this.n;
        for (let a = 0; a < n; a++) {
            ret[a] = new Float32Array(n).fill(0.0);
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    ret[i][j] += m1[i][k] * m2[k][j];
                }
            }
        }
        return ret;
    }
}