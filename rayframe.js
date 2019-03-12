// Name uniforms here, appear as fields in uniforms object from initUniforms()
const myUniforms = [
 "resolution",
 //"time",
 "mouse",
 "tex",
 
 "maxDist",
 "currCube",
 "currPos",
 "right",
 "up",
 "facing",
 "theta",
 
 "phi",
 "fov",
 
 "mapImg",
 "mapSize",
 "time",
 
 "tintCubeA",
 "tintSideA",
 "tintCubeB",
 "tintSideB",
 "tintColor",
];

// Store variables here, used in setting uniforms below
const vars = {
 time: 0,
 dt: 0,
 mouse: {x: 0, y: 0},
 
 maxDist: 10,
 currCube: 1,
 currPos: {x: 0, y: 0, z: 0},
 right: {x: 1, y: 0, z: 0},
 up: {x: 0, y: 1, z: 0},
 facing: {x: 0, y: 0, z: 1},
 theta: 0,
 phi: 0,
 fov: 100,
 
 mapImg: -1,
 mapSize: {x: 0, y: 0},
 time: 0,
 
 tintCubeA: -1,
 tintSideA: -1,
 tintCubeB: -1,
 tintSideB: -1,
 tintColor: {r: 1, g: 0, b: 1},
};



const bindings = {
 Xpos: ["KeyD", "ArrowRight"],
 Xneg: ["KeyA", "ArrowLeft"],
 Ypos: ["KeyQ", "Space", "Slash"],
 Yneg: ["KeyE", "LeftShift", "RightShift"],
 Zpos: ["KeyW", "ArrowUp"],
 Zneg: ["KeyS", "ArrowDown"],
};

const keys = {};



// Sets uniforms at start of program
function updateUniforms(gl, uniforms, vars) {
 gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
 gl.uniform1f(uniforms.time, vars.time);
 gl.uniform2f(uniforms.mouse, vars.mouse.x, -vars.mouse.y);
 gl.uniform1i(uniforms.tex, 0);
 
 gl.uniform1f(uniforms.maxDist, vars.maxDist);
 gl.uniform1i(uniforms.currCube, vars.currCube);
 gl.uniform3f(uniforms.currPos, vars.currPos.x, vars.currPos.y, vars.currPos.z);
 gl.uniform3f(uniforms.right, vars.right.x, vars.right.y, vars.right.z);
 gl.uniform3f(uniforms.up, vars.up.x, vars.up.y, vars.up.z);
 gl.uniform3f(uniforms.facing, vars.facing.x, vars.facing.y, vars.facing.z);
 gl.uniform1f(uniforms.theta, vars.theta);
 gl.uniform1f(uniforms.phi, vars.phi);
 gl.uniform1f(uniforms.fov, vars.fov);
 
 gl.uniform1i(uniforms.mapImg, 0); 
 gl.uniform2f(uniforms.mapSize, vars.mapSize.x, vars.mapSize.y);
 gl.uniform1f(uniforms.time, vars.time);
 
 gl.uniform1i(uniforms.tintCubeA, vars.tintCubeA);
 gl.uniform1i(uniforms.tintSideA, vars.tintSideA);
 gl.uniform1i(uniforms.tintCubeB, vars.tintCubeB);
 gl.uniform1i(uniforms.tintSideB, vars.tintSideB);
 gl.uniform3f(uniforms.tintColor, vars.tintColor.r, vars.tintColor.g, vars.tintColor.b);
}



function updateVars() {
 
}



////////////////////////////////////////////////////////////////////////////////



// Call when page loads
function main() {
 const canvas = document.getElementById("canvas");
 
 // Initialize WebGL rendering context
 const gl = canvas.getContext("webgl");
 if (!gl) {
  alert("WebGL initialization failed.  Please check if your browser supports it.");
  return;
 }
 
 // Initialize shader program and position buffer
 const shaderProgram = initShaderProgram(gl);
 const posBuffer = initBuffer(gl);
 
 // Initialize textures
 const texture = initTexture(gl);
 
 // Initialize framebuffer
 const framebuffer = initFramebuffer(gl, texture);
 
 // Setup shader program with uniforms and vertices
 const uniforms = initUniforms(gl, shaderProgram, myUniforms);
 const program = {
  program: shaderProgram,
  vertices: gl.getAttribLocation(shaderProgram, "vPosition"),
  posBuffer: posBuffer
 }; 
 prepareScene(gl, program, uniforms);
 
 
 // Setup uniform values
 updateUniforms(gl, uniforms, vars);
 
 // Resize canvas to proper size
 resize();
 
 // Render loop
 function render(elapsed) {
  // Calculate time values
  vars.dt = elapsed / 1000 - vars.time;
  vars.time = elapsed / 1000;
  
  // Update uniform values
  updateUniforms(gl, uniforms, vars);
  
  // Render to framebuffer
  targetFramebuffer(gl, framebuffer, texture);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  //requestAnimationFrame(render);
  
  // Render to screen
  targetScene(gl, texture);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
 }
 // Loop
 requestAnimationFrame(render);
 
 // Add fullscreen
 fullScreen();
}



