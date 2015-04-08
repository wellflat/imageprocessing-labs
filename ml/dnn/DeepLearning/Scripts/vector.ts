
module rt {
    /**
     * Vector class
     */
    export class Vector {

        constructor(private elements: number[]) { }

        get size(): number { return this.elements.length; }

        static create(elements: number[]): Vector {
            return new Vector(elements.slice());
        }

        static rand(n: number): Vector {
            var elements: number[] = [];
            while(n--) { elements.push(Math.random()); }
            return Vector.create(elements);
        }

        static zeros(n: number): Vector {
            var elements: number[] = [];
            while(n--) { elements.push(0); }
            return Vector.create(elements);
        }

        static arange(n: number): Vector {
            var elements: number[] = [];
            for(var i = 0; i < n; i++) {
                elements[i] = i;
            }
            return Vector.create(elements);
        }

        public clone(): Vector {
            return Vector.create(this.elements);
        }

        public at(i: number): number {
            return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
        }

        public add(vector: Vector): Vector {
            var v: number[] = vector.elements;
            if(this.elements.length !== v.length) { return null; }
            return this.map((x, i) => x + v[i - 1]);
        }

        public subtract(vector: Vector): Vector {
            var v: number[] = vector.elements;
            if(this.elements.length !== v.length) { return null; }
            return this.map((x, i) => x - v[i - 1]);
        }

        public multiply(k: number): Vector {
            return this.map(x => x * k);
        }

        public dot(vector: Vector): number {
            var v: number[] = vector.elements,
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

        public cross(vector: Vector): Vector {
            var b: number[] = vector.elements;
            if(this.elements.length !== 3 || b.length !== 3) {
                return null;
            }
            var a: number[] = this.elements;
            return Vector.create([
                (a[1] * b[2]) - (a[2] * b[1]),
                (a[2] * b[0]) - (a[0] * b[2]),
                (a[0] * b[1]) - (a[1] * b[0])
            ]);
        }

        public toString(): string {
            return "[" + this.elements.join(", ") + "]";
        }

        public map(fn: Function): Vector {
            var elements: number[] = [];
            this.forEach((x, i) => elements.push(fn.call(this, x, i)));
            return Vector.create(elements);
        }

        private forEach(fn: Function): void {
            var n: number = this.elements.length;
            for(var i = 0; i < n; i++) {
                fn.call(this, this.elements[i], i + 1);
            }
        }
    }
}