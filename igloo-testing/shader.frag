precision mediump float;

varying vec2 coord;

uniform float time;
uniform sampler2D image;

void main() {
    gl_FragColor = texture2D(image, coord);
}
