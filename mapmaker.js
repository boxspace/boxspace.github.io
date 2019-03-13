function MapMaker(img, size) {
  this.bmp = new BMPImage(6, size);
  this.image = img;
  this.map = {};
}

MapMaker.prototype.inverted = [0, 2, 1, 15, 4, 23, 6, 14, 19, 9, 10, 11, 12, 20, 7, 3, 22, 17, 18, 8, 13, 21, 16, 5];

MapMaker.prototype.twistr = function(v, id) {
  a = id % 3;
  b = Math.floor(id / 3) % 2;
  c = Math.floor(id / 6) % 2;
  d = Math.floor(id / 12) % 2;
  
  v = (a == 1) ? {x:  v.y,  y:  v.z,  z:  v.x} : v;
  v = (a == 2) ? {x:  v.z,  y:  v.x,  z:  v.y} : v;
  v = (b == 1) ? {x:  v.x,  y:  v.z,  z: -v.y} : v;
  v = (c == 1) ? {x: -v.x,  y: -v.y,  z:  v.z} : v;
  v = (d == 1) ? {x:  v.x,  y: -v.y,  z: -v.z} : v;
  return v;
};

MapMaker.prototype.get = function(cubeA, sideA) {
 return this.map[cubeA * 6 + sideA - 5];
};

MapMaker.prototype.add = function(cubeA, sideA, cubeB, transform) {
  transform = (transform == null) ? 0 : transform;
  var inverted = this.inverted[transform];
  var sign = 1 - 2 * (sideA % 2);
  sign = -1 * sign;  // get opposite side
  var testVec = {
    x: sideA == 0 || sideA == 1 ? sign : 0,
    y: sideA == 2 || sideA == 3 ? sign : 0,
    z: sideA == 4 || sideA == 5 ? sign : 0,
  };
  testVec = this.twistr(testVec, transform);
  sideB = 0.5 * (testVec.x * (1 * testVec.x - 1) + testVec.y * (5 * testVec.y - 1) + testVec.z * (9 * testVec.z - 1));
  
  var colA = this.bmp.get(sideA, cubeA - 1);
  var colB = this.bmp.get(sideB, cubeB - 1);
  colA[0] = cubeB;
  colA[1] = transform;
  colA[2] = 127;
  colB[0] = cubeA;
  colB[1] = inverted;
  colB[2] = 255;
  
  //console.log(cubeA, sideA, transform);
  //console.log(cubeB, sideB, inverted);
  this.bmp.set(sideA, cubeA - 1, colA);
  this.bmp.set(sideB, cubeB - 1, colB);
  this.map[cubeA * 6 + sideA - 5] = {cube: cubeB, transform: transform};
  this.map[cubeB * 6 + sideB - 5] = {cube: cubeA, transform: inverted};
  this.write();
};

MapMaker.prototype.write = function() {
  this.image.src = this.bmp.build();
};

MapMaker.prototype.listSaved = function() {
 return Object.keys(this.saved);
};

MapMaker.prototype.loadMap = function(mapname) {
 if (mapname in this.saved) {
  var save = this.saved[mapname];
  this.bmp = new BMPImage(6, save.size);
  this.map = {};
  save.data.forEach(function (entry) {
   if (entry.length == 3) {
    this.add(entry[0], entry[1], entry[2]);
   }
   else {
    this.add(entry[0], entry[1], entry[2], entry[3]);
   }
  }.bind(this));
 }
 return (mapname in this.saved);
};

MapMaker.prototype.saved = {
 "Basic Loop": {
  size: 2,
  data: [
   [1,4,2],
   [1,5,2,3],
  ],
 },

 "Order-5": {
  size: 11,
  data: [
   [1,0,2],
   [2,0,3,23],
   [3,0,4],
   [4,0,5,23],
   [5,0,6],
   [6,0,7,23],
   [7,0,8],
   [8,0,9,23],
   [9,0,10],
   [10,0,1,23],
   [1,3,11],
   [11,3,1],
  ],
 },

};
