
type dA = rt.DenoisingAutoencoders;

window.onload = () => {
    var trainPreEl: HTMLPreElement = <HTMLPreElement>document.getElementById("trainData");
    var testPreEl: HTMLPreElement = <HTMLPreElement>document.getElementById("testData");
    var weightsPreEl: HTMLPreElement = <HTMLPreElement>document.getElementById("weightsData");
    var resultEl: HTMLPreElement = <HTMLPreElement>document.getElementById("result");
    var epochEl: HTMLInputElement = <HTMLInputElement>document.getElementById("epochInput");
    var learningEl: HTMLInputElement = <HTMLInputElement>document.getElementById("learningInput");
    var corruptedEl: HTMLInputElement = <HTMLInputElement>document.getElementById("corruptedInput");
    var trainBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("trainButton");
    var saveBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("saveButton");
    var deleteBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("deleteButton");
    var trainCountEl: HTMLSpanElement = <HTMLSpanElement>document.getElementById("trainCount");

    var trainData: rt.Matrix = new rt.Matrix([
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [1, 1, 0, 1, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0, 1, 0],
        [0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    ]);
    var testData: rt.Matrix = new rt.Matrix([
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    ]);
    trainData = new rt.Matrix(createTrainData(10, 30));
    trainPreEl.textContent = trainData.toString();
    testPreEl.textContent = testData.toString();

    var storage: rt.ModelStorage = new rt.ModelStorage("model", 2);
    var da: dA = new rt.DenoisingAutoencoders(trainData, 10, 5);
    var maxIter: number = 50000;
    var iter: number = 10000;
    var trainCount: number = 0;
    var interval: number = 100;
    trainBtn.addEventListener("click",() => {
        var timer: number = setInterval(() => {
            var epoch: number = parseInt(epochEl.value);
            var lr: number = parseFloat(learningEl.value);
            var corruptedRate: number = parseFloat(corruptedEl.value);
            iter -= epoch;
            trainCount += epoch;
            trainCountEl.textContent = trainCount.toString();
            if(iter === 0) {
                iter = maxIter;
                clearInterval(timer);
            }
            for(var i = 0; i < epoch; i++) {
                da.train(lr, corruptedRate);
            }
            var reconstructed: rt.Matrix = da.reconstruct(testData);
            resultEl.textContent = reconstructed.toString(true);
            weightsPreEl.textContent = da.weights.toString();
            //weightsPreEl.textContent += da.hbias.toString();
            //weightsPreEl.textContent += da.vbias.toString();
        }, interval);
    });
    saveBtn.addEventListener("click",() => {
        storage.add(da);
    });
    deleteBtn.addEventListener("click",() => {
        storage.delete();
    });

    function createTrainData(dim: number, num: number): number[][] {
        var data: number[][] = [];
        for(var i = 0; i < num; i++) {
            data[i] = [];
            for(var j = 0; j < dim; j++) {
                data[i][j] = Math.round(Math.random());
            }
        }
        return data;
    }

    function createElements() {
    }
};

