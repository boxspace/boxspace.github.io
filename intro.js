const myUniforms = [
 "resolution",
 "time",
];

function setupUniforms(gl, uniforms, vars) {
 const canvas = document.getElementById("canvas");
 gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
 gl.uniform1f(uniforms.time, vars.time);
}

function updateUniforms(gl, uniforms, vars) {
 gl.uniform1f(uniforms.time, vars.time);
}

////////////////////////////////////////////////////////////////////////////////

function main() {
 const canvas = document.getElementById("canvas");
 
 // Initialize WebGL rendering context
 const gl = canvas.getContext("webgl");
 if (!gl) {
  alert("WebGL initialization failed.  Please check if your browser supports it.");
  return;
 }
 
 const shaderProgram = initShaderProgram(gl);
 const posBuffer = initBuffer(gl);
 
 const uniforms = initUniforms(gl, shaderProgram, myUniforms);
 const program = {
  program: shaderProgram,
  vertices: gl.getAttribLocation(shaderProgram, "vPosition"),
  posBuffer: posBuffer
 };
 
 prepareScene(gl, program, uniforms);
 
 const vars = {"time": 0, "dt": 0};
 setupUniforms(gl, uniforms, vars);
 
 function render(elapsed) {
  vars.dt = elapsed / 1000 - vars.time;
  vars.time = elapsed / 1000;
  
  updateUniforms(gl, uniforms, vars);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
 }
 requestAnimationFrame(render);

}

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

function prepareScene(gl, program, uniforms) {
 // Clear screen
 gl.clearColor(0.0, 0.0, 0.0, 1.0);
 gl.clearDepth(1.0);

 // Setup vertex position attribute as vec2
 gl.vertexAttribPointer(program.vertices, 2, gl.FLOAT, false, 0, 0);
 gl.enableVertexAttribArray(program.vertices);
 
 // Set shader program
 gl.useProgram(program.program);
 
 // Set uniforms
 const canvas = document.getElementById("canvas"); 
}

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
