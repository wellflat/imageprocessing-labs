/**
 * Line Segment Detector (LSD) module
 * @author https://github.com/wellflat
 */

import * as funcs from './funcs';
import { Vec4, Point, CoorList, RegionPoint, Rect, Edge } from './types';

/**
 * Create a LineSegmentDetector object.
 * Specifying scale, number of subdivisions for the image,
 * should the lines be refined and other constants as follows:
 *
 * @param refine       How should the lines found be refined?
 *                      REFINE_NONE - No refinement applied.
 *                      REFINE_STD  - Standard refinement is applied. E.g. breaking arches into smaller line approximations.
 *                      REFINE_ADV  - Advanced refinement. Number of false alarms is calculated,
 *                                    lines are refined through increase of precision, decrement in size, etc.
 * @param scale        The scale of the image that will be used to find the lines. Range (0..1].
 * @param sigmaScale   Sigma for Gaussian filter is computed as sigma = _sigma_scale/_scale.
 * @param quant        Bound to the quantization error on the gradient norm.
 * @param angTh        Gradient angle tolerance in degrees.
 * @param logEps       Detection threshold: -log10(NFA) > _log_eps
 * @param densityTh    Minimal density of aligned region points in rectangle.
 * @param nBins        Number of bins in pseudo-ordering of gradient modulus.
 */
export default class LSD {
    constructor(
        refineType = funcs.REFINE_NONE, scale = 0.8, sigmaScale = 0.6, quant = 2.0,
        angTh = 22.5, logEps = 0.0, densityTh = 0.7, nBins = 1024
    ) {
        this.refineType = refineType;
        this.scale = scale;
        this.sigmaScale = sigmaScale;
        this.quant = quant;
        this.angTh = angTh;
        this.logEps = logEps;
        this.densityTh = densityTh;
        this.nBins = nBins;
        /** @type {ImageData} */
        this.image = null;
        /** @private @type {Uint8ClampedArray} */
        this.imageData = null;
        /** @type {number} */
        this.width = 0;
        /** @type {number} */
        this.height = 0;
        /** @type {CoorList[]} */
        this.list = [];
        /** @type {Float64Array} */
        this.angles = null;
        /** @type {Float64Array} */
        this.modgrad = null;
        /** @type {Uint8Array} */
        this.used = null; 
    }
    /**
     * Detect lines in the input image.
     * @param {ImageData} image
     * @return {Vec4[]}
     */
    detect(image) {
        this.image = image;
        this.width = image.width;
        this.height = image.height;
        const lines = this.lsd();
        return lines;
    }
    /**
     * Draws the line segments on a given image.
     * @param {CanvasRenderingContext2D} context
     * @param {Vec4[]} lines
     * @param {string} color
     */
    drawSegments(context, lines, color = '#ff0000') {
        context.strokeStyle = color;
        context.lineWidth = 1;
        lines.forEach(v => {
            context.beginPath();
            context.moveTo(v.x1, v.y1);
            context.lineTo(v.x2, v.y2);
            context.stroke();
            context.closePath();
        });
    }

