/// <reference path="typings/angularjs/angular.d.ts" />

module DemoApp {
    type dA = ml.DenoisingAutoencoders;

    export interface Scope extends ng.IScope {
        trainData: ml.Matrix;
        testData: ml.Matrix;
        reconstructed: ml.Matrix;
        epoch: number;
        trainCount: number;
        learningRate: number;
        corruptedRate: number;
        errorRate: number;
        cost: number;
        running: boolean;
        canvas: HTMLCanvasElement;
        info: string;
        buttonText: string;
        train: Function;
        loadModel: Function;
        saveModel: Function;
        deleteModel: Function;
    }

    export class Controller {
        private dataDim: number;
        private dataNum: number;
        private nVisible: number;
        private nHidden: number;
        private maxIter: number;
        private testInterval: number;
        private net: dA;
        private storage: ml.ModelStorage;
        private ctx: CanvasRenderingContext2D;
        private nx: number;

        constructor(private $scope: Scope,
            private $interval: ng.IIntervalService,
            private $document: ng.IDocumentService) {

            this.dataDim = 10;
            this.dataNum = 64;
            this.nVisible = this.dataDim;
            this.nHidden = 3;
            this.maxIter = 1000;
            this.testInterval = 10;
            $scope.epoch = 1;
            $scope.trainCount = 0;
            $scope.learningRate = 0.001;
            $scope.corruptedRate = 0.3;
            $scope.errorRate = 0.0;
            $scope.cost = 0;
            $scope.trainData = ml.Matrix.rand(this.dataNum, this.dataDim, true);
            $scope.testData = ml.Matrix.rand(this.dataNum / 4, this.dataDim, true);
            $scope.reconstructed = null;
            $scope.running = false;
            $scope.canvas = <HTMLCanvasElement>$document.find('canvas')[0];
            $scope.info = '_';
            $scope.buttonText = 'train';
            this.net = new ml.DenoisingAutoencoders($scope.trainData, this.nVisible, this.nHidden);
            $scope.reconstructed = this.net.reconstruct($scope.testData);
            this.storage = new ml.ModelStorage('da', 1);
            this.ctx = this.createContext();
            this.nx = 0;
            $scope.train = angular.bind(this, this.train);
            $scope.loadModel = angular.bind(this, this.loadModel);
            $scope.saveModel = angular.bind(this, this.saveModel);
            $scope.deleteModel = angular.bind(this, this.deleteModel);
        }

        public train(): void {
            this.$scope.running = !this.$scope.running;
            if(this.$scope.running) {
                this.$scope.buttonText = 'stop';
            }
            var iter: number = this.maxIter;
            var timer = this.$interval(() => {
                iter -= this.$scope.epoch;
                this.$scope.trainCount
                this.$scope.trainCount += this.$scope.epoch;

                if(iter === 0 || !this.$scope.running) {
                    this.$scope.running = false;
                    iter = this.maxIter;
                    this.$interval.cancel(timer);
                    this.$scope.buttonText = 'train';
                }

                for(var i = 0; i < this.$scope.epoch; i++) {
                    this.net.train(this.$scope.learningRate, this.$scope.corruptedRate);
                }

                if(this.$scope.trainCount % this.testInterval == 0) {
                    this.$scope.reconstructed = this.net.reconstruct(this.$scope.testData);
                    var error: number = 0.0;
                    var subtracted: ml.Matrix = this.$scope.testData.subtract(this.$scope.reconstructed);
                    var filter: ml.Matrix = subtracted.map((x: number): boolean => {
                        var isTrue: boolean = Math.abs(x) < 0.5;
                        if(!isTrue) {
                            error++;
                        }
                        return isTrue;
                    })
                    this.$scope.errorRate = error / (this.dataDim * this.dataNum) * 100;
                    this.$scope.cost = this.net.getCost(this.$scope.corruptedRate);
                    this.drawGraph();
                }
            }, this.testInterval);
        }

        public loadModel(): void {
            this.storage.load((value: any) => {
                if(!value) {
                    this.$scope.info = 'model load failed.';
                } else {
                    var date: Date = null;
                    [this.net, date] = this.net.convertModel(value);
                    this.$scope.info = 'model load complete: (' + date.toString() + ')';
                }
                this.$scope.$apply();
            });
        }

        public saveModel(): void {
            this.storage.add(this.net, () => {
                this.$scope.info = 'model save complete';
                this.$scope.$apply();
            });
        }

        public deleteModel(): void {
            this.storage.delete(() => {
                this.$scope.info = 'model delete complete';
                this.$scope.$apply();
            });
        }

        private createContext(): CanvasRenderingContext2D {
            var ctx = <CanvasRenderingContext2D>this.$scope.canvas.getContext('2d');
            ctx.fillStyle = 'rgb(220, 220, 220)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, ctx.canvas.height);
            ctx.closePath();
            return ctx;
        }

        private drawGraph(): void {
            var width: number = this.ctx.canvas.width,
                height: number = this.ctx.canvas.height;
            var pp: number = height / 20; // 1% / pixel
            if(this.nx > width) {
                this.ctx.fillRect(0, 0, width, height);
                this.ctx.moveTo(0, height);
                this.nx = 0;
            }
            this.ctx.lineTo(this.nx, height - pp * this.$scope.errorRate);
            this.nx += 2;
            this.ctx.stroke();
            console.log(pp, this.nx);
        }
    }

    angular.module('Demo').controller('Controller',
        ['$scope', '$interval', '$document', DemoApp.Controller]);
}