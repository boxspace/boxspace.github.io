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
 return this.saved.map((save, index) => ++index + ". " + save.name);
};

MapMaker.prototype.loadMap = function(index) {
 if (0 <= --index && index < this.saved.length) {
  var save = this.saved[index];
  var size = save.data.map(entry => Math.max(entry[0], entry[2])).reduce((a, b) => Math.max(a, b));
  this.bmp = new BMPImage(6, size);
  this.map = {};
  save.data.forEach(function (entry) {
   if (entry.length == 3) {
    this.add(entry[0], entry[1], entry[2]);
   }
   else {
    this.add(entry[0], entry[1], entry[2], entry[3]);
   }
  }.bind(this));
  return true;
 }
 return false;
};

MapMaker.prototype.saved = [
 {
  name: "Basic Loop",
  data: [
   [1,4,2],
   [1,5,2,3],
  ],
 },

 {
  name: "Order-5",
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

 {
  name: "Boggled",
  data: [
   [1,4,1,1],
   [1,5,1,1],
   [1,0,2],
   [1,1,3],
   [2,4,3],
   [3,4,2],
   [2,2,4],
   [3,3,4],
   [4,0,4,3],
  ],
 },

 {
  name: "Upside Down",
  data: [
   [1, 4, 13, 5],
   [33, 0, 2],
   [2, 0, 3],
   [4, 0, 5],
   [5, 0, 6],
   [7, 0, 8],
   [8, 0, 9],
   [10, 0, 11],
   [11, 0, 12],
   [13, 0, 14],
   [14, 0, 15],
   [16, 0, 17],
   [17, 0, 18],
   [33, 4, 4],
   [4, 4, 7],
   [2, 4, 5],
   [5, 4, 8],
   [3, 4, 6],
   [6, 4, 9],
   [10, 4, 13],
   [13, 4, 16],
   [11, 4, 14],
   [14, 4, 17],
   [12, 4, 15],
   [15, 4, 18],
   [19, 4, 20],
   [20, 4, 21],
   [22, 4, 23],
   [23, 4, 24],
   [33, 2, 19],
   [19, 2, 10],
   [4, 2, 20],
   [7, 2, 21],
   [21, 2, 16],
   [3, 2, 22],
   [22, 2, 12],
   [6, 2, 23],
   [23, 2, 15],
   [9, 2, 24],
   [24, 2, 18],
   [8, 4, 25],
   [25, 4, 26, 23],
   [26, 4, 27, 23],
   [27, 4, 28],
   [28, 4, 17, 12],
   [11, 5, 29],
   [29, 5, 30, 23],
   [30, 5, 31, 23],
   [31, 5, 32],
   [32, 5, 2, 12],
  ],
 },

 {
  name: "Portals",
  data: [
   [1, 0, 2],
   [2, 0, 3],
   [10, 0, 11],
   [11, 0, 12],
   [16, 0, 17],
   [17, 0, 18],
   [1, 2, 10],
   [2, 2, 11],
   [3, 2, 12],
   [4, 2, 13],
   [5, 2, 15],
   [6, 2, 16],
   [7, 2, 18],
   [1, 4, 4],
   [4, 4, 6],
   [3, 4, 5],
   [5, 4, 7],
   [10, 4, 13],
   [13, 4, 16],
   [14, 4, 17],
   [12, 4, 15],
   [15, 4, 18],
   [3, 0, 8, 23],
   [8, 4, 17, 18],
   [14, 5, 9, 5],
   [9, 5, 13, 19],
   [6, 3, 7, 16],
  ],
 },

 {
  name: "Corridor",
  data: [
   [1, 0, 2],
   [2, 0, 3],
   [4, 0, 5],
   [5, 0, 6],
   [1, 4, 4],
   [2, 4, 5],
   [3, 4, 6],
   [4, 4, 7],
   [7, 4, 8],
   [8, 4, 9],
   [9, 4, 10],
   [10, 4, 11],
   [11, 4, 12],
   [12, 4, 13],
   [13, 4, 14],
   [14, 4, 15],
   [6, 4, 16],
   [16, 4, 17],
   [15, 0, 18],
   [18, 0, 17],
   [1, 2, 19],
   [3, 2, 20],
   [15, 2, 21],
   [17, 2, 22],
   [19, 2, 23],
   [20, 2, 24],
   [21, 2, 25],
   [22, 2, 26],
   [23, 0, 24],
   [25, 0, 26],
   [23, 4, 25],
   [24, 4, 26],
  ],
 },

 {
  name: "Missing Piece",
  data: [
   [2, 0, 1],
   [1, 0, 3],
   [3, 0, 4],
   [4, 0, 2],
   [5, 0, 6],
   [6, 0, 7],
   [7, 0, 5],
   [8, 0, 9],
   [9, 0, 10],
   [10, 0, 11],
   [11, 0, 8],
   [12, 0, 13],
   [13, 0, 14],
   [2, 4, 5],
   [5, 4, 8],
   [8, 4, 12],
   [12, 4, 2],
   [1, 4, 9],
   [9, 4, 13],
   [13, 4, 1],
   [3, 4, 6],
   [6, 4, 10],
   [10, 4, 14],
   [14, 4, 3],
   [4, 4, 7],
   [7, 4, 11],
  ],
 },

 {
  name: "Revolving Door",
  data: [
   [1, 4, 1, 23],
   [1, 1, 2, 18],
   [2, 4, 2, 23],
   [1, 2, 2],
  ],
 },

 {
  name: "2x2",
  data: [
   [1, 0, 2],
   [3, 0, 4],
   [5, 0, 6],
   [7, 0, 8],
   [1, 5, 3],
   [2, 5, 4],
   [6, 5, 8],
   [1, 2, 5],
   [2, 2, 6],
   [3, 2, 7],
   [4, 2, 8],
   [2, 4, 5, 4],
   [6, 2, 5, 6],
   [4, 3, 8, 4],
   [7, 1, 3, 6],
  ],
 },

];
