/**
 * Line Segment Detector (LSD) module
 * @author wellflat http://rest-term.com
 */

import * as funcs from './funcs';
import { Vec4, Point, CoorList, RegionPoint, Rect } from './types';

/**
 * Create a LineSegmentDetector object.
 * Specifying scale, number of subdivisions for the image,
 * should the lines be refined and other constants as follows:
 *
 * @param refine       How should the lines found be refined?
 *                      LSD_REFINE_NONE - No refinement applied.
 *                      LSD_REFINE_STD  - Standard refinement is applied. E.g. breaking arches into smaller line approximations.
 *                      LSD_REFINE_ADV  - Advanced refinement. Number of false alarms is calculated,
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
    constructor(refine = funcs.LSD_REFINE_STD, scale = 0.8, sigmaScale = 0.6, quant = 2.0, angTh = 22.5,
        logEps = 0.0, densityTh = 0.7, nBins = 1024) {
        this.scale = scale;
        this.sigmaScale = sigmaScale;
        this.quant = quant;
        this.angTh = angTh;
        this.logEps = logEps;
        this.densityTh = densityTh;
        this.nBins = nBins;
        this.doRefine = refine;
        /** @type {ImageData} */
        this.image = null;
        /** @type {Uint8ClampedArray} */
        this.scaledImageData = null;
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
 */
    detect(image) {
        /** @type {Vec4[]} */
        let lines = [],
            w = [],
            p = [],
            n = [];
        this.image = image;
        //this.scaledImageData = this.reshape(image);
        this.width = image.width;
        this.height = image.height;
        this.lsd(lines, w, p, n);
        return lines;
    }
  /**
   * @param {Vec4[]} lines        Return: A vector of Vec4f elements specifying the beginning and ending point of a line.
   *                              Where Vec4f is (x1, y1, x2, y2), point 1 is the start, point 2 - end.
   *                              Returned lines are strictly oriented depending on the gradient.
   * @param widths        Return: Vector of widths of the regions, where the lines are found. E.g. Width of line.
   * @param precisions    Return: Vector of precisions with which the lines are found.
   * @param nfas          Return: Vector containing number of false alarms in the line region, with precision of 10%.
   *                              The bigger the value, logarithmically better the detection.
   *                                  * -1 corresponds to 10 mean false alarms
   *                                  * 0 corresponds to 1 mean false alarm
   *                                  * 1 corresponds to 0.1 mean false alarms
   */
    lsd(lines, widths, precisions, nfas) {
        const prec = Math.PI * this.angTh / 180;
        const p = this.angTh / 180;
        const rho = this.quant / Math.sin(prec);
        if (this.scale != 1) {
            const sigma = this.scale < 1 ? this.sigmaScale / this.scale : this.sigmaScale;
            const sprec = 3;
            const h = Math.ceil(this.sigma * Math.sqrt(2 * sprec * Math.log(10.0)));
            const kSize = [1 + 2 * h, 1 + 2 * h];
            let reshaped = this.reshape(this.image);
            this.scaledImageData = this.gaussianBlur(reshaped, kSize, sigma);
            this.llAngle(rho, this.nBins);
        } else {
            this.scaledImageData = this.reshape(this.image);
            this.llAngle(rho, this.nBins);
        }

        let LOG_NT = 5 * (Math.log10(this.width) + Math.log10(this.height)) / 2 + Math.log10(11.0);
        let minRegSize = -LOG_NT / Math.log10(p);
        this.used = new Uint8Array(this.scaledImageData.length);
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
                let rec = new Rect();
                this.region2Rect(reg, regAngle, prec, p, rec);
                /*
                // compute heavy ...
                let logNfa = -1;
                if (this.doRefine > funcs.LSD_REFINE_NONE) {
                    if (!this.refine(reg, regAngle, prec, p, rec, this.densityTh)) {
                        continue;
                    }
                    if (this.doRefine >= funcs.LSD_REFINE_ADV) {
                        logNfa = this.rectImprove(rec);
                        if (logNfa <= this.logEps) {
                            continue;
                        }
                    }
                }
                */
                rec.x1 += 0.5;
                rec.y1 += 0.5;
                rec.x2 += 0.5;
                rec.y2 += 0.5;
                if (this.scale != 1) {
                    rec.x1 /= this.scale;
                    rec.y1 /= this.scale;
                    rec.x2 /= this.scale;
                    rec.y2 /= this.scale;
                    rec.width /= this.scale;
                }
                lines.push(new Vec4(rec.x1, rec.y1, rec.x2, rec.y2));
                
            }
        }
    }

    /**
     * Finds the angles and the gradients of the image. Generates a list of pseudo ordered points.
     *
     * @param {number} threshold The minimum value of the angle that is considered defined, otherwise NOTDEF
     * @param {number} nBins    The number of bins with which gradients are ordered by, using bucket sort.
     * @param list      Return: Vector of coordinate points that are pseudo ordered by magnitude.
     *                  Pixels would be ordered by norm value, up to a precision given by max_grad/n_bins.
     */
    llAngle(threshold, nBins) {
        let imageData = this.scaledImageData;
        let width = this.width;
        let height = this.height;
        this.angles = new Float64Array(imageData.length);
        this.modgrad = new Float64Array(imageData.length);
        this.angles = this.setRow(this.angles, height - 1, funcs.NOT_DEF);
        this.angles = this.setCol(this.angles, width - 1, funcs.NOT_DEF);
        let maxGrad = -1.0;
        for (let y = 0; y < height - 1; y++) {
            let step = y * width;
            let nextStep = (y + 1) * width;
            for (let x = 0; x < width - 1; x++) {
                let DA = imageData[x + 1 + nextStep] - imageData[x + step];
                let BC = imageData[x + 1 + step] - imageData[x + nextStep];
                let gx = DA + BC;
                let gy = DA - BC;
                let norm = Math.sqrt((gx * gx + gy * gy) / 4.0);
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
        //this.list.length = width * height;
        /** @type {CoorList[]} */
        let rangeS = [];
        rangeS.length = nBins;
        /** @type {CoorList[]} */
        let rangeE = [];
        rangeE.length = nBins;
        let count = 0;
        let binCoef = (maxGrad > 0) ? (nBins - 1) / maxGrad : 0;
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
                rangeE[i].next = 0;
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
     * @param {Rect} rec
     */
    region2Rect(reg, regAngle, prec, p, rec) {
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
        let theta = this.getTheta(reg, x, y, regAngle, prec);
        let dx = Math.cos(theta);
        let dy = Math.sin(theta);
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
        
        rec.x1 = x + lMin * dx;
        rec.y1 = y + lMin * dy;
        rec.x2 = x + lMax * dx;
        rec.y2 = y + lMax * dy;
        rec.width = wMax - wMin;
        rec.x = x;
        rec.y = y;
        rec.theta = theta;
        rec.dx = dx;
        rec.dy = dy;
        rec.prec = prec;
        rec.p = p;
        if (rec.width < 1.0) {
            rec.width = 1.0;
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
     * @param {Rect} rec
     * @param {number} densityTh
     * @return {boolean}
     */    
    refine(reg, regAngle, prec, p, rec, densityTh) {
        let density = reg.length / (funcs.dist(rec.x1, rec.y1, rec.x2, rec.y2) * rec.width);
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
            this.region2Rect(reg, regAngle, prec, p, rec);
            density = reg.length / (funcs.dist(rec.x1, rec.y1, rec.x2, rec.y2) * rec.width);
            if (density < densityTh) {
                //this.reduceRegionRadius();
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
     * @param {Rect} rec
     * @param {number} density
     * @param {number} densityTh
     * @return {boolean}
     */    
    reduceRegionRadius(reg, regAngle, prec, p, rec, density, densityTh) {
        let xc = reg[0].x;
        let yc = reg[0].y;
        let radSq1 = funcs.distSq(xc, yc, rec.x1, rec.y1);
        let radSq2 = funcs.distSq(xc, yc, rec.x2, rec.y2);
        let radSq = radSq1 > radSq2 ? radSq1 : radSq2;
        while (density > densityTh) {
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
            // re-compute rectangle
            this.region2Rect(reg, regAngle, prec, p, rec);
            // re-compute region points density
            density = reg.length / (funcs.dist(rec.x1, rec.y1, rec.x2, rec.y2) * rec.width);
        }
        return true;
    }

    /**
     * @param {Uint8ClampedArray} imageData
     * @param {number[]} kSize
     * @param {number} sigma
     * @return {Uint8ClampedArray}
     */    
    gaussianBlur(imageData, kSize, sigma) {
        let width = this.width,
            height = this.height,
            data = imageData,
            result = null;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // @todo implement
            }
        }
        result = data;
        return result;
    }
    /**
     * @param {ImageData} image
     * @return {Uint8ClampedArray}
     */
    reshape(image) {
        let data = image.data;
        let reshaped = new Uint8ClampedArray(data.length / 4);
        let len = reshaped.length;
        for (let i = 0; i < len; i++) {
            reshaped[i] = data[i * 4];
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