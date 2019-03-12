precision highp float;
uniform float maxDist;
uniform int currCube;
uniform vec3 currPos;
uniform vec3 right;
uniform vec3 up;
uniform vec3 facing;
uniform float theta;
uniform float phi;
uniform float fov;

uniform sampler2D tex;
uniform sampler2D mapImg;
uniform vec2 mapSize;
uniform float time;
uniform vec2 resolution;

uniform int tintCubeA;
uniform int tintSideA;
uniform int tintCubeB;
uniform int tintSideB;
uniform vec3 tintColor;

const vec3 fogColor = vec3(0.6, 0.5, 0.5);
const int maxIter = 100;

highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float getLinks(int cube, int side)
{
    float cb = float(cube);
    float sd = float(side);
    vec2 loc = vec2(mod(cb * 3. + floor(sd / 2.), mapSize.x), floor(cb * 3. / mapSize.x));
    vec2 lc = (floor(loc) + .5) / mapSize;
    vec2 d = texture2D(mapImg, lc).rb * 256.;
    //d = lc * 1000.;
    //d = loc;
    return floor(mix(d.x, d.y, mod(sd, 2.)));
    //return links[cube * 6 + side];
}

float getTrans(int cube, int side)
{
    float cb = float(cube);
    float sd = float(side);
    vec2 loc = vec2(mod(cb * 3. + floor(sd / 2.), mapSize.x), floor(cb * 3. / mapSize.x));
    vec2 lc = (floor(loc) + .5) / mapSize;
    vec2 d = texture2D(mapImg, lc).ga * 256.;
    d.y -= 1.;
    //d = lc * 1000.;
    //d = loc;
    return floor(mix(d.x, d.y, mod(sd, 2.)));
    //return trans[cube * 6 + side];
    //return 0.;
}

vec3 wall(vec3 v)
{
    return vec3(1., 1., 1.) * sqrt(sqrt(1. - max(max(abs(v.x), abs(v.y)), abs(v.z)) * 2.));
}

vec3 twistr(vec3 v, float id)
{
    vec3 u = v;
    float a = mod(id, 3.);
    float b = mod(floor(id / 3.), 2.);
    float c = mod(floor(id / 6.), 2.);
    float d = mod(floor(id / 12.), 2.);
    
    u = mix(u, u.yzx, min(a, 1.));
    u = mix(u, u.yzx, max(a - 1., 0.));
    u.yz = mix(u.yz, vec2(u.z, -u.y), b);
    u.xy *= 1. - 2. * c;
    u.yz *= 1. - 2. * d;
    
    return u;
}

vec3 raycast(int startC, vec3 startPos, vec3 startDir, float startDist)
{
    int c = startC;
    vec3 pos = startPos;
    vec3 dir = startDir;
    float dist = startDist;
    vec4 tint = vec4(0.);
    for (int i=0;i<maxIter;i++) {
        if (i >= int(maxDist * sqrt(3.)) + 3) break;
        float bestDist = 4.;
        vec3 bestSide = vec3(0., 0., 0.);
        vec3 trialDist;
        vec3 trialSide;
        
        vec3 objPos = startPos;
        int objC = startC;
        float t = -1. * dot(pos - objPos, dir);
        if (c == objC && t > 0. && (i > 0 || length(pos - objPos) > .1) && length(pos - objPos + t * dir) < .1) {
            bestDist = t;
            return mix(vec3(0., length(pos - objPos + t * dir) / .1, 0.), fogColor, sqrt(min(2. * (dist + bestDist) / maxDist, 1.)));
        }
        
        trialSide = sign(dir);
        trialDist = (trialSide * .5 - pos) / dir;
        bestSide = vec3(sign(min(trialDist.z, trialDist.y) - trialDist.x),
                        sign(min(trialDist.x, trialDist.z) - trialDist.y),
                        sign(min(trialDist.y, trialDist.x) - trialDist.z));
        bestSide = bestSide * .5 + .5;
        bestDist = bestSide.x * trialDist.x + bestSide.y * trialDist.y + bestSide.z * trialDist.z;
        bestSide *= trialSide;
        
        //if (max(max(abs(pos.x), abs(pos.y)), abs(pos.z)) > .5) return vec3(1., 1., 0.);
        //if (bestDist > .75) return vec2(0., 1.).yyx;
        
        int offset = int(0.5 * bestSide.x * bestSide.x - .5 * bestSide.x)
                   + int(2.5 * bestSide.y * bestSide.y - .5 * bestSide.y)
                   + int(4.5 * bestSide.z * bestSide.z - .5 * bestSide.z);
        
        int next = int(getLinks(c, offset) - 1.);
        pos = pos + bestDist * dir;
        
        if (bestDist > .8) {}
        if (c == tintCubeA - 1 && offset == tintSideA) tint = vec4(mix(tintColor.rgb, tint.rgb, tint.a), 1. - (1. - tint.a) * (1. - .3));
        if (c == tintCubeB - 1 && offset == tintSideB) tint = vec4(mix(tintColor.rgb, tint.rgb, tint.a), 1. - (1. - tint.a) * (1. - .3));
        if (rand(vec2(next * 6 + offset, floor(time))) < 1.5 && next == -1 || dist + bestDist > maxDist)
        {
            //return vec3(1. - clamp((dist + bestDist) / maxDist, 0., 1.));
            //return bestSide * .5 + .5;
            tint.rgb = vec3(1.);
            //if (c * (c - 4) * (c - 5) == 0 || (c - 6) * (c - 8) * (c - 12) == 0) tint.rgb = vec3(1., .5, 0.);
            //float d = mod(float(c), 4.);
            //if (d < 2.) tint.rgb = vec3(1., .5, 0.);
            //else tint.rgb = vec3(0., .5, 1.);
            tint.a = .5;
            vec3 col = mix(mix(vec3(1.), tint.rgb, tint.a) * wall(pos * (1. - abs(bestSide))), fogColor, sqrt(min(2. * (dist + bestDist) / maxDist, 1.)));
            return col;
            //return mix(mix(vec3(1.) * wall(pos * (1. - abs(bestSide))), fogColor, sqrt(min(2. * (dist + bestDist) / maxDist, 1.))), vec3(1., 1., 0.), clamp(startPos.x - 0.4) * 50., 0., 1.));
        }
        
        pos -= bestSide;
        vec3 proj = pos + dir;
        pos = twistr(pos, getTrans(c, offset));
        proj = twistr(proj, getTrans(c, offset));
        dir = proj - pos;
        dist = dist + bestDist;
        c = next;
    }
    return fogColor;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - .5 * resolution) / resolution.y + .000001;
    //gl_FragColor = 40. * (texture2D(mapImg, (floor(uv * mapSize) + .5) / mapSize));
    //gl_FragColor.a = 1. + sin(time) * -0.;
    //return;
    //initArray();
    float viewRad = tan(fov * asin(1.) / 180.);
    vec3 cam = normalize(vec3(viewRad * 2. * uv, 1.));  // .5
    cam *= mat3(1., 0., 0., 
                0., cos(phi), sin(phi), 
                0., -sin(phi), cos(phi));
    cam *= mat3(cos(theta), 0., sin(theta), 
                0., 1., 0., 
               -sin(theta), 0., cos(theta));
    mat3 view = mat3(right, up, facing);
    mat3 view2 = view;
    //for (int i = 0; i < 22; i++) view *= view2;
    cam *= view;
    vec3 col = raycast(currCube - 1, currPos, cam, 0.);
    gl_FragColor = vec4(col, 1.);
}

