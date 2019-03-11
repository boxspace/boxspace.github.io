function BMPImage(w, h) {
  this.w = w;
  this.h = h;
  this.row = 4 * Math.ceil(this.w * 0.75);
  this.comp = this.row * this.h;
  this.size = this.comp + 54;
  this.data = new Array(this.h).fill("\0".repeat(this.row));
}

BMPImage.prototype.chr = function(h, s) {
  var out = "";
  for (var i = 0; i < s; i++) {
    out += String.fromCharCode(h & 255);
    h >>= 8;
  }
  return out;
}

BMPImage.prototype.build = function() {
  return "data:image/bmp;base64," + btoa(["\x42\x4D",
    this.chr(this.size, 4),
    "\x00\x00\x00\x00\x36\x00\x00\x00\x28\x00\x00\x00",
    this.chr(this.w, 4),
    this.chr(this.h, 4),
    "\x01\x00\x18\x00\x00\x00\x00\x00",
    this.chr(this.comp, 4),
    "\x13\x0B\x00\x00\x13\x0B\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",
  ].concat(this.data).join(""));
}

BMPImage.prototype.set = function(x, y, col) {
  var row = this.data[y % this.h];
  var addr = (x % this.w) * 3;
  this.data[y % this.h] = row.substring(0, addr) + this.chr(col[2], 1) + this.chr(col[1], 1) + this.chr(col[0], 1) + row.substring(addr + 3);
}

BMPImage.prototype.get = function(x, y) {
  var row = this.data[y % this.h];
  var addr = (x % this.w) * 3;
  return [row.charCodeAt(addr + 2), row.charCodeAt(addr + 1), row.charCodeAt(addr)];
}
