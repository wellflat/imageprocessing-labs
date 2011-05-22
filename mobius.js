/**
 * Class.create(object)
 * returns a function that will fire its own initialize method.
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

var MobiusStrip = Class.create({
  initialize : function(canvas, n) {
    if(canvas == undefined || canvas == null) return ;
    this.context = canvas.getContext('2d');
    this.WIDTH = canvas.width;
    this.HEIGHT = canvas.height;
    this.SCALE = 60;
    this.FOV = 250;
    this.points = [];
    this.numPoints = 0;
    this.isPlay = false;
    this.setStyle(this.context.createLinearGradient(0, 0, 0, 300));
    this.setPoints(n);
  },
  setStyle : function(grad) {
    grad.addColorStop(0, 'rgb(0, 0, 0)');
    grad.addColorStop(0.7, 'rgb(16, 16, 16)');
    grad.addColorStop(0.8, 'rgb(32, 32, 32)');
    grad.addColorStop(0.9, 'rgb(48, 48, 48)');
    grad.addColorStop(1, 'rgb(64, 64, 64)');
    this.context.fillStyle = grad;
    this.context.strokeStyle = 'rgb(0, 255, 160)';
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  },
  setPoints : function(num) {
    var s = 0.0;
    var t = 0.0;
    var k = 0.0;
    var n = 0;
    var point;
    for(var i=0; i<=2*Math.PI*num; i++) {
      for(var j=-num/8; j<=num/8; j++) {
        s = i/num; t = j/10;
        k = 1 + t*Math.cos(s/2);
        point = [(this.SCALE*k*Math.cos(s)),
                 (this.SCALE*k*Math.sin(s)),
                 (this.SCALE*t*Math.sin(s/2))];
        this.points.push(point);
        n++;
      }
    }
    this.numPoints = n;
  },
  play : function(t, angle) {
    var self = this;
    if(!this.isPlay) {
      this.timerID = setInterval(function(){self.render(angle);}, t);
      this.isPlay = true;
    }
  },
  stop : function() {
    if(this.isPlay) {
      clearInterval(this.timerID);
      this.isPlay = false;
    }
  },
  render : function(angle) {
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    for(i=0; i<this.numPoints; i++)	{
      this.rotateY(this.points[i], angle); 	
      this.draw(this.points[i]); 
    }
  },
  draw : function(point3d) {
    var scale = this.FOV/(this.FOV + point3d[2]); 
    var x = (point3d[0]*scale) + this.WIDTH/2;
    var y = (point3d[1]*scale) + this.HEIGHT/2;
    this.context.lineWidth= scale*2; 
    this.context.beginPath();
    this.context.moveTo(x, y); 
    this.context.lineTo(x + scale, y); 
    this.context.stroke(); 
  },
  rotateY : function(point3d, angle) {
    var x = point3d[0];
    var z = point3d[2];
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var tempZ = z;
    var tempX = x;
    x = tempX*c + tempZ*s;
    z = tempZ*c - tempX*s;
    point3d[0] = x;
    point3d[2] = z;     
  }
});