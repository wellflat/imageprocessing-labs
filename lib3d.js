/**
 * My 3D Library v.0.0.2
 * 
 */
var Class = {
  create : function() {
    var properties = arguments[0];
    function self() {
      this.initialize.apply(this, arguments);
    }
    for(var i in properties) {
      self.prototype[i] = properties[i];
    }
    if(!self.prototype.initialize) {
      self.prototype.initialize = function() {};
    }
    return self;
  }
};

var Point = Class.create({
  initialize : function(x, y) {
    this.x = x || 0.0;
    this.y = y || 0.0;
  }
});

var Vertex3D = Class.create({
  initialize : function(x, y, z) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
    this.length = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  },
  clone : function() {
    return new Vertex3D(this.x, this.y, this.z);
  },
  add : function(v) {
    return new Vertex3D(this.x + v.x, this.y + v.y, this.z + v.z);
  },
  sub : function(v) {
    return new Vertex3D(this.x - v.x, this.y - v.y, this.z - v.z);
  },
  dot : function(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
  },
  cross : function(v) {
    return new Vertex3D(v.y*this.z - v.z * this.y,
                        v.z*this.x - v.x*this.z,
                        v.x*this.y - v.y*this.x);
  },
  negate : function() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
  },
  normalize : function() {
    if(this.length != 0 && this.length != 1) {
      var mod = 1/this.length;
      this.x *= mod;
      this.y *= mod;
      this.z *= mod;
    }
  },
  project : function(screen) {
    var scale = screen.focalLength/(screen.focalLength + this.z);
    return new Point(
      this.x*scale + screen.projectionCenter.x,
      -this.y*scale + screen.projectionCenter.y
    );
  },
  scaleBy : function(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
  },
  rotateX : function(angle) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return new Vertex3D(
      this.x,
      c*this.y - s*this.z,
      s*this.y + c*this.z
    );
  },
  rotateY : function(angle) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return new Vertex3D(
      s*this.z + c*this.x,
      this.y,
      c*this.z - s*this.x
    );
  },
  rotateZ : function(angle) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return new Vertex3D(
      c*this.x - s*this.y,
      s*this.x + c*this.y,
      this.z
    );
  }
});

var TriangleMesh3D = Class.create({
  initialize : function(material, vertices, faces) {
    this.material = material;
    if(vertices && vertices.length == 3) {
      this.v0 = vertices[0];
      this.v1 = vertices[1];
      this.v2 = vertices[2];
    }else {
      this.v0 = new Vertex3D(1, 0, 0);
      this.v1 = new Vertex3D(0, 1, 0);
      this.v2 = new Vertex3D(0, 0, 1); 
    }
    this.faces = faces || [];
  },
  draw : function(screen) {
    this.material.drawTriangle(this, screen);
  },
  rotateX : function(angle) {
    this.v0 = this.v0.rotateX(angle);
    this.v1 = this.v1.rotateX(angle);
    this.v2 = this.v2.rotateX(angle);
  },
  rotateY : function(angle) {
    this.v0 = this.v0.rotateY(angle);
    this.v1 = this.v1.rotateY(angle);
    this.v2 = this.v2.rotateY(angle);
  },
  rotateZ : function(angle) {
    this.v0 = this.v0.rotateZ(angle);
    this.v1 = this.v1.rotateZ(angle);
    this.v2 = this.v2.rotateZ(angle);
  },
  translate : function(v) {
    this.v0 = this.v0.add(v);
    this.v1 = this.v1.add(v);
    this.v2 = this.v2.add(v);
  }
});

