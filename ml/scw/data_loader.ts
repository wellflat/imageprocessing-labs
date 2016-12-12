/**
 * Data loader for LIBSVM data format
 * <label> <index1>:<value1> <index2>:<value2> ... \n
 */

import * as fs from 'fs';
import * as readline from 'readline';
import {Feature, DataSet} from './types';

export class DataLoader {
    private buffer: Buffer;
    private dataSet: DataSet;
    private filePath: string;
    private dataNum: number;

    get data(): DataSet {
        return this.dataSet;
    }
    get size(): number {
        return this.dataNum;
    }

    constructor(filePath: string, featureSize: number = 0) {
        this.filePath = filePath;
        this.buffer = fs.readFileSync(this.filePath);
        this.dataSet = [];
        if (featureSize > 0) {
            this.parsePaddingZero(featureSize);
        } else {
            this.parse();
        }
    }

    private parse(): void {
        let lines: string[] = this.buffer.toString().split('\n');
        this.dataNum = lines.length - 1;
        lines.forEach(line => {
            const fields: string[] = line.split(/[\s:]/);
            const label: number = fields[0].charAt(0) == '+' ? +1 : -1;
            const x: Feature = [];
            const len: number = fields.length;
            for (let i = 1; i < len; i += 2) {
                let index: number = parseInt(fields[i]) - 1;
                let value: number = parseFloat(fields[i + 1]);
                let element = { index, value };
                x.push(element);
            }
            this.dataSet.push({ label, x });
        });
    }

    private parsePaddingZero(featureSize: number): void {
        let lines: string[] = this.buffer.toString().split('\n');
        this.dataNum = lines.length - 1;
        lines.forEach(line => {
            const fields: string[] = line.split(/[\s:]/);
            const label: number = fields[0].charAt(0) == '+' ? +1 : -1;
            const x: Float32Array = new Float32Array(featureSize).fill(0.0);
            const len: number = fields.length;
            for (let i = 1; i < len; i += 2) {
                let index: number = parseInt(fields[i]) - 1;
                let value: number = parseFloat(fields[i + 1]);
                x[index] = value;
            }
            this.dataSet.push({ label, x });
        });
    }
    public static read(filePath: string, featureSize:number, callback: Function, complete: Function = null): void {
        const options: Object = { encoding: 'utf8', highWaterMark: 256 };
        const stream: fs.ReadStream = fs.createReadStream(filePath, options);
        const rl: readline.ReadLine = readline.createInterface(stream, null);
        
        rl.on('line', (line: string) => {
            const fields: string[] = line.split(/[\s:]/);
            const label: number = fields[0].charAt(0) == '+' ? +1 : -1;
            const len: number = fields.length;
            let x: Feature | Float32Array = null;
            if (featureSize != null && featureSize > 0) {
                x = new Float32Array(featureSize).fill(0.0);
                for (let i = 1; i < len; i += 2) {
                    let index: number = parseInt(fields[i]) - 1;
                    let value: number = parseFloat(fields[i + 1]);
                    x[index] = value;
                }
            } else {
                x = [];
                for (let i = 1; i < len; i += 2) {
                    let index: number = parseInt(fields[i]) - 1;
                    let value: number = parseFloat(fields[i + 1]);
                    let element = { index, value };
                    x.push(element);
                }
            }
            callback(x, label);
        });

        rl.on('close', () => {
            if (complete instanceof Function) {
                complete();
            }
        });
    }
}
