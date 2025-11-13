// square.js
window.onload = function init() {
// Get canvas and GL context
const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL isn't available");
    return;
}

// Configure WebGL
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Create and compile shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader, document.getElementById("vertex-shader").text);
gl.shaderSource(fragmentShader, document.getElementById("fragment-shader").text);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

// Create program and link shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Define vertices for a square
const vertices = [
-0.5, -0.5,
0.5, -0.5,
0.5, 0.5,
-0.5, 0.5
];

// Create and bind buffer
const bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
gl.STATIC_DRAW);

// Set up attribute
const vPosition = gl.getAttribLocation(program, "vPosition");
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

// Render
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};