var Quaternion = Class.create({
  initialize : function(x, y, z, w) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
    this.w = w || 1.0;
    this.EPSILON = 0.000001;
    this.DEGTORAD = Math.PI/180.0;
    this.RADTODEG = 180.0/Math.PI;
  },
  clone : function() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  },
  calculateMultiply : function(a, b) {
    this.x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y;
    this.y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x;
    this.z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w;
    this.w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z;
  },
  setFromAxisAngle : function(x, y, z, angle) {
    var s = Math.sin(angle*0.5);
    var c = Math.cos(angle*0.5);
    this.x = x*s;
    this.y = y*s;
    this.z = z*s;
    this.w = c;
    this.normalize();
  },
  setFromEuler : function(ax, ay, az, useDegrees) {
    if(useDegrees) {
      ax *= DEGTORAD;
      ay *= DEGTORAD;
      az *= DEGTORAD;
    }
    var fSinPitch = Math.sin(ax*0.5);
    var fCosPitch = Math.cos(ax*0.5);
    var fSinYaw = Math.sin(ay*0.5);
    var fCosYaw = Math.cos(ay*0.5);
    var fSinRoll = Math.sin(az*0.5);
    var fCosRoll = Math.cos(az*0.5);
    var fCosPitchCosYaw = fCosPitch*fCosYaw;
    var fSinPitchSinYaw = fSinPitch*fSinYaw;
    this.x = fSinRoll*fCosPitchCosYaw - fCosRoll*fSinPitchSinYaw;
    this.y = fCosRoll*fSinPitch*fCosYaw + fSinRoll*fCosPitch*fSinYaw;
    this.z = fCosRoll*fCosPitch*fSinYaw - fSinRoll*fSinPitch*fCosYaw;
    this.w = fCosRoll*fCosPitchCosYaw + fSinRoll*fSinPitchSinYaw;
  },
  modulo : function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z * this.w*this.w);
  },
  conjugate : function(a) {
    return new Quaternion(-a.x, -a.y, -a.z, a.w);
  },
  createFromAxisAngle : function(ax, ay, az, useDegrees) {
    if(useDegrees) {
      ax *= DEGTORAD;
      ay *= DEGTORAD;
      az *= DEGTORAD;
    }
    var fSinPitch = Math.sin(ax*0.5);
    var fCosPitch = Math.cos(ax*0.5);
    var fSinYaw = Math.sin(ay*0.5);
    var fCosYaw = Math.cos(ay*0.5);
    var fSinRoll = Math.sin(az*0.5);
    var fCosRoll = Math.cos(az*0.5);
    var fCosPitchCosYaw = fCosPitch*fCosYaw;
    var fSinPitchSinYaw = fSinPitch*fSinYaw;
    var q = new Quaternion();
    q.x = fSinRoll*fCosPitchCosYaw - fCosRoll*fSinPitchSinYaw;
    q.y = fCosRoll*fSinPitch*fCosYaw + fSinRoll*fCosPitch*fSinYaw;
    q.z = fCosRoll*fCosPitch*fSinYaw - fSinRoll*fSinPitch*fCosYaw;
    q.w = fCosRoll*fCosPitchCosYaw + fSinRoll*fSinPitchSinYaw;
    return q;
  },
  add : function(a, b) {
    return new Quaternion(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
  },
  sub : function(a, b) {
    return new Quaternion(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
  },
  dot : function(a, b) {
    return (a.x*b.x) + (a.y*b.y) + (a.z*b.z) + (a.w*b.w);
  },
  multiply : function(a, b) {
    var c = new Quaternion();
    c.x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y;
    c.y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x;
    c.z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w;
    c.w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z;
    return c;
  },
  mult : function(b) {
    var ax = this.x;
    var ay = this.y;
    var az = this.z;
    var aw = this.w;
    this.x = aw*b.x + ax*b.w + ay*b.z - az*b.y;
    this.y = aw*b.y - ax*b.z + ay*b.w + az*b.x;
    this.z = aw*b.z + ax*b.y - ay*b.x + az*b.w;
    this.w = aw*b.w - ax*b.x - ay*b.y - az*b.z;
  },
  normalize : function() {
    var len = this.modulo();
    if(Math.abs(len) < this.EPSILON) {
      this.x = this.y = this.z = 0.0;
      this.w = 1.0;
    }else {
      var m = 1/len;
      this.x *= m;
      this.y *= m;
      this.z *= m;
      this.w *= m;
    }
  },
  slerp : function(qa, qb, alpha) {
    var angle = qa.w*qb.w + qa.x*qb.x + qa.y*qb.y + qa.z*qb.z;
    if(angle < 0.0) {
      qa.x *= -1.0;
      qa.y *= -1.0;
      qa.z *= -1.0;
      qa.w *= -1.0;
      angle *= -1.0;
    }
    var scale;
    var invscale;
    if((angle + 1.0) > this.EPSILON) {
      if((1.0 - angle) >= this.EPSILON) {
        var theta = Math.acos(angle);
        var invsintheta = 1.0/Math.sin(theta);
        scale = Math.sin(theta*(1.0 - alpha))*invsintheta;
        invscale = Math.sin(theta*alpha)*invsintheta;
      }else {
        scale = 1.0 - alpha;
        invscale = alpha;
      }
    }else {
      qb.y = -qa.y;
      qb.x = qa.x;
      qb.w = -qa.w;
      qb.z = qa.z;
      scale = Math.sin(Math.PI*(0.5 - alpha));
      invscale = Math.sin(Math.PI*alpha);
    }
    return new Quaternion(scale*qa.x + invscale*qb.x, 
                          scale*qa.y + invscale*qb.y,
                          scale*qa.z + invscale*qb.z,
                          scale*qa.w + invscale*qb.w );
  },
  toEuler : function() {
    var euler = {x:0, y:0, z:0};
    var q = this;
    var test = q.x*q.y + q.z*q.w;
    if(test > 0.499) {
      euler.x = 2*Math.atan2(q.x, q.w);
      euler.y = Math.PI/2;
      euler.z = 0;
      return euler;
    }
    if(test < -0.499) {
      euler.x = -2*Math.atan2(q.x, q.w);
      euler.y = -Math.PI/2;
      euler.z = 0;
      return euler;
    }
    var sqx = q.x*q.x;
    var sqy = q.y*q*y;
    var sqz = q.z*q.z;
    euler.x = Math.atan2(2*q.y*q.w - 2*q.x*q.z, 1 - 2*sqy - 2*sqz);
    euler.y = Math.asin(2*test);
    euler.z = Math.atan2(2*q.x*q.w - 2*q.y*q.z , 1 - 2*sqx - 2*sqz);
    return euler;
  }
});

