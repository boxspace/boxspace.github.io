precision mediump float;

attribute vec2 points;

varying vec2 coord;

void main() {
    coord = points * .5 + .5;
    gl_Position = vec4(points, 0., 1.);
}
