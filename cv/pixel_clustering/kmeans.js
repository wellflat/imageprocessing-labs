/**
 * provides routines for k-means clustering, generating code books,
 * and quantizing vectors by comparing them with centroids.
 * (specified CanvasPixelArray [[R,G,B],[R,G,B],...])
 */

/* performs k-means on a set of observation vectors forming k clusters */
function kmeans(samples, ncluster, method) {
  var centroids = [],
      previous = [],
      clusters = [],
      code = [],
      len = samples.length,
      eps = 1.0e-8,
      maxIter = 1000,
      iter = 0,
      distance = function(a, b) {
        var dr = a[0] - b[0],
            dg = a[1] - b[1],
            db = a[2] - b[2];
        return dr*dr + dg*dg + db*db;
      },
      nearest = function(sample, centroids) {
        var minIndex = 0,
            minDistance = Number.MAX_VALUE,
            clusterCount = centroids.length;
        for(var k=0; k<clusterCount; k++) {
          var d = distance(centroids[k], sample);
          if(minDistance > d) {
            minDistance = d;
            minIndex = k;
          }
        }
        return [minIndex, minDistance];
      },
      initialize = function(samples, ncluster, method, centroids, clusters) {
        var len = samples.length;
        if(method === 'kmeans_pp') {
          // kmeans++
          var d = [], sumDistance = 0.0, label, k, i,
              r = Math.floor(Math.random()*len);
          centroids[0] = [];
          centroids[0][0] = samples[r][0];
          centroids[0][1] = samples[r][1];
          centroids[0][2] = samples[r][2];
          previous[0] = [0.0, 0.0, 0.0];
          clusters[0] = [];
          for(k=1; k<ncluster; k++) {
            sumDistance = 0.0;
            for(i=0; i<len; i++) {
              d[i] = nearest(samples[i], centroids)[1];
              sumDistance += d[i];
            }
            sumDistance *= Math.random();
            for(i=0; i<len; i++) {
              sumDistance -= d[i];
              if(sumDistance > 0) continue;
              centroids[k] = [];
              centroids[k][0] = samples[i][0];
              centroids[k][1] = samples[i][1];
              centroids[k][2] = samples[i][2];
              break;
            }
            previous[k] = [0.0, 0.0, 0.0];
            clusters[k] = [];
          }
          for(i=0; i<len; i++) {
            label = nearest(samples[i], centroids);
            clusters[label[0]].push(samples[i]);
          }
        } else {
          // random
          for(k=0; k<ncluster; k++) {
            centroids[k] = [Math.random()*255, Math.random()*255, Math.random()*255];
            previous[k] = [0.0, 0.0, 0.0];
            clusters[k] = [];
          }
          for(i=0; i<len; i++) {
            label = Math.floor(Math.random()*k);
            clusters[label].push(samples[i]);
          }
        }
        
      },
      canTerminate = function() {
        var cnt = 0;
        for(var k=0; k<ncluster; k++) {
          if(distance(centroids[k], previous[k]) < eps) cnt++;
        }
        if(cnt === ncluster) return true;
        else return false;
      };
  
  // initializes centroids and clusters
  initialize(samples, ncluster, method, centroids, clusters);
  
  while(!canTerminate() && iter < maxIter) {
    iter++;
    // calculates centroids
    for(var k=0; k<ncluster; k++) {
      if(!clusters[k] || !clusters.length) continue;
      var r = 0.0, g = 0.0, b = 0.0, llen = clusters[k].length;
      for(var i=0; i<llen; i++) {
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
    code = [];
    for(i=0; i<len; i++) {
      var minDistance = Number.MAX_VALUE, currentLabel = -1;
      for(k=0; k<ncluster; k++) {
        var d = distance(centroids[k], samples[i]);
        if(d < minDistance) {
          minDistance = d;
          currentLabel = k;
        }
      }
      if(!clusters[currentLabel]) clusters[currentLabel] = [];
      if(!code[currentLabel]) code[currentLabel] = [];
      clusters[currentLabel].push(samples[i]);
      code[currentLabel].push(i);
    }
  }
  return {"centroids":centroids, "code":code};
}

/* quantizing vectors by comparing them with centroids */
function vq(samples, centroids, code) {
  var clusterCount = centroids.length,
      len = samples.length;
  for(var k=0; k<clusterCount; k++) {
    var ilen = code[k].length;
    for(var i=0; i<ilen; i++) {
      samples[code[k][i]] = centroids[k];
    }
  }
  return samples;
}

/* message handler */
self.addEventListener('message', function(e) {
  var message = e.data;
  var codebook = kmeans(message.samples, message.ncluster, message.method);
  var result = vq(message.samples, codebook["centroids"], codebook["code"]);
  postMessage(result);
}, false);

self.addEventListener('error', function(e) {
  postMessage(e);
}, false);
