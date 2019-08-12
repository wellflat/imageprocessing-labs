/**
 * Decision-Tree Learning
 */

/* Tree Node */
var Node = function() {
  this.init.apply(this, arguments);
};
Node.prototype = {
  init: function(attr, value, left, right, terminal) {
    this.attr = attr;
    this.value = value;
    this.left = left;   // Node
    this.right = right; // Node
    this.terminal = terminal || null; // Object
  }
};

/* Builds Decision-Tree */
(function() {
  var DecisionTree;  // top-level namespace
  var _root = this;  // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    DecisionTree = exports;   // for CommonJS
  } else {
    DecisionTree = _root.DecisionTree = {};
  }

  var version = {
    release: '0.1.0',
    date: '2011-08'
  };
  DecisionTree.toString = function() {
    return "version " + version.release + ", released " + version.date;
  };

  // core operations
  var _records = 0;
  var core = {
    _divideSets : function(records, attr, value) {
      var splitFunc,
          set1 = [], set2 = [],
          len = records.length;
      if(isNaN(parseFloat(value))) { // String
        splitFunc = function(record) {
          return record[attr] == value;
        };
      } else { // Number
        splitFunc = function(record) {
          return parseFloat(record[attr]) >= parseFloat(value);
        };
      }
      for(var i=0; i<len; i++) {
        if(splitFunc(records[i])) {
          set1.push(records[i]);
        } else {
          set2.push(records[i]);
        }
      }
      return [set1, set2];
    },
    _countAttr : function(records) {
      var counts = {},
          len = records.length,
          rlen, key;
      if(records[0]) {
        rlen = records[0].length;
      }
      for(var i=0; i<len; i++) {
        key = records[i][rlen - 1];
        if(!counts[key]) {
          counts[key] = 0;
        }
        counts[key]++;
      }
      return counts;
    },
    _calcEntropy : function(records) {
      var entropy = 0.0,
          len = records.length,
          counts = core._countAttr(records),
          p;
      for(var i in counts) {
        p = counts[i]/len;
        entropy += -p*(Math.log(p)/Math.log(2));
      }
      return entropy;
    },
    _grow : function(records) {
      if(records.length == 0) {
        return null;
      }
      var recordNum = records.length,
          attrNum = records[0].length - 1,
          attrValue = {},
          maxGain = 0.0,
          entropy = core._calcEntropy(records),
          subSets, p, gain, next, nodeAttr, nodeValue;
      for(var attr=0; attr<attrNum; attr++) {
        attrValue = {};
        for(var i=0; i<recordNum; i++) {
          attrValue[records[i][attr]] = 1;
        }
        for(var value in attrValue) {
          subSets = core._divideSets(records, attr, value);
          p = subSets[0].length/recordNum;
          gain = entropy - p*core._calcEntropy(subSets[0]) -
            (1 - p)*core._calcEntropy(subSets[1]);
          if(gain > maxGain &&
             subSets[0].length > 0 && subSets[1].length > 0) {
            maxGain = gain;
            nodeAttr = attr;
            nodeValue = value;
            next = [subSets[0], subSets[1]];
          }
        }
      }
      if(maxGain > 0) {
        var right = core._grow(next[0]);
        var left = core._grow(next[1]);
        return new Node(nodeAttr, nodeValue, left, right);
      } else {
        return new Node(-1, null, null, null, core._countAttr(records));
      }
    },
    _classify : function(data, tree) {
      var value, branch;
      if(tree.terminal != null) {
        return tree.terminal;
      }else {
        value = data[tree.attr];
        branch = null;
        if(isNaN(parseFloat(value))) {
          if(value == tree.value) {
            branch = tree.right;
          }else {
            branch = tree.left;
          }
        }else {
          if(value >= tree.value) {
            branch = tree.right;
          }else {
            branch = tree.left;
          }
        }
      }
      return core._classify(data, branch);
    },
    _prune : function(tree, minGain) {
      var left = [], right = [], delta;
      if(tree.right.terminal == null) {
        core._prune(tree.right, minGain);
      }
      if(tree.left.terminal == null) {
        core._prune(tree.left, minGain);
      }
      if(tree.right.terminal != null &&
         tree.left.terminal != null) {
        for(var i in tree.right.terminal) {
          for(var j=0; j<tree.right.terminal[i]; j++) {
            right.push([i]);
          }
        }
        for(var i in tree.left.terminal) {
          for(var j=0; j<tree.left.terminal[i]; j++) {
            left.push([i]);
          }
        }
        delta = core._calcEntropy(left + right) -
          (core._calcEntropy(tree.left) + core._calcEntropy(tree.right))/2;
        if(delta < minGain) {
          tree.right = null;
          tree.left = null;
          tree.terminal = core._countAttr(left + right);
        }
      }
    }
  };
  // aliases (public APIs)
  var apis = ['grow', 'classify', 'prune'];
  for(var i=0; i<apis.length; i++) {
    DecisionTree[apis[i]] = core['_' + apis[i]];
  }
}).call(this);

