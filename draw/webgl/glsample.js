/**
 * WebGL Tutorial
 * https://developer.mozilla.org/ja/docs/Web/API/WebGL_API
 */

var gl; // WebGL コンテキスト用のグローバル変数

function start() {
  var canvas = document.getElementById("Canvas");

  // GL コンテキストを初期化
  gl = initWebGL(canvas);

  // WebGL を使用できる場合に限り、処理を継続

  if (gl) {
    // クリアカラーを黒色、不透明に設定する
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 深度テストを有効化
    gl.enable(gl.DEPTH_TEST);
    // 近くにある物体は、遠くにある物体を覆い隠す
    gl.depthFunc(gl.LEQUAL);
    // カラーバッファや深度バッファをクリアする
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

function initWebGL(canvas) {
  gl = null;

  try {
    // 標準コンテキストの取得を試みる。失敗した場合は、experimental にフォールバックする。
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch(e) {
    console.log(e);
  }

  // GL コンテキストを取得できない場合は終了する
  if (!gl) {
    alert("WebGL を初期化できません。ブラウザはサポートしていないようです。");
    gl = null;
  }

  return gl;
}