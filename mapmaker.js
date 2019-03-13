function MapMaker(img, size) {
  this.bmp = new BMPImage(6, size);
  this.image = img;
  this.map = {};
  MapMaker.inst = this;
}

MapMaker.prototype.inverted = [0, 2, 1, 15, 4, 23, 6, 14, 19, 9, 10, 11, 12, 20, 7, 3, 22, 17, 18, 8, 13, 21, 16, 5]

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
}

MapMaker.prototype.get = function(cubeA, sideA) {
 return this.map[cubeA * 6 + sideA - 5];
}

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
}

MapMaker.prototype.write = function() {
  this.image.src = this.bmp.build();
}
