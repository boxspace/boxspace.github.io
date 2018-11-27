const fsh_src = `
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform sampler2D tex;

void main() {
    vec2 uv = fract((gl_FragCoord.xy - mouse) / resolution);
    gl_FragColor = vec4(uv, sin(time) * .5 + .5, 1.0);
    gl_FragColor = mix(gl_FragColor, texture2D(tex, uv), .5);
}
`;

const vsh_src = `
precision highp float;

attribute vec4 vPosition;

void main() {
    gl_Position = vPosition;
}
`;
