"use strict";

var gl;
var points = [];
var colors = [];

var theta = 0.0;
var uMVPLoc;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); return; }

    createCube();

    // --- WebGL setup ---
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // --- Load shaders (from HTML script tags) ---
    var program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    // --- Position buffer ---
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // --- Color buffer ---
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

    // --- MVP uniform ---
    uMVPLoc = gl.getUniformLocation(program, "uMVP");

    render();
};


// ======================================================
//   3D RGB Cube Construction
// ======================================================
function createCube()
{
    var vertices = [
        vec3(-0.5, -0.5, -0.5), // 0
        vec3( 0.5, -0.5, -0.5), // 1
        vec3( 0.5,  0.5, -0.5), // 2
        vec3(-0.5,  0.5, -0.5), // 3
        vec3(-0.5, -0.5,  0.5), // 4
        vec3( 0.5, -0.5,  0.5), // 5
        vec3( 0.5,  0.5,  0.5), // 6
        vec3(-0.5,  0.5,  0.5)  // 7
    ];

    function colorFromPosition(p) {
        return vec3(p[0] + 0.5, p[1] + 0.5, p[2] + 0.5);
    }

    function quad(a, b, c, d) {
        var va = vertices[a], vb = vertices[b], vc = vertices[c], vd = vertices[d];
        var ca = colorFromPosition(va), cb = colorFromPosition(vb),
            cc = colorFromPosition(vc), cd = colorFromPosition(vd);

        // Triangle 1
        points.push(va); colors.push(ca);
        points.push(vb); colors.push(cb);
        points.push(vc); colors.push(cc);

        // Triangle 2
        points.push(va); colors.push(ca);
        points.push(vc); colors.push(cc);
        points.push(vd); colors.push(cd);
    }

    quad(4, 5, 6, 7); // Front
    quad(0, 1, 2, 3); // Back
    quad(0, 4, 7, 3); // Left
    quad(1, 5, 6, 2); // Right
    quad(0, 1, 5, 4); // Bottom
    quad(3, 2, 6, 7); // Top
}


// ======================================================
//   Rotation Matrix (Model Matrix in clip-space)
// ======================================================
function createMVP(theta)
{
    function rad(d) { return d * Math.PI / 180.0; }

    var ax = rad(30.0);  // tilt downward
    var ay = theta;      // spin around Y

    var cx = Math.cos(ax), sx = Math.sin(ax);
    var cy = Math.cos(ay), sy = Math.sin(ay);

    return new Float32Array([
         cy,      sx*sy,    -cx*sy,   0.0,
         0.0,     cx,        sx,      0.0,
         sy,     -sx*cy,     cx*cy,   0.0,
         0.0,     0.0,       0.0,     1.0
    ]);
}


//   Render Loop
function render()
{
    theta += 0.02;
    var mvp = createMVP(theta);
    gl.uniformMatrix4fv(uMVPLoc, false, mvp);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    requestAnimationFrame(render);
}