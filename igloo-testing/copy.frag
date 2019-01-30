precision mediump float;

#define rot(A) mat2(cos(A), -sin(A), sin(A), cos(A))

varying vec2 coord;

uniform float time;
uniform sampler2D image;

void main() {
    vec2 uv = coord * 1.03;
    uv -= .5;
    uv *= rot(asin(1.) * -.04);
    uv *= 1.03;
    //uv *= 0.95;
    uv += .5;
    gl_FragColor = texture2D(image, coord) - texture2D(image, uv) * 0.05;
    //gl_FragColor = mix(texture2D(image, coord), texture2D(image, uv), .05);
    gl_FragColor.a = 1.;
}
