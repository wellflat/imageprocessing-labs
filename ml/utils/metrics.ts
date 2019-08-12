module ml {
    /**
     * Classification metrics functions
     */
    export class Metrics {
        static accuracy(label: Matrix, pred: Matrix): number {
            var labelData: number[][] = label.elements,
                predData: number[][] = pred.elements,
                tpfp: number = 0;
            if (label.rows != pred.rows || label.cols != pred.cols) {
                throw new Error("invalid data shape");
            }
            for (var i = 0; i < label.rows; i++) {
                if (this.argmax(labelData[i]) == this.argmax(predData[i])) {
                    tpfp++;
                }
            }
            return tpfp/label.rows;
        }
        
        static precision(label: Matrix, pred: Matrix): number {
            // 2-class precision
            var labelData: number[][] = label.elements,
                predData: number[][] = pred.elements,
                tp: number = 0,
                fp: number = 0;
            if (label.rows != pred.rows || label.cols != pred.cols) {
                throw new Error("invalid data shape");
            }
            for (var i = 0; i < label.rows; i++) {
                if (this.argmax(predData[i]) == 0) {
                    if (this.argmax(labelData[i]) == 0) {
                        tp++;
                    } else {
                        fp++;
                    }
                }
                
            }
            return tp/(tp + fp);
        }
        
        static recall(label: Matrix, pred: Matrix): number {
            // 2-class recall
            var labelData: number[][] = label.elements,
                predData: number[][] = pred.elements,
                tp: number = 0,
                fn: number = 0;
            if (label.rows != pred.rows || label.cols != pred.cols) {
                throw new Error("invalid data shape");
            }
            for (var i = 0; i < label.rows; i++) {
                if (this.argmax(predData[i]) == 0) {
                    if (this.argmax(labelData[i]) == 0) {
                        tp++;
                    }
                } else {
                    if (this.argmax(labelData[i]) == 0) {
                        fn++;
                    }
                }
            }
            return tp / (tp + fn);
        }
        
        static f1score(label: Matrix, pred: Matrix): number {
            var precision: number = this.precision(label, pred),
                recall: number = this.recall(label, pred);
            return 2 * precision * recall / (precision + recall);
        }
        
        static confusionmatrix(label: Matrix, pred: Matrix): number[][] {
            // todo implement
            var cm: number[][] = [];
            return cm;
        }
        
        static argmax(arr: number[]): number {
            var max: number = -Infinity,
                index: number = void(0);
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] >= max) {
                    max = arr[i];
                    index = i;
                }
            }
            return index;
        } 
    }
}