//
function fullScreen() {
 const canvas = document.getElementById("canvas");
 
 // Add resize listener to dynamically scale window to full size
 window.onresize = resize;
 
 // Find available fullscreen and pointerlock methods
 canvas.requestFullscreen = canvas.requestFullscreen ||
                            canvas.mozRequestFullScreen ||
                            canvas.webkitRequestFullscreen;
 
 document.exitFullscreen = document.exitFullscreen ||
                           document.mozCancelFullScreen ||
                           document.webkitExitFullscreen;
 
 canvas.requestPointerLock = canvas.requestPointerLock ||
                             canvas.mozRequestPointerLock ||
                             canvas.webkitRequestPointerLock;
 
 document.exitPointerLock = document.exitPointerLock ||
                            document.mozExitPointerLock ||
                            document.webkitExitPointerLock;
 
 // Add pointer lock listener
 document.addEventListener('pointerlockchange', pointerLockChange, false);
 document.addEventListener('mozpointerlockchange', pointerLockChange, false);
 document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
 
 // Add mouse listener
 document.addEventListener("mousemove", onmousemove, false);
 
 // Add keyboard listener
 document.addEventListener("keydown", onkeydown, false);
 document.addEventListener("keyup", onkeyup, false);
 
 // Fullscreen and pointer lock on click
 canvas.onclick = function() {
  canvas.requestFullscreen();
  canvas.onmousemove = canvas.requestPointerLock;
 }
}

function resize() {
 const canvas = document.getElementById("canvas");
 const gl = canvas.getContext("webgl");
  
 // Set canvas resolution to window size
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
 
 // Resize canvas to window size
 canvas.style.width = window.innerWidth + "px";
 canvas.style.height = window.innerHeight + "px";
 
 gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}

function pointerLockChange(ev) {
 // Check if pointer just locked or unlocked
 console.log("Pointer lock change: " + (document.pointerLockElement == canvas));
}

function onmousemove(event) {
 //console.log(event.movementX + " " + event.movementY);
 vars.mouse.x += event.movementX;
 vars.mouse.y += event.movementY;
 
 vars.theta += 6.28 * event.movementX / window.innerWidth;
 vars.phi -= 1.57 * event.movementY / window.innerHeight;
 vars.phi = Math.max(-1.57, Math.min(1.57, vars.phi));
}

function onkeydown(event) {
 keys[event.code] = true;
}

function onkeyup(event) {
 keys[event.code] = false;
}



////////////////////////////////////////////////////////////////////////////////



// Helper for linking shader programs
function initShaderProgram(gl) {
 const vsh = loadShader(gl, gl.VERTEX_SHADER, vsh_src);
 const fsh = loadShader(gl, gl.FRAGMENT_SHADER, fsh_src);

 // Create the shader program
 const shaderProgram = gl.createProgram();
 gl.attachShader(shaderProgram, vsh);
 gl.attachShader(shaderProgram, fsh);
 gl.linkProgram(shaderProgram);

 // Check for errors in setup
 if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
   alert('Shader program initialization failed: ' + gl.getProgramInfoLog(shaderProgram));
   return;
 }
 
 return shaderProgram;
}



// Helper for compiling shader source
function loadShader(gl, type, src) {
 const shader = gl.createShader(type);
 
 // Compile shader
 gl.shaderSource(shader, src);
 gl.compileShader(shader);
 
 // Check for errors
 if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
 return null;
 }
 
 return shader;
}



// Helper for initializing position buffer
function initBuffer(gl) {
  // Create a buffer for the square's positions.
 const positionBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
 // Now create an array of positions for the square.
 const positions = [
   1.0,  1.0,
  -1.0,  1.0,
   1.0, -1.0,
  -1.0, -1.0,
 ];
 
 gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(positions),
  gl.STATIC_DRAW);
 
 return positionBuffer;
}



// Helper for adding texture
function initTexture(gl) {
 const texture = gl.createTexture();
 gl.activeTexture(gl.TEXTURE0);
 gl.bindTexture(gl.TEXTURE_2D, texture);
 
 const img = new Image();
 img.onload = function() {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  vars.mapSize.x = img.width;
  vars.mapSize.y = img.height;
 }
 
 img.map = new MapMaker(img);
 img.map.add(1, 4, 2);
 img.map.add(1, 5, 2, 3);
 
 return texture;
}



function initFramebuffer(gl, texture) {
 // Create it
 const frameBuffer = gl.createFramebuffer();
 
 // Bind it
 gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
 
 // Attach it
 gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  texture, 
  0);
}



function targetFramebuffer(gl, framebuffer, texture) {
 // Render to the framebuffer
 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
 
 // Use given texture as input
 gl.bindTexture(gl.TEXTURE_2D, texture);
 
 // Change the clipping to match the canvas size
 gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}



function targetScene(gl, texture) {
 // Render to the canvas
 //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
 // Use given texture as input
 gl.bindTexture(gl.TEXTURE_2D, texture);
 
 // Change the clipping to match the canvas size
 gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}



// Helper for finishing setup for rendering
function prepareScene(gl, program, uniforms) {
 // Clear screen
 gl.clearColor(0.0, 0.0, 0.0, 1.0);
 gl.clearDepth(1.0);

 // Setup vertex position attribute as vec2
 gl.vertexAttribPointer(program.vertices, 2, gl.FLOAT, false, 0, 0);
 gl.enableVertexAttribArray(program.vertices);
 
 // Set shader program
 gl.useProgram(program.program);
}



// Helper for initializing uniforms
function initUniforms(gl, shaderProgram, uniformNames) {
 var uniforms = {};
 var location;
 for (var i = 0; i < uniformNames.length; i++) {
  location = gl.getUniformLocation(shaderProgram, uniformNames[i]);
  if (location == -1) {
   alert("Uniform not found: " + uniformName);
  } else {
   uniforms[uniformNames[i]] = location;
  }
 }
 return uniforms;
}