var Scene3D = Class.create({
  initialize : function() {
    this.objects = [];
    this.materials = [];
  },
  addObject : function(object) {
    this.objects.push(object);
  },
  removeObject : function(object) {
    for(var i=0; i<this.objects.length; i++) {
      if(this.objects[i] == object) {
        this.objects.splice(i, 1);
      }
    }
  }
});

var WireframeMaterial = Class.create({
  initialize : function(canvas, color, thickness) {
    this.context = canvas.getContext('2d');
    this.context.strokeStyle = color || 'rgba(255, 0, 255, 1)';
    this.context.lineWidth = thickness || 1.0;
  },
  drawTriangle : function(tri, screen) {
    var point = tri.v0.project(screen);
    this.context.beginPath();
    this.context.moveTo(point.x, point.y);
    point = tri.v1.project(screen);
    this.context.lineTo(point.x, point.y);
    point = tri.v2.project(screen);
    this.context.lineTo(point.x, point.y);
    point = tri.v0.project(screen);
    this.context.lineTo(point.x, point.y);
    this.context.closePath();
    this.context.stroke();
  }
});

var Screen = Class.create({
  initialize : function(width, height, fieldOfView) {
    this.width = width;
    this.height = height;
    this.projectionCenter = new Point(width*0.5, height*0.5);
    this.fieldOfView = fieldOfView;
    this.focalLength = width*0.5*(1/Math.tan(fieldOfView*0.5*Math.PI/180));
  }
});

var BasicRenderEngine = Class.create({
  initialize : function(canvas, screen, time) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
    this.screen = screen;
    this.time = time || 100;
    this.isPlay = false;
    this.setBackground(this.context.createLinearGradient(0, 0, 0, 300));
  },
  setTime : function(time) {
    this.time = time;
  },
  setBackground : function(grad) {
    grad.addColorStop(0, 'rgb(0, 0, 0)');
    grad.addColorStop(0.7, 'rgb(16, 16, 16)');
    grad.addColorStop(0.8, 'rgb(32, 32, 32)');
    grad.addColorStop(0.9, 'rgb(48, 48, 48)');
    grad.addColorStop(1, 'rgb(64, 64, 64)');
    this.context.fillStyle = grad;
    this.context.fillRect(0, 0, this.width, this.height);
  },
  renderScene : function(scene, angle) {
    var self = this;
    if(!this.isPlay) {
      this.timerID = setInterval(function(){self.render(scene, angle);}, this.time);
      this.isPlay = true;
    }
  },
  stop : function() {
    if(this.isPlay) {
      clearInterval(this.timerID);
      this.isPlay = false;
    }
  },
  render : function(scene, angle) {
    var objects = scene.objects;
    this.context.fillRect(0, 0, this.width, this.height);
    for(var i=0, m_len=objects.length; i<m_len; i++) {
      for(var j=0, len=objects[i].length; j<len; j++) {
        objects[i][j].rotateX(angle);
        objects[i][j].rotateY(angle);
        objects[i][j].rotateZ(angle);
        objects[i][j].draw(this.screen);
      }
    }
  }
});