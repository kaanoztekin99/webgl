"use strict";

var gl;
var points = [];
var colors = [];
var NumPoints = 5000;

window.onload = function init() {

    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) { alert("WebGL not available"); }

    //------------------------------------------
    // 1. THREE VERTICES OF THE TRIANGLE
    //------------------------------------------
    var vertices = [
        vec2(-1, -1),
        vec2( 0,  1),
        vec2( 1, -1)
    ];

    //------------------------------------------
    // 2. RANDOM START POINT (Barycentric)
    //------------------------------------------
    var coeff = vec3(Math.random(), Math.random(), Math.random());
    coeff = normalize(coeff);

    var p = add(
        scale(coeff[0], vertices[0]),
        add(scale(coeff[1], vertices[1]),
            scale(coeff[2], vertices[2]))
    );

    points.push(p);
    colors.push(vec3(0.0, 0.0, 1.0));   // first point → blue

    //------------------------------------------
    // ITERATION-BASED COLOR:It is the sequence number indicating which point 
    // was produced first and which point was produced later in the fractal formation process.
    // First points → blue
    // Middle points → purple
    // Last points → red
    //------------------------------------------
    var r = 0.5;  // fixed contraction factor

    for (var i = 0; points.length < NumPoints; i++) {

        var j = Math.floor(Math.random() * 3);

        p = add(points[i], vertices[j]);
        p = scale(r, p);

        points.push(p);

        // ---- ITERATION-BASED COLOR ----
        var t = points.length / NumPoints;
        colors.push(vec3(t, 0.0, 1.0 - t));
    }

    //------------------------------------------
    // 4. WEBGL SETUP
    //------------------------------------------
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl,
        "shaders/vshader_color.glsl",
        "shaders/fshader_color.glsl");

    gl.useProgram(program);

    //------------------------------------------
    // 5. LOAD POSITION BUFFER
    //------------------------------------------
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    //------------------------------------------
    // 6. LOAD COLOR BUFFER
    //------------------------------------------
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);
}