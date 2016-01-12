module ml {
    /**
     * Data preprocessing class
     */
    export class Preprocessing {

        // standardize data
        // todo: implement
        static scale(m: Matrix): Matrix {
            var rows: number = m.rows,
                cols: number = m.cols,
                mean: Vector = m.mean(0); // dim == cols
            
            for(var i = 0; i < rows; i++) {
                var v: Vector = m.row(i + 1);
                var sub: Vector = v.subtract(mean);
                console.log(sub.toString());
            }
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
    }
} 
