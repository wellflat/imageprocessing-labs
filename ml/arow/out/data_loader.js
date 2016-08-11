"use strict";
var fs = require('fs');
var readline = require('readline');
var DataLoader = (function () {
    function DataLoader(filePath) {
        this.filePath = filePath;
        this.buffer = fs.readFileSync(this.filePath);
        this.dataSet = [];
        this.parse();
    }
    Object.defineProperty(DataLoader.prototype, "data", {
        get: function () {
            return this.dataSet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataLoader.prototype, "size", {
        get: function () {
            return this.dataNum;
        },
        enumerable: true,
        configurable: true
    });
    DataLoader.prototype.parse = function () {
        var _this = this;
        var lines = this.buffer.toString().split('\n');
        this.dataNum = lines.length - 1;
        lines.forEach(function (line) {
            var fields = line.split(/[\s:]/);
            var label = fields[0].charAt(0) == '+' ? +1 : -1;
            var x = [];
            var len = fields.length;
            for (var i = 1; i < len; i += 2) {
                var index = parseInt(fields[i]) - 1;
                var value = parseFloat(fields[i + 1]);
                var element = { index: index, value: value };
                x.push(element);
            }
            _this.dataSet.push({ label: label, x: x });
        });
    };
    DataLoader.read = function (filePath, callback, complete) {
        if (complete === void 0) { complete = null; }
        var options = { encoding: 'utf8', highWaterMark: 256 };
        var stream = fs.createReadStream(filePath, options);
        var rl = readline.createInterface(stream, null);
        rl.on('line', function (line) {
            var fields = line.split(/[\s:]/);
            var label = fields[0].charAt(0) == '+' ? +1 : -1;
            var x = [];
            var len = fields.length;
            for (var i = 1; i < len; i += 2) {
                var index = parseInt(fields[i]) - 1;
                var value = parseFloat(fields[i + 1]);
                var element = { index: index, value: value };
                x.push(element);
            }
            callback(x, label);
        });
        rl.on('close', function () {
            if (complete instanceof Function) {
                complete();
            }
        });
    };
    return DataLoader;
}());
exports.DataLoader = DataLoader;
//# sourceMappingURL=data_loader.js.map