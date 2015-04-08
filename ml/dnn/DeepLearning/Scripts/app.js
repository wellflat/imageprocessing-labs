define(["require", "exports", "dnn"], function (require, exports, dnn) {
    window.onload = function () {
        var trainPreEl = document.getElementById("trainData");
        var testPreEl = document.getElementById("testData");
        var weightsPreEl = document.getElementById("weightsData");
        var resultEl = document.getElementById("result");
        var epochEl = document.getElementById("epochInput");
        var corruptedEl = document.getElementById("corruptedInput");
        var trainBtn = document.getElementById("trainButton");
        var trainData = new dnn.Matrix([
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
            [1, 1, 0, 1, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
            [1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
        ]);
        var testData = new dnn.Matrix([
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
            [1, 1, 0, 1, 1, 0, 0, 0, 1, 0],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        ]);
        trainPreEl.textContent = trainData.toString();
        testPreEl.textContent = testData.toString();
        var da = new dnn.DenoisingAutoencoders(trainData, 10, 5);
        trainBtn.addEventListener("click", function () {
            var epoch = parseInt(epochEl.value);
            var corruptedRate = parseFloat(corruptedEl.value);
            for (var i = 0; i < epoch; i++) {
                da.train(0.001, corruptedRate);
            }
            var ret = da.reconstruct(testData);
            resultEl.textContent = ret.toString(true);
            weightsPreEl.textContent = da.weights.toString();
            weightsPreEl.textContent += da.hbias.toString();
            weightsPreEl.textContent += da.vbias.toString();
        });
        /*
        var v: dnn.Vector = new dnn.Vector([1, 2, 3, 4, 5]);
        el.textContent = v.toString();
    
        var d1:number[][] = [
            [1, 2],
            [0, -1],
            [5, 1],
        ];
        var d2: number[][] = [
            [1, -2, 4, 0],
            [0, -1, 2, 3],
            
        ];
        var d3: number[][] = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];
        var d4: number[][] = [
            [3, 2, 1],
            [6, 5, 4],
            [9, 8, 7],
        ];
        
        var m1: dnn.Matrix = new dnn.Matrix(d1);
        var m2: dnn.Matrix = new dnn.Matrix(d2);
        var m3: dnn.Matrix = new dnn.Matrix(d3);
        var m4: dnn.Matrix = new dnn.Matrix(d4);
        console.log(m3.add(m4).toString());
        console.log(m3.subtract(m4).toString());
        //console.log(m1.multiply(m2).toString());
        */
    };
});
//# sourceMappingURL=app.js.map