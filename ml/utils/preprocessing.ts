module ml {
    /**
     * Data preprocessing class
     */
    export class Preprocessing {

        // standardize data
        static scale(data: number[][]): Matrix {
            var rows: number = data.length,
                cols: number = data[0].length,
                mean: number[] = []; // dim == cols
            /*
            for(var i = 0; i < rows; i++) {
                var v: Vector = m.row(i + 1);
                var sub: Vector = v.subtract(mean);
                console.log(sub.toString());
            }*/
            return new ml.Matrix([[]]);
        }
        
        // binalize labels in a one-vs-all fashion
        static binalizeLabel(labels: number[]): number[][] {
            var max: number = Math.max.apply(null, labels),
                len: number = labels.length,
                data: number[][] = [];
            for(var i = 0; i < len; i++) {
                var label = [];
                for(var j = 0; j <= max; j++) {
                    labels[i] == j ? label[j] = 1 : label[j] = 0;
                }
                data[i] = label;
            }
            return data;
        }
        
        // split metrices into random train and test subsets
        static splitData(data: [number[][], number[]],
            trainSize: number = 0.75, testSize: number = 0.25):
            [[number[][], number[]], [number[][], number[]]] {
            var eps: number = 2.2204460492503130808472633361816E-16;
            if(1.0 - trainSize + testSize > eps) {
                throw new Error("invalid arguments: trainSize or testSize");
            }
            var trainData: number[][] = [],
                trainLabel: number[] = [],
                testData: number[][] = [],
                testLabel: number[] = [],
                n: number = data[1].length;
            if (data[0].length != n) {
                console.log(data[0].length, n);
                throw new Error("invalid data shape");
            }
            // todo: implement
            return [[trainData, trainLabel], [testData, testLabel]];
        }
    }
} 