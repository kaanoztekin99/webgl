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
    if (!gl) { alert("WebGL isn't available"); }

    createCube();

    // WebGL setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // shaders
    var program = initShaders(gl,
        "shaders/vshader21.glsl",
        "shaders/fshader21.glsl"
    );
    gl.useProgram(program);

    // position buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    // color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // uMVP uniform location
    uMVPLoc = gl.getUniformLocation(program, "uMVP");

    render();
};


// 8 vertices + 6 sides * 2 triangles = 12 triangles = 36 vertex
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

    // Color generation from position: x→R, y→G, z→B, [-0.5,0.5] → [0,1]
    function colorFromPosition(p) {
        var r = p[0] + 0.5;
        var g = p[1] + 0.5;
        var b = p[2] + 0.5;
        return vec3(r, g, b);
    }

    function quad(a, b, c, d) {
        var va = vertices[a];
        var vb = vertices[b];
        var vc = vertices[c];
        var vd = vertices[d];

        var ca = colorFromPosition(va);
        var cb = colorFromPosition(vb);
        var cc = colorFromPosition(vc);
        var cd = colorFromPosition(vd);

        // Triangle 1: a, b, c
        points.push(va); colors.push(ca);
        points.push(vb); colors.push(cb);
        points.push(vc); colors.push(cc);

        // Triangle 2: a, c, d
        points.push(va); colors.push(ca);
        points.push(vc); colors.push(cc);
        points.push(vd); colors.push(cd);
    }

    // Sides
    quad(4, 5, 6, 7); // Front
    quad(0, 1, 2, 3); // Back
    quad(0, 4, 7, 3); // Left
    quad(1, 5, 6, 2); // Right
    quad(0, 1, 5, 4); // Bottom
    quad(3, 2, 6, 7); // Top
}


// Dynamic MVP: X fixed 30°, Y theta spinning cube
function createMVP(theta)
{
    function rad(deg) { return deg * Math.PI / 180.0; }

    var ax = rad(30.0)
    var ay = theta;

    var cx = Math.cos(ax), sx = Math.sin(ax);
    var cy = Math.cos(ay), sy = Math.sin(ay);

    // R = R_y(ay) * R_x(ax), column-major
    return new Float32Array([
        cy,             sx * sy,     -cx * sy,   0.0,
        0.0,            cx,           sx,        0.0,
        sy,            -sx * cy,      cx * cy,   0.0,
        0.0,            0.0,         0.0,        1.0
    ]);
}


function render()
{
    // increment rotation angle
    theta += 0.02;
    // New rotation matrix
    var mvp = createMVP(theta);
    gl.uniformMatrix4fv(uMVPLoc, false, mvp);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    requestAnimationFrame(render);
}