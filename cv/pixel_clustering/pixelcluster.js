/**
 * Pixel Clustering module
 * http://rest-term.com
 */
(function() {
  var PixelCluster;  // top-level namaspace
  var _root = this;  // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    PixelCluster = exports;   // for CommonJS
  } else {
    PixelCluster = _root.PixelCluster = {};
  }

  var ctx = null,
      image = new Image(),
      imgData = null,
      worker = new Worker('lib/js/kmeans.js');
  var core = {
    load: function(fileName, onComplete, onError) {
      ctx = document.createElement('canvas').getContext('2d');
      image.src = fileName;
      image.addEventListener('load', function(e) {
        var img = e.target;
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, img.width, img.height);
        if(typeof onComplete === 'function') {
          onComplete(imgData);
        }
      }, false);
      image.addEventListener('error', function() {
        if(typeof onError === 'function') {
          onError();
        }
      }, false);
    },
    perform: function(division, clusterCount, onComplete, onError) {
      var features = core.extractFeatures(division);
      var message = {"samples":features, "clusterCount":clusterCount};
      worker.postMessage(message);
      worker.addEventListener('message', function(e) {
        e.target.removeEventListener('message', arguments.callee);
        if(typeof onComplete === 'function') {
          onComplete(e.data);
        }
      }, false);
      worker.addEventListener('error', function(e) {
        e.target.removeEventListener('error', arguments.callee);
        if(typeof onError === 'function') {
          onError();
        }
      }, false);
    },
    /* extracts feature vectors */
    extractFeatures: function(division) {
      var w = imgData.width,
          h = imgData.height,
          data = imgData.data,
          len = w*h*4,
          features = [],
          bins = [0, 0, 0],
          step, kstep, dx, dy, inv, i, j;

      if(w%division != 0 || h%division != 0) {
        throw Error('invalid parameter: division');
      }
      dx = w/division;
      dy = h/division;
      inv = 1/(dx*dy);
      // means of each color, each segment
      for(var y=0; y<division; y++) {
        step = y*dy*w << 2;
        for(var x=0; x<division; x++) {
          i = step + (x*dx << 2);
          bins = [0, 0, 0];
          for(var ky=0; ky<dy; ky++) {
            kstep = i + (ky*w << 2);
            for(var kx=0; kx<dx; kx++) {
              j = kstep + (kx << 2);
              bins[0] += data[j];     // R
              bins[1] += data[j + 1]; // G
              bins[2] += data[j + 2]; // B
            }
          }
          features.push([bins[0]*inv, bins[1]*inv, bins[2]*inv]);
        }
      }
      return features;
    },
    /* performs k-means on a set of observation vectors forming k clusters */
    kmeans: function(samples, clusterCount) {
      var centroids = [],
          previous = [],
          clusters = [],
          indices = [],
          len = samples.length,
          eps = 1.0e-8,
          maxIter = 1000,
          iter = 0,
          distance = function(a, b) {
            var dr = a[0] - b[0],
                dg = a[1] - b[1],
                db = a[2] - b[2];
            return Math.sqrt(dr*dr + dg*dg + db*db);
          },
          canTerminate = function() {
            var cnt = 0;
            for(var k=0; k<clusterCount; k++) {
              var sub = distance(centroids[k], previous[k]);
              sub = sub > 0 ? sub : -sub;
              if(sub < eps) cnt++;
            }
            if(cnt === clusterCount) return true;
            else return false;
          };
      // initializes centroids and clusters
      for(var k=0; k<clusterCount; k++) {
        centroids[k] = [Math.random()*255, Math.random()*255, Math.random()*255];
        previous[k] = [0.0, 0.0, 0.0];
        clusters[k] = [];
      }
      for(var i=0; i<len; i++) {
        var label = Math.floor(Math.random()*clusterCount);
        clusters[label].push(samples[i]);
      }
      while(!canTerminate() && iter < maxIter) {
        iter++;
        // calculates centroids
        for(k=0; k<clusterCount; k++) {
          if(!clusters[k] || !clusters.length) continue;
          var r = 0.0, g = 0.0, b = 0.0, llen = clusters[k].length;
          for(i=0; i<llen; i++) {
            r += clusters[k][i][0];
            g += clusters[k][i][1];
            b += clusters[k][i][2];
          }
          previous[k][0] = centroids[k][0];
          previous[k][1] = centroids[k][1];
          previous[k][2] = centroids[k][2];
          centroids[k] = [r/llen, g/llen, b/llen];
        }
        // updates clusters
        clusters = [];
        indices = [];
        for(i=0; i<len; i++) {
          var minDistance = Number.MAX_VALUE, currentLabel = -1;
          for(k=0; k<clusterCount; k++) {
            var d = distance(centroids[k], samples[i]);
            if(d < minDistance) {
              minDistance = d;
              currentLabel = k;
            }
          }
          if(!clusters[currentLabel]) clusters[currentLabel] = [];
          if(!indices[currentLabel]) indices[currentLabel] = [];
          clusters[currentLabel].push(samples[i]);
          indices[currentLabel].push(i);
        }
      }
      return {"centroids":centroids, "indices":indices};
    },
    /* quantizing vectors by comparing them with centroids */
    vq: function(samples, centroids, indices) {
      var clusterCount = centroids.length,
          len = samples.length;
      for(var k=0; k<clusterCount; k++) {
        var ilen = indices[k].length;
        for(var i=0; i<ilen; i++) {
          samples[indices[k][i]] = centroids[k];
        }
      }
      return samples;
    },
    render: function(context, features, division) {
      var w = imgData.width,
          h = imgData.height,
          data = imgData.data,
          dstImgData = context.getImageData(0, 0, w, h),
          dstData = dstImgData.data,
          len = w*h*4,
          step, kstep, dx, dy, inv, i, j;
      if(w%division != 0 || h%division != 0) {
        throw Error('invalid parameter: division');
      }
      dx = w/division;
      dy = h/division;
      inv = 1/(dx*dy);
      // means of each color, each segment
      var f = 0, p = [];
      for(var y=0; y<division; y++) {
        step = y*dy*w << 2;
        for(var x=0; x<division; x++) {
          i = step + (x*dx << 2);
          p = features[f++];
          for(var ky=0; ky<dy; ky++) {
            kstep = i + (ky*w << 2);
            for(var kx=0; kx<dx; kx++) {
              j = kstep + (kx << 2);
              dstData[j] = p[0];
              dstData[j + 1] = p[1];
              dstData[j + 2] = p[2];
              dstData[j + 3] = 255;
            }
          }
        }
      }
      context.putImageData(dstImgData, 0, 0);
    }
  };
  // public APIs
  PixelCluster.load = core.load;
  PixelCluster.mosaic = core.extractFeatures;
  PixelCluster.kmeans = core.kmeans;
  PixelCluster.vq = core.vq;
  PixelCluster.perform = core.perform; // using web workers
  PixelCluster.render = core.render;
}).call(this);
