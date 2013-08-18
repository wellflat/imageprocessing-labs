/**
 * provides routines for k-means clustering, generating code books,
 * and quantizing vectors by comparing them with centroids.
 * (specified RGB color vectors, [[R,G,B],[R,G,B],...])
 */

/* performs k-means on a set of observation vectors forming k clusters */
function kmeans(samples, clusterCount) {
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
}

/* quantizing vectors by comparing them with centroids */
function vq(samples, centroids, indices) {
  var clusterCount = centroids.length,
      len = samples.length;
  for(var k=0; k<clusterCount; k++) {
    var ilen = indices[k].length;
    for(var i=0; i<ilen; i++) {
      samples[indices[k][i]] = centroids[k];
    }
  }
  return samples;
}

/* message handler */
self.addEventListener('message', function(e) {
  var message = e.data;
  var codebook = kmeans(message.samples, message.clusterCount);
  var ret = vq(message.samples, codebook["centroids"], codebook["indices"]);
  postMessage(ret);
}, false);

self.addEventListener('error', function(e) {
  postMessage(e);
}, false);