    /**
     * for debug
     * @param {CanvasRenderingContext2D} context 
     */    
    putImageData(context) {
        let src = this.imageData,
            image = context.createImageData(this.width, this.height),
            dst = image.data,
            len = image.data.length;
        for (let i = 0; i < len; i += 4) {
            dst[i] = dst[i + 1] = dst[i + 2] = src[i/4];
            dst[i + 3] = 255;
        }
        context.putImageData(image, 0, 0);
    }
    /**
     * @return {Vec4[]}  Return: A vector of Vec4f elements specifying the beginning and ending point of a line.
     *                   Where Vec4f is (x1, y1, x2, y2), point 1 is the start, point 2 - end.
     *                   Returned lines are strictly oriented depending on the gradient.
     */
    lsd() {
        /** @type {Vec4[]} */
        let lines = [];
        const prec = Math.PI * this.angTh / 180;
        const p = this.angTh / 180;
        const rho = this.quant / Math.sin(prec);
        if (this.scale != 1) {
            const sigma = this.scale < 1 ? this.sigmaScale / this.scale : this.sigmaScale;
            const sprec = 3;
            const h = Math.ceil(sigma * Math.sqrt(2 * sprec * Math.log(10.0)));
            const kSize = 1 + 2 * h;
            const reshaped = this.reshape(this.image);
            this.imageData = this.gaussianBlur(reshaped, kSize, sigma);
            this.computeLevelLineAngles(rho, this.nBins);
        } else {
            this.imageData = this.reshape(this.image);
            this.computeLevelLineAngles(rho, this.nBins);
        }

        const LOG_NT = 5 * (Math.log10(this.width) + Math.log10(this.height)) / 2 + Math.log10(11.0);
        const minRegSize = -LOG_NT / Math.log10(p);
        this.used = new Uint8Array(this.imageData.length);
        for (let i = 0, listSize = this.list.length; i < listSize; i++) {
            const point = this.list[i].p;
            if ((this.at(this.used, point) === funcs.NOT_USED) &&
                (this.at(this.angles, point) !== funcs.NOT_DEF)) {
                let regAngle = 0.0;
                /** @type {RegionPoint[]} */
                let reg = [];
                regAngle = this.regionGrow(this.list[i].p, reg, regAngle, prec);
                if (reg.length < minRegSize) {
                    continue;
                }
                let rect = new Rect();
                this.region2Rect(reg, regAngle, prec, p, rect);
                let logNfa = -1;
                if (this.refineType > funcs.REFINE_NONE) {
                    if (!this.refine(reg, regAngle, prec, p, rect, this.densityTh)) {
                        continue;
                    }
                    if (this.refineType >= funcs.REFINE_ADV) {
                        logNfa = this.improveRect(rect);
                        if (logNfa <= this.logEps) {
                            continue;
                        }
                    }
                }
                rect.x1 += 0.5;
                rect.y1 += 0.5;
                rect.x2 += 0.5;
                rect.y2 += 0.5;
                /*
                if (this.scale != 1) {
                    rect.x1 /= this.scale;
                    rect.y1 /= this.scale;
                    rect.x2 /= this.scale;
                    rect.y2 /= this.scale;
                    rect.width /= this.scale;
                }
                */
                lines.push(new Vec4(rect.x1, rect.y1, rect.x2, rect.y2));
            }
        }
        return lines;
    }

    /**
     * @param {number} threshold The minimum value of the angle that is considered defined, otherwise NOTDEF
     * @param {number} nBins     The number of bins with which gradients are ordered by, using bucket sort.
     */
    computeLevelLineAngles(threshold, nBins) {
        const imageData = this.imageData;
        const width = this.width;
        const height = this.height;
        this.angles = new Float64Array(imageData.length);
        this.modgrad = new Float64Array(imageData.length);
        this.angles = this.setRow(this.angles, height - 1, funcs.NOT_DEF);
        this.angles = this.setCol(this.angles, width - 1, funcs.NOT_DEF);
        let maxGrad = -1.0;
        for (let y = 0; y < height - 1; y++) {
            const step = y * width;
            const nextStep = (y + 1) * width;
            for (let x = 0; x < width - 1; x++) {
                const DA = imageData[x + 1 + nextStep] - imageData[x + step];
                const BC = imageData[x + 1 + step] - imageData[x + nextStep];
                const gx = DA + BC;
                const gy = DA - BC;
                const norm = Math.sqrt((gx * gx + gy * gy) / 4.0);
                this.modgrad[x + step] = norm;
                if (norm <= threshold) {
                    this.angles[x + step] = funcs.NOT_DEF;
                } else {
                    this.angles[x + step] = Math.atan2(gx, -gy);
                    if (norm > maxGrad) {
                        maxGrad = norm;
                    }
                }
            }
        }
        /** @type {CoorList[]} */
        let rangeS = [];
        rangeS.length = nBins;
        /** @type {CoorList[]} */
        let rangeE = [];
        rangeE.length = nBins;
        let count = 0;
        const binCoef = (maxGrad > 0) ? (nBins - 1) / maxGrad : 0;
        for (let y = 0; y < height - 1; y++) {
            let step = y * width;
            for (let x = 0; x < width - 1; x++) {
                let i = Math.floor(this.modgrad[x + step] * binCoef);
                if (!rangeE[i]) {
                    this.list[count] = new CoorList();
                    rangeE[i] = rangeS[i] = this.list[count];
                    count++;
                } else {
                    this.list[count] = new CoorList();
                    rangeE[i] = this.list[count];
                    rangeE[i].next = this.list[count];
                    count++;
                }
                rangeE[i].p = new Point(x, y);
                rangeE[i].next = null;
            }
        }
        let idx = nBins - 1;
        for (; idx > 0 && !rangeS[idx]; idx--) {
            // do nothing.
        }
        let start = rangeS[idx];
        let endIdx = idx;
        if (start) {
            while (idx > 0) {
                idx--;
                if (rangeS[idx]) {
                    rangeE[endIdx].next = rangeS[idx];
                    rangeE[endIdx] = rangeE[idx];
                    endIdx = idx;
                }
            }
        }
    }

