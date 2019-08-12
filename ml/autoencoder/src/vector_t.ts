module ml {
    /**
     * Vector class using Typed Array (Float32Array)
     */
    export class VectorT {
        private elements: Float32Array;

        constructor(elements: number[]);
        constructor(elements: Float32Array);
        constructor(elements: any) {
            if(elements instanceof Float32Array) {
                //this.elements = elements.slice();
                this.elements = elements;
            } else {
                this.elements = new Float32Array(elements);
            }
        }

        get size(): number { return this.elements.length; }

        static create(elements: Float32Array): VectorT {
            return new VectorT(elements);
        }

        static rand(n: number): VectorT {
            var elements: number[] = [];
            for(var i: number = 0; i < n; i++) {
                elements[i] = Math.random();
            }
            return new VectorT(elements);
        }

        static zeros(n: number): VectorT {
            return new VectorT(new Float32Array(n));
        }

        static arange(n: number): VectorT {
            var elements: Float32Array = new Float32Array(n);
            for(var i = 0; i < n; i++) {
                elements[i] = i;
            }
            return new VectorT(elements);
        }

        public clone(): VectorT {
            return VectorT.create(this.elements);
        }

        public at(i: number): number {
            //return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
            return this.elements[i - 1];
        }

        public add(vector: VectorT): VectorT {
            var v: Float32Array = vector.elements;
            if(this.elements.length !== v.length) { return null; }
            return this.map((x, i) => x + v[i - 1], v.length);
        }

        public subtract(vector: VectorT): VectorT {
            var v: Float32Array = vector.elements;
            if(this.elements.length !== v.length) { return null; }
            return this.map((x, i) => x - v[i - 1], v.length);
        }

        public multiply(k: number): VectorT {
            return this.map(x => x * k, this.elements.length);
        }

        public dot(vector: VectorT): number {
            var v: Float32Array = vector.elements,
                product: number = 0,
                n: number = this.elements.length;
            if(n !== v.length) {
                return null;
            }
            while(n--) {
                product += this.elements[n] * v[n];
            }
            return product;
        }

        public cross(vector: VectorT): VectorT {
            var b: Float32Array = vector.elements;
            if(this.elements.length !== 3 || b.length !== 3) {
                return null;
            }
            var a: Float32Array = this.elements;
            return new VectorT(new Float32Array([
                (a[1] * b[2]) - (a[2] * b[1]),
                (a[2] * b[0]) - (a[0] * b[2]),
                (a[0] * b[1]) - (a[1] * b[0])
            ]));
        }

        public mean(): number {
            var l: number = this.elements.length;
            var sum: number = 0.0;
            for(var i = 0; i < l; i++) {
                sum += this.elements[i];
            }
            return sum / l;
        }
        
        public toString(): string {
            //Float32Array#join cannot use
            var l: number = this.elements.length,
                str: string = "[";
            for(var i = 0; i < l; i++) {
                str += this.elements[i].toString() + ', ';
            }
            str = str.substring(0, str.length - 2);
            str += ']';
            return str;
        }

        public map(fn: Function, size: number): VectorT {
            var elements: Float32Array = new Float32Array(size);
            this.forEach((x, i) => elements[i] = fn.call(this, x, i));
            return new VectorT(elements);
        }

        private forEach(fn: Function): void {
            var n: number = this.elements.length;
            for(var i = 0; i < n; i++) {
                fn.call(this, this.elements[i], i + 1);
            }
        }
    }
}