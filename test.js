const vsh_src = `
precision highp float;

attribute vec4 vPosition;

void main() {
    gl_Position = vPosition.xyzw;
}
`;

const fsh_src = `
precision highp float; 

#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))
#define rotX(a) mat3(1, 0, 0, 0, cos(a), -sin(a), 0, sin(a), cos(a))
#define rotY(a) mat3(cos(a), 0, -sin(a), 0, 1, 0, sin(a), 0, cos(a))
#define rotZ(a) mat3(cos(a), -sin(a), 0, sin(a), cos(a), 0, 0, 0, 1)

const float PI = asin(1.) * 2.;
const float EPSILON = 0.01;
const float FAR = 12.;
uniform float time;
uniform vec2 resolution;
uniform float rightEye;
uniform vec3 rotation;

 float df_sphere(vec3 p, float s) { return length(p) - s; }

float scene(vec3 p) { 
 float d = FAR;
 d = min(d, df_sphere(p + vec3(0., .5, 0.), 1.));
 d = min(d, df_sphere(p + vec3(0., -.5, -2.), .5));
 d = min(d, df_sphere(p + vec3(-sqrt(3.), -.5, 1.), .5));
 d = min(d, df_sphere(p + vec3(sqrt(3.), -.5, 1.), .5));
 return d;
}

float lighting(vec3 p, vec3 src) {
 vec3 e = normalize(src - p) * EPSILON / 2.;
 return (scene(p + e) - scene(p - e)) / EPSILON;
}

vec4 main2() {
 vec2 uv = gl_FragCoord.xy / resolution.xy * vec2(3., 1.);
 vec3 n = vec3(0.);
 if (uv.x < 1.) n.x = rotation.x / 360. + .5;
 if (uv.x > 1. && uv.x < 2.) n.y = rotation.y / 180. + .5;
 if (uv.x > 2.) n.z = rotation.z / 360.;
 //n = mix(n, rotation.y, step(1., uv.x));
 //n = mix(n, rotation.z, step(2., uv.x));
 return vec4(step(vec3(uv.y), n), 1.);
}

void main() {
 gl_FragColor = vec2(0., 1.).xxxy;
 gl_FragColor = main2();
 //if (mod(gl_FragCoord.x+gl_FragCoord.y, 6.)>1.) return;
 
 //vec2 uv = 0.8 * vec2(1.5, -1.) * ((gl_FragCoord.xy / resolution) - .5) * resolution / resolution.x + .5;
 vec2 uv = 0.8 * vec2(1.5, -1.) * ((gl_FragCoord.yx / resolution.yx) - .5) * resolution.yx / resolution.y + .5;
 uv = uv * vec2(2., 1.);
 if (uv.x > 1.) uv.x -= 1.;
 //if (abs(uv.x - 1.) > 1.) return;
 float which = step(uv.y, .5);
 vec3 cam = vec3(0., 0., -5. - 5. * which);
 vec3 tgt = vec3(0., 0., 0.);
 
 //cam.yz *= rot(-cos(time / 2. + 2. * which) * PI / 6. + PI / 6. * which);
 //cam.xz *= rot(time * (2. * which - 1.));
 //vec3 front = normalize(tgt - cam);
 //vec3 right = normalize(cross(front, vec3(0., 1., 0.)));
 //vec3 up = cross(right, front);

 vec3 one = vec3(0, 1, -1);
 float pi = 2. * asin(1.);
 float rad = pi / 180.;
 vec3 right, up, front;
 right = one.yxx;
 up    = one.xyx;
 front = one.xxy;
 mat3 psp = mat3(right, up, front);

 //psp *= rotZ(rotation.y * rad);
 //psp *= rotX(-rotation.z * rad);
 //psp *= rotX(-pi / 2.);
 //psp *= rotY(rotation.x * rad);
 
 //cam.yz *= rot(-pi / 2.);
 right = one.yxx;
 up = one.xyx;
 front = one.xxy;
 psp = mat3(right, up, front);
 //psp *= rotX(rotation.x * rad);
 //psp *= rotY(rotation.y * rad);
 //psp *= rotZ(-rotation.z * rad);
 
 psp *= rotZ(rotation.y * sign(rotation.z) * rad + pi * sign(rotation.z));
 psp *= rotX(-rotation.z * rad);
 psp *= rotX(pi / 2.);
 psp *= rotY(-rotation.x * rad);

 cam *= psp;
 front *= psp;
 right *= psp;
 up    *= psp;
 
 uv = (uv * vec2(1., 2.)) - .5;
 uv.y = fract(uv.y + .5) - .5;
 vec3 dir = normalize(front * 1. + right * uv.x + up * uv.y);
 float eye = step(gl_FragCoord.x, resolution.x * .5) - .5;
 //float eye = step(gl_FragCoord.y, resolution.y * .5) - .5;
 eye *= -0.5;
 cam += right * eye;
 float dist = 0.;
 float d = 0.;
 for (int i = 0; i < 30; i++) {
  d = scene(cam + dist * dir);
  dist += d;
  if (d < EPSILON || dist > FAR) break;
 }
 float n = 0.;
 if (d < EPSILON) {
  n = max(0., lighting(cam + dist * dir, vec3(-4.))) + .2;
 }
 //float n = 1. - .2 * dist;
 vec4 col = vec2(n, 1.).xxxy;
 if (length(cam + dist * dir + vec3(0., .5, 0.)) > 1. + EPSILON) col.rg *= .5;
 else col.gb *= .5; //gl_FragColor = vec4(uv.x, 0., uv.y, 1.); //gl_FragColor.rgb = 1. - clamp(gl_FragColor.rgb, vec3(0.), vec3(1.)) * 1.;
 gl_FragColor = mix(col, gl_FragColor, .25);
 gl_FragColor.a = 1.;
}
`;