    /**
     * @param {Point} s
     * @param {RegionPoint[]} reg
     * @param {number} regAngle
     * @param {number} prec
     */
    regionGrow(s, reg, regAngle, prec) {
        let seed = new RegionPoint();
        seed.x = s.x;
        seed.y = s.y;
        seed.used = this.at(this.used, s);
        regAngle = this.at(this.angles, s);
        seed.angle = regAngle;
        seed.modgrad = this.at(this.modgrad, s);
        seed.used = funcs.USED;
        reg.push(seed);
        let sumdx = Math.cos(regAngle);
        let sumdy = Math.sin(regAngle);

        for (let i = 0; i < reg.length; i++) {
            const rpoint = reg[i],
                xxMin = Math.max(rpoint.x - 1, 0),
                xxMax = Math.min(rpoint.x + 1, this.width - 1),
                yyMin = Math.max(rpoint.y - 1, 0),
                yyMax = Math.min(rpoint.y + 1, this.height - 1);
            for (let yy = yyMin; yy <= yyMax; yy++) {
                const step = yy * this.width;
                for (let xx = xxMin; xx <= xxMax; xx++) {
                    let isUsed = this.used[xx + step];
                    if (isUsed != funcs.USED && this.isAligned(xx, yy, regAngle, prec)) {
                        const angle = this.angles[xx + step];
                        isUsed = funcs.USED;
                        this.used[xx + step] = funcs.USED;
                        let regionPoint = new RegionPoint(
                            xx, yy, angle, this.modgrad[xx + step], isUsed
                        );
                        reg.push(regionPoint);
                        sumdx += Math.cos(angle);
                        sumdy += Math.sin(angle);
                        regAngle = Math.atan2(sumdy, sumdx);
                    }
                }
            }
        }
        return regAngle;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} theta
     * @param {number} prec
     * @return {boolean}
     */
    isAligned(x, y, theta, prec) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return false;
        }
        const a = this.angles[x + y * this.width];
        if (a === funcs.NOT_DEF) {
            return false;
        }
        let nTheta = theta - a;
        if (nTheta < 0) {
            nTheta = -nTheta;
        }
        if (nTheta > funcs.M_3_2_PI) {
            nTheta -= funcs.M_2__PI;
            if (nTheta < 0) {
                nTheta = -nTheta;
            }
        }
        return nTheta <= prec;
    }

    /**
     * @param {RegionPoint[]} reg
     * @param {number} regAngle
     * @param {number} prec
     * @param {number} p
     * @param {Rect} rect
     */
    region2Rect(reg, regAngle, prec, p, rect) {
        let x = 0, y = 0, sum = 0;
        for (let i = 0; i < reg.length; i++) {
            const pnt = reg[i];
            const weight = pnt.modgrad;
            x += pnt.x * weight;
            y += pnt.y * weight;
            sum += weight;
        }
        if (sum <= 0) {
            throw new Error('weighted sum must differ from 0');
        }
        x /= sum;
        y /= sum;
        const theta = this.getTheta(reg, x, y, regAngle, prec);
        const dx = Math.cos(theta);
        const dy = Math.sin(theta);
        let lMin = 0, lMax = 0, wMin = 0, wMax = 0;
        for (let i = 0; i < reg.length; i++) {
            let regdx = reg[i].x - x;
            let regdy = reg[i].y - y;
            let l = regdx * dx + regdy * dy;
            let w = -regdx * dy + regdy * dx;
            if (l > lMax) {
                lMax = l;
            } else if (l < lMin) {
                lMin = l;
            }
            if (w > wMax) {
                wMax = w;
            } else if (w < wMin) {
                wMin = w;
            }
        }
        rect.x1 = x + lMin * dx;
        rect.y1 = y + lMin * dy;
        rect.x2 = x + lMax * dx;
        rect.y2 = y + lMax * dy;
        rect.width = wMax - wMin;
        rect.x = x;
        rect.y = y;
        rect.theta = theta;
        rect.dx = dx;
        rect.dy = dy;
        rect.prec = prec;
        rect.p = p;
        if (rect.width < 1.0) {
            rect.width = 1.0;
        }
    }

    /**
     * @param {RegionPoint[]} reg
     * @param {number} x
     * @param {number} y
     * @param {number} regAngle
     * @param {number} prec
     * @return {number}
     */
    getTheta(reg, x, y, regAngle, prec) {
        let ixx = 0.0,
            iyy = 0.0,
            ixy = 0.0;
        for (let i = 0; i < reg.length; i++) {
            const regx = reg[i].x;
            const regy = reg[i].y;
            const weight = reg[i].modgrad;
            let dx = regx - x;
            let dy = regy - y;
            ixx += dy * dy * weight;
            iyy += dx * dx * weight;
            ixy -= dx * dy * weight;
        }
        let check = (funcs.doubleEqual(ixx, 0) && funcs.doubleEqual(iyy, 0) && funcs.doubleEqual(ixy, 0));
        if (check) {
            throw new Error('check if inertia matrix is null');
        }
        let lambda = 0.5 * (ixx + iyy - Math.sqrt((ixx - iyy) * (ixx - iyy) + 4.0 * ixy * ixy));
        let theta = (Math.abs(ixx) > Math.abs(iyy)) ? Math.atan2(lambda - ixx, ixy) :
            Math.atan2(ixy, lambda - iyy);
        if (funcs.angleDiff(theta, regAngle) > prec) {
            theta += Math.PI;
        }
        return theta;
    }

    /**
     * @param {RegionPoint[]} reg
     * @param {number} regAngle
     * @param {number} prec
     * @param {number} p
     * @param {Rect} rect
     * @param {number} densityTh
     * @return {boolean}
     */    
    refine(reg, regAngle, prec, p, rect, densityTh) {
        let density = reg.length / (funcs.dist(rect.x1, rect.y1, rect.x2, rect.y2) * rect.width);
        if (density >= densityTh) {
            return true;
        }
        let xc = reg[0].x;
        let yc = reg[0].y;
        const angC = reg[0].angle;
        let sum = 0, sSum = 0, n = 0;
        for (let i = 0; i < reg.length; i++) {
            reg[i].used = funcs.NOT_USED;
            if (funcs.dist(xc, yc, reg[i].x, reg[i].y) < reg.width) {
                const angle = reg[i].angle;
                let angD = funcs.angleDiff(angle, angC);
                sum += angD;
                sSum += angD * angD;
                n++;
            }
            let meanAngle = sum / n;
            let tau = 2.0 * Math.sqrt((sSum - 2.0 * meanAngle * sum) / n + meanAngle * meanAngle);
            this.regionGrow(new Point(reg[0].x, reg[0].y), reg, regAngle, tau);
            if (reg.length < 2) {
                return false;
            }
            this.region2Rect(reg, regAngle, prec, p, rect);
            density = reg.length / (funcs.dist(rect.x1, rect.y1, rect.x2, rect.y2) * rect.width);
            if (density < densityTh) {
                return this.reduceRegionRadius(reg, regAngle, prec, p, rect, density, densityTh);
            } else {
                return true;
            }
        }
    }

    /**
     * @param {RegionPoint[]} reg
     * @param {number} regAngle
     * @param {number} prec
     * @param {number} p
     * @param {Rect} rect
     * @param {number} density
     * @param {number} densityTh
     * @return {boolean}
     */    
    reduceRegionRadius(reg, regAngle, prec, p, rect, density, densityTh) {
        let xc = reg[0].x;
        let yc = reg[0].y;
        let radSq1 = funcs.distSq(xc, yc, rect.x1, rect.y1);
        let radSq2 = funcs.distSq(xc, yc, rect.x2, rect.y2);
        let radSq = radSq1 > radSq2 ? radSq1 : radSq2;
        while (density < densityTh) {
            radSq *= 0.75 * 0.75; // reduce region's radius to 75%
            for (let i = 0; i < reg.length; i++) {
                if (funcs.distSq(xc, yc, reg[i].x, reg[i].y) > radSq) {
                    // remove point from the region
                    reg[i].used = funcs.NOT_USED;
                    const tmp = reg[i];
                    reg[i] = reg[reg.length - 1];
                    reg[reg.length - 1] = tmp;
                    reg.pop();
                    --i;
                }
            }
            if (reg.length < 2) {
                return false;
            }
            this.region2Rect(reg, regAngle, prec, p, rect);
            density = reg.length / (funcs.dist(rect.x1, rect.y1, rect.x2, rect.y2) * rect.width);
        }
        return true;
    }

    /**
     * @param {Rect} rect
     * @return {number}
     */    
    improveRect(rect) {
        let delta = 0.5;
        let delta2 = delta / 2.0;
        let logNfa = this.rectNfa(rect);
        if (logNfa > this.logEps) {
            return logNfa;
        }
        let r = new Rect();
        r.copy(rect);
        for (let n = 0; n < 5; n++) {
            r.p /= 2;
            r.prec = r.p * Math.PI;
            let logNfaNew = this.rectNfa(rect);
            if (logNfaNew > logNfa) {
                logNfa = logNfaNew;
                rect.copy(r);
            }
        }
        if (logNfa > this.logEps) {
            return logNfa;
        }
        r.copy(rect);
        for (let n = 0; n < 5; n++) {
            if ((r.width - delta) >= 0.5) {
                r.width -= delta;
                let logNfaNew = this.rectNfa(r);
                if (logNfaNew > logNfa) {
                    rect.copy(r);
                    logNfa = logNfaNew;
                }
            }
        }
        if (logNfa > this.logEps) {
            return logNfa;
        }
        r.copy(rect);
        for (let n = 0; n < 5; n++) {
            if ((r.width - delta) >= 0.5) {
                r.x1 -= -r.dy * delta2;
                r.y1 -= r.dx * delta2;
                r.x2 -= -r.dy * delta2;
                r.y2 -= r.dx * delta2;
                r.width -= delta;
                let logNfaNew = this.rectNfa(r);
                if (logNfaNew > logNfa) {
                    rect.copy(r);
                    logNfa = logNfaNew;
                }
            }
        }
        if (logNfa > this.logEps) {
            return logNfa;
        }
        r.copy(rect);
        for (let n = 0; n < 5; n++) {
            if ((r.width - delta) >= 0.5) {
                r.p /= 2;
                r.prec = r.p * Math.PI;
                let logNfaNew = this.rectNfa(r);
                if (logNfaNew > logNfa) {
                    rect.copy(r);
                    logNfa = logNfaNew;
                }
            }
        }
        return logNfa;
    }

    /**
     * @param {Rect} rect
     * @return {number}
     */    
    rectNfa(rect) {
        let totalPts = 0,
            algPts = 0,
            halfWidth = rect.width / 2.0,
            dyhw = rect.dy * halfWidth,
            dxhw = rect.dx * halfWidth,
            orderedX = [
                new Edge(),
                new Edge(),
                new Edge(),
                new Edge()
            ],
            minY = orderedX[0],
            maxY = orderedX[0];
        orderedX[0].p.x = rect.x1 - dyhw;
        orderedX[0].p.y = rect.y1 + dxhw;
        orderedX[1].p.x = rect.x2 - dyhw;
        orderedX[1].p.y = rect.y2 + dxhw;
        orderedX[2].p.x = rect.x2 + dyhw;
        orderedX[2].p.y = rect.y2 - dxhw;
        orderedX[3].p.x = rect.x1 + dyhw;
        orderedX[3].p.y = rect.y1 - dxhw;

        orderedX.sort(funcs.AsmallerB_XoverY);
        
        for (let i = 1; i < 4; i++) {
            if (minY.p.y > orderedX[i].p.y) {
                minY = orderedX[i];
            }
            if (maxY.p.y < orderedX[i].p.y) {
                maxY = orderedX[i];
            }
        }
        minY.taken = true;
        let leftmost = null;
        for (let i = 0; i < 4; i++) {
            if (!orderedX[i].taken) {
                if (!leftmost) {
                    leftmost = orderedX[i];
                } else if (leftmost.p.x > orderedX[i].p.x) {
                    leftmost = orderedX[i];
                }
            }
        }
        leftmost.taken = true;
        let rightmost = null;
        for (let i = 0; i < 4; i++) {
            if (!orderedX[i].taken) {
                if (!rightmost) {
                    rightmost = orderedX[i];
                } else if (rightmost.p.x < orderedX[i].p.x) {
                    rightmost = orderedX[i];
                }
            }
        }
        rightmost.taken = true;
        let tailp = null;
        for (let i = 0; i < 4; i++) {
            if (!orderedX[i].taken) {
                if (!tailp) {
                    tailp = orderedX[i];
                } else if (tailp.p.x > orderedX[i].p.x) {
                    tailp = orderedX[i];
                }
            }
        }
        tailp.taken = true;
        let flstep = (minY.p.y != leftmost.p.y) ?
            (minY.p.x + leftmost.p.x) / (minY.p.y - leftmost.p.y) : 0;
        let slstep = (leftmost.p.y != tailp.p.x) ?
            (leftmost.p.x = tailp.p.x) / (leftmost.p.y - tailp.p.x) : 0;
        let frstep = (minY.p.y != rightmost.p.y) ?
            (minY.p.x - rightmost.p.x) / (minY.p.y - rightmost.p.y) : 0;
        let srstep = (rightmost.p.y != tailp.p.x) ?
            (rightmost.p.x - tailp.p.x) / (rightmost.p.y - tailp.p.x) : 0;
        let lstep = flstep, rstep = frstep;
        let leftX = minY.p.x, rightX = minY.p.x;
        let minIter = minY.p.y;
        let maxIter = maxY.p.y;
        for (let y = minIter; y <= maxIter; y++) {
            if (y < 0 || y >= this.height) {
                continue;
            }
            for (let x = leftX; x <= rightX; x++) {
                if (x < 0 || x >= this.width) {
                    continue;
                }
                totalPts++;
                if (this.isAligned(x, y, rect.theta, rect.prec)) {
                    algPts++;
                }
            }
            if (y >= leftmost.p.y) {
                lstep = slstep;
            }
            if (y >= rightmost.p.y) {
                rstep = srstep;
            }
            leftX += lstep;
            rightX += rstep;
        }
        return this.nfa(totalPts, algPts, rect.p);
    }

    /**
     * @param {number} n
     * @param {number} k
     * @param {number} p
     */    
    nfa(n, k, p) {
        const LOG_NT = 5 * (Math.log10(this.width) + Math.log10(this.height)) / 2 + Math.log10(11.0);
        if (n == 0 || k == 0) {
            return -LOG_NT;
        }
        if (n == k) {
            return -LOG_NT - n * Math.log10(p);
        }
        let pTerm = p / (1 - p);
        let log1Term = (n + 1) - funcs.logGamma(k + 1)
            - funcs.logGamma(n - k + 1)
            + k * Math.log(p) + (n - k) * Math.log(1.0 - p);
        let term = Math.exp(log1Term);
        if (funcs.doubleEqual(term, 0)) {
            if (k > n * p) {
                return -log1Term / funcs.M_LN10 - LOG_NT;
            } else {
                return -LOG_NT;
            }
        }
        let binTail = term;
        let tolerance = 0.1;
        for (let i = k + 1; i <= n; i++) {
            let binTerm = (n - i + 1) / i;
            let multTerm = binTerm * pTerm;
            term *= multTerm;
            binTail += term;
            if (binTerm < 1) {
                let err = term * ((1 - Math.pow(multTerm, (n - i + 1))) / (1 - multTerm) - 1);
                if (err < tolerance * Math.abs(-Math.log10(binTail) - LOG_NT) * binTail) {
                    break;
                }
            }
        }
        return -Math.log10(binTail) - LOG_NT;
    }

    /**
     * @param {Uint8ClampedArray} imageData
     * @param {number} kSize
     * @param {number} sigma
     * @return {Uint8ClampedArray}
     */    
    gaussianBlur(imageData, kSize, sigma) {
        let width = this.width,
            height = this.height,
            src = imageData,
            ctx = document.createElement('canvas').getContext('2d'),
            tmp = ctx.createImageData(width, height),
            dst = null,
            kernel = this.getGaussianKernel(kSize, sigma),
            r = (kSize - 1) / 2;
        tmp = this.reshape(tmp);
        dst = new Uint8ClampedArray(tmp.length);
        // separate 2d-filter
        for (let y = 0; y < height; y++) {
            let step = y * width;
            for (let x = 0; x < width; x++) {
                let buff = 0;
                let i = x + step;
                let k = 0;
                for (let kx = -r; kx <= r; kx++) {
                    let px = x + kx;
                    if (px <= 0 || width <= px) {
                        px = x;
                    }
                    let j = px + step;
                    buff += src[j] * kernel[k];
                    k++;
                }
                tmp[i] = buff;
            }
        }
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let step = y * width;
                let buff = 0;
                let i = x + step;
                let k = 0;
                for (let ky = -r; ky <= r; ky++) {
                    let py = y + ky;
                    let kStep = ky * width;
                    if (py <= 0 || height <= py) {
                        py = y;
                        kStep = 0;
                    }
                    let j = i + kStep;
                    buff += tmp[j] * kernel[k];
                    k++;
                }
                dst[i] = buff;
            }
        }
        return dst;
    }

    /**
     * @param {number} kSize
     * @param {number} sigma
     * @return {number[]}
     */
    getGaussianKernel(kSize, sigma) {
        // 1d-kernel
        let kernel = [];
        let sigmaX = sigma > 0 ? sigma : ((kSize - 1) * 0.5 - 1) * 0.3 + 0.8;
        let scale2X = -0.5 / (sigmaX * sigmaX);
        let sum = 0.0;
        for (let i = 0; i < kSize; i++) {
            let x = i - (kSize - 1) * 0.5;
            kernel[i] = Math.exp(scale2X * x * x);
            sum += kernel[i];
        }
        sum = 1. / sum;
        for (let i = 0; i < kSize; i++) {
            kernel[i] *= sum;
        }
        return kernel;
    }
    /**
     * @param {ImageData} image
     * @return {Uint8ClampedArray}
     */
    reshape(image) {
        let src = image.data;
        let reshaped = new Uint8ClampedArray(src.length / 4);
        let len = reshaped.length;
        for (let i = 0; i < len; i++) {
            reshaped[i] = src[i * 4];
        }
        return reshaped;
    }

    /**
     * @param {Uint8Array|Float64Array} data
     * @param {Point} p 
     */
    at(data, p) {
        return data[p.x + (p.y * this.width)];
    }

    /**
     * @param {Float64Array} data
     * @param {number} rowIndex
     */
    row(data, rowIndex) {
        let i = rowIndex * this.width; 
        return data.subarray(i, i + this.width);
    }

    /**
     * @param {Float64Array} data
     * @param {number} index
     * @param {number} value
     * @return {null}
     */
    setRow(data, index, value) {
        let from = index * this.width;
        let to = from + this.width;
        for (let i = from; i < to; i++) {
            data[i] = value;
        }
        return data;
    }

    /**
     * @param {Float64Array} data
     * @param {number} index
     * @param {number} value
     * @return {null}
     */
    setCol(data, index, value) {
        let to = this.height * this.width;
        let step = this.width;
        for (let i = index; i < to; i += step) {
            data[i] = value;
        }
        return data;
    }
}