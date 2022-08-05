<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <canvas width="32" height="32" ref="canvas"></canvas>
    <button type="button" @click="inference">inference</button>
    <span>{{ infoLabel }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { InferenceSession, Tensor } from 'onnxruntime-web';
interface DataType {
  modelPath: string,
  imagePath: string,
  imageData: ImageData | null,
  ctx: CanvasRenderingContext2D | null,
  session: InferenceSession | null,
  infoLabel: string
}
export default defineComponent({
  name: 'HelloONNX',
  props: {
    msg: String,
  },
  data(): DataType {
    return {
      modelPath: 'cifar10_net.onnx',  // ONNX model file name
      imagePath: require("@/assets/cat9.png"),  // test image
      imageData: null,
      ctx: null,
      session: null,
      infoLabel: ""
    };
  },
  async mounted() {
    const option = {executionProviders: ['wasm', 'webgl']};
    this.session = await InferenceSession.create(this.modelPath, option);
    this.infoLabel = "loading model complete."
    const image = new Image();
    image.src = this.imagePath;
    const isCanvas = (x: any): x is HTMLCanvasElement => x instanceof HTMLCanvasElement;
    image.onload = () => {
      // put image data on the HTML canvas
      const ref = this.$refs;
      if(!isCanvas(ref.canvas)) return;
      this.ctx = ref.canvas.getContext("2d");
      if(this.ctx == null) return;
      const [w, h] = [this.ctx.canvas.width, this.ctx.canvas.height];
      this.ctx.drawImage(image, 0, 0, w, h);
      this.imageData = this.ctx.getImageData(0, 0, w, h);
    };
  },
  methods: {
    async inference(): Promise<void> {
      if(this.session == null || this.imageData == null) return;
      const { data, width, height } = this.imageData;
      // normalize
      const processed = this.normalize((data as Uint8ClampedArray), width, height);
      // run inference using ORT
      const tensor = new Tensor("float32", processed, [1, 3, width, height]);
      const feed = { input: tensor };
      const result = await this.session.run(feed);
      const predicted = this.softmax((result.output.data as Float32Array));
      // view result
      this.infoLabel = this.getClass(predicted).toString();
    },
    normalize(src: Uint8ClampedArray, width: number, height: number): Float32Array {
      const dst = new Float32Array(width * height * 3);
      const transforms = [[0.4914, 0.4822, 0.4465], [0.2023, 0.1994, 0.2010]];
      const step = width * height;
      for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
          const [di, si] = [y * width + x, (y * width + x) * 4];
          // normalize data
          // format RGBARGBARGBA... to RRR...GGG...BBB...
          dst[di] = ((src[si + 0] / 255) - transforms[0][0]) / transforms[1][0];
          dst[di + step] = ((src[si + 1] / 255) - transforms[0][1]) / transforms[1][1];
          dst[di + step * 2] = ((src[si + 2] / 255) - transforms[0][2]) / transforms[1][2];
        }
      }
      return dst;
    },
    softmax(data: Float32Array): Float32Array {
      const max = Math.max(...data);
      const d = data.map(y => Math.exp(y - max)).reduce((a, b) => a + b);
      return data.map((value, index) => Math.exp(value - max) / d);
    },
    getClass(data: Float32Array): [string, number] {
      // CIFAR-10 classes
      const classes = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck'];
      const maxProb = Math.max(...data);
      return [classes[data.indexOf(maxProb)], maxProb];
    }
  }
});
</script>