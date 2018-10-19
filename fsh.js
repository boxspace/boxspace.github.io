const fsh_src = `
precision highp float;

uniform vec2 resolution;
uniform float time;

void main() {
    gl_FragColor = vec4(gl_FragCoord.xy / resolution, sin(time) * .5 + .5, 1.0);
}
`;

const vsh_src = `
precision highp float;

attribute vec4 vPosition;

void main() {
    gl_Position = vPosition;
}
`;
