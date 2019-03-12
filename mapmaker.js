function MapMaker(img) {
  this.bmp = new BMPImage(6, 3);
  this.image = img;
  MapMaker.inst = this;
}

MapMaker.prototype.inverted = [0, 2, 1, 15, 4, 23, 6, 14, 19, 9, 10, 11, 12, 20, 7, 3, 22, 17, 18, 8, 13, 21, 16, 5]

MapMaker.prototype.twistr = function(v, id) {
  a = id % 3;
  b = Math.floor(id / 3) % 2;
  c = Math.floor(id / 6) % 2;
  d = Math.floor(id / 12) % 2;
  
  v = (a == 1) ? [v[1], v[2], v[0]] : v;
  v = (a == 2) ? [v[2], v[0], v[1]] : v;
  v = (b == 1) ? [v[0], v[2], -v[1]] : v;
  v = (c == 1) ? [-v[0], -v[1], v[2]] : v;
  v = (d == 1) ? [v[0], -v[1], -v[2]] : v;
  return v;
}

MapMaker.prototype.add = function(cubeA, sideA, cubeB, transform) {
  transform = (transform == null) ? 0 : transform;
  var inverted = this.inverted[transform];
  var sign = 1 - 2 * (sideA % 2);
  sign = -1 * sign;  // get opposite side
  var testVec = [
    sideA == 0 || sideA == 1 ? sign : 0,
    sideA == 2 || sideA == 3 ? sign : 0,
    sideA == 4 || sideA == 5 ? sign : 0,
  ];
  console.log("Before: " + testVec);
  testVec = this.twistr(testVec, transform);
  console.log("After: " + testVec);
  sideB = 0.5 * (testVec[0] * (1 * testVec[0] - 1) + testVec[1] * (5 * testVec[1] - 1) + testVec[2] * (9 * testVec[2] - 1));
  var colA = this.bmp.get(sideA, cubeA - 1);
  var colB = this.bmp.get(sideB, cubeB - 1);
  colA[0] = cubeB;
  colA[1] = transform;
  colA[2] = 127;
  colB[0] = cubeA;
  colB[1] = inverted;
  colB[2] = 255;
  console.log(cubeA, sideA, transform);
  console.log(cubeB, sideB, inverted);
  this.bmp.set(sideA, cubeA - 1, colA);
  this.bmp.set(sideB, cubeB - 1, colB);
}

MapMaker.prototype.write = function() {
  this.image.src = this.bmp.build();
}