/* Traces the Decision-Tree, draws on Canvas */
(function() {
  var DecisionTreeTracer;  // top-level namespace
  var _root = this;        // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    DecisionTreeTracer = exports;   // for CommonJS
  } else {
    DecisionTreeTracer = _root.DecisionTreeTracer = {};
  }
  
  // core operations
  var _tree = null,
      _context = null;
  var core = {
    _init : function(tree, context) {
      _tree = tree;
      _context = context;
      _context.strokeStyle = '#999999';
      _context.lineWidth = 2;
      _context.font = 'bold 14px \'Courier New\'';
      _context.fillStyle = '#000000';
    },
    _getWidth : function(tree) {
      if(tree.left === null && tree.right === null) {
        return 1;
      }
      return core._getWidth(tree.left) + core._getWidth(tree.right);
    },
    _getDepth : function(tree) {
      if(tree.left === null && tree.right === null) {
        return core._max(tree.left, tree.right) + 1;
      }
      return 1;
    },
    _max : function(a, b) {
      return a > b ? a : b;
    },
    // draw on the canvas
    _draw : function(tree, context) {
      core._init(tree, context);
      var w = core._getWidth(tree)*80;
      core._drawNode(tree, w/2, 20);
    },
    _drawNode : function(tree, x, y) {
      if(tree.terminal == null) {
        var scale = 80,
            lw = core._getWidth(tree.left)*scale,
            rw = core._getWidth(tree.right)*scale,
            ls = x - (lw + rw)/2,
            rs = x + (lw + rw)/2;
        _context.beginPath();
        _context.moveTo(x, y);
        _context.lineTo(ls + lw/2, y + scale);
        _context.moveTo(x, y);
        _context.lineTo(rs - rw/2, y + scale);
        _context.fillText(tree.attr + ':' + tree.value, x, y);
        _context.closePath();
        _context.stroke();
        core._drawNode(tree.left, ls + lw/2, y + scale);
        core._drawNode(tree.right, rs - rw/2, y + scale);
      } else {
        _context.fillStyle = '#00cc66';
        var txt = '';
        for(var i in tree.terminal) {
          txt += i + ':' + tree.terminal[i];
        }
        _context.fillText(txt, x + 3, y + 8);
        _context.fillStyle = '#000000';
      }
    },
    // draw on the html document (for <p>)
    _write : function(tree, indent) {
      var text = '';
      if(tree.terminal != null) {
        for(var i in tree.terminal) {
          text += i + ':' + tree.terminal[i] + '<br />';
        }
      } else {
        text += tree.attr + ':' + tree.value + '? ' + '<br />';
        text += indent + 'T-> ';
        text += core._write(tree.right, indent + '&emsp;');
        text += indent + 'F-> ';
        text += core._write(tree.left, indent + '&emsp;');
      }
      return text;
    }
  };
  // aliases (public APIs)
  DecisionTreeTracer.draw = core._draw;
  DecisionTreeTracer.print = core._write;
}).call(this);

/* Utilities */
(function() {
  var DataParser;    // top-level namespace
  var _root = this;  // reference to 'window' or 'global'
  
  if(typeof exports !== 'undefined') {
    DataParser = exports;   // for CommonJS
  } else {
    DataParser = _root.DataParser = {};
  }

  var LF = String.fromCharCode(10),
      TAB = String.fromCharCode(9),
      COMMA = String.fromCharCode(44),
      _read = function(key, value, delimiter) {
        if(window.localStorage[key]) {
          return JSON.parse(window.localStorage[key]);
        }
        var dataList = [], lines = value.split(LF);
        for(var i=0; i<lines.length; i++) {
          dataList[i] = lines[i].split(delimiter);
        }
        window.localStorage[key] = JSON.stringify(dataList);
        return dataList;
      },
      _replace = function(str, from, to) {
        return str.replace(from, to);
      };
  // aliases (public APIs and Variables)
  DataParser.LF = LF;
  DataParser.TAB = TAB;
  DataParser.read = _read;
  DataParser.replace = _replace;
}).call(this);
