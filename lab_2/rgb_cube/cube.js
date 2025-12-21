"use strict";
var gl;
var points = [];
var colors = [];

// Camera (trackball-like)
var camTarget = vec3(0, 0, 0);
var camUp     = vec3(0, 1, 0);

var camYaw    = 0.0;
var camPitch  = 0.0;
var camRadius = 8.0;

// zoom as focal-length feel
var fovy = 45.0;
var fovyMin = 15.0;
var fovyMax = 80.0;

var uViewLoc, uProjLoc;
var canvasRef;

// mouse interaction
var isDragging = false;
var lastX = 0, lastY = 0;
var dragMode = "rotate";

// Instancing
var numInstances = 1;
var instanceMatrices = [];
var matrixData;
var matrixBuffer;

var rotationAngle = [];
var rotationSpeed = [];
var instanceScale = [];

function clamp(v, lo, hi) { 
    return Math.max(lo, Math.min(hi, v)); 
}

function computeEye() {
    camPitch = clamp(camPitch, -1.45, 1.45);

    var x = camRadius * Math.cos(camPitch) * Math.sin(camYaw);
    var y = camRadius * Math.sin(camPitch);
    var z = camRadius * Math.cos(camPitch) * Math.cos(camYaw);

    return add(camTarget, vec3(x, y, z));
}

function getCameraBasis() {
    var eyeNow = computeEye();
    var forward = normalize(subtract(camTarget, eyeNow)); // eye -> target
    var right   = normalize(cross(forward, camUp));
    var upMove  = normalize(cross(right, forward));
    return { right: right, upMove: upMove };
}

function updateCameraUniforms() {
    var eyeNow = computeEye();
    var view = lookAt(eyeNow, camTarget, camUp);
    var proj = perspective(fovy, canvasRef.width / canvasRef.height, 0.1, 100.0);

    gl.uniformMatrix4fv(uViewLoc, false, flatten(view));
    gl.uniformMatrix4fv(uProjLoc, false, flatten(proj));
}

function resetCamera() {
    camTarget = vec3(0, 0, 0);
    camUp     = vec3(0, 1, 0);
    camYaw    = 0.0;
    camPitch  = 0.0;
    camRadius = 8.0;
    fovy      = 45.0;
}


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    canvasRef = canvas;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL not available");
        return;
    }

    createCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) {
        alert("Instancing not supported!");
        return;
    }

    // Upload geometry
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // camera uniform locations
    uViewLoc = gl.getUniformLocation(program, "uView");
    uProjLoc = gl.getUniformLocation(program, "uProj");

    // Instance matrix buffer
    matrixBuffer = gl.createBuffer();
    updateInstances();

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW);

    var stride = 64;

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    for (let i = 0; i < 4; i++) {
        var loc = gl.getAttribLocation(program, "a_matrix" + i);
        if (loc === -1) {
            console.warn("Attribute not found:", "a_matrix" + i);
            continue;
        }

        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(
            loc,
            4, gl.FLOAT, false,
            stride,
            i * 16
        );
        ext.vertexAttribDivisorANGLE(loc, 1);
    }

    // slider (N)
    var slider = document.getElementById("numSlider");
    var label  = document.getElementById("numLabel");

    if (slider && label) {
        numInstances = parseInt(slider.value);
        label.textContent = "Instances: " + numInstances;

        slider.oninput = function () {
            numInstances = parseInt(this.value);
            label.textContent = "Instances: " + numInstances;
            updateInstances();
        };
    }

    // reset camera
    var resetBtn = document.getElementById("resetBtn");
    if (resetBtn) resetBtn.onclick = resetCamera;

    // Mouse controls
    canvas.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        dragMode = e.shiftKey ? "pan" : "rotate";
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        if (dragMode === "rotate") {
            var s = 0.005;
            camYaw   += dx * s;
            camPitch += -dy * s;
        } else {
            var basis = getCameraBasis();
            var panScale = 0.01 * camRadius;

            camTarget = add(camTarget, add(
                scale(-dx * panScale, basis.right),
                scale( dy * panScale, basis.upMove)
            ));
        }
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        var zoomSpeed = 0.0015;
        fovy = clamp(fovy * (1.0 + e.deltaY * zoomSpeed), fovyMin, fovyMax);
    }, { passive: false });

    render(ext);
};

// Geometry
function createCube() {
    var v = [
        vec3(-0.5, -0.5, -0.5),
        vec3( 0.5, -0.5, -0.5),
        vec3( 0.5,  0.5, -0.5),
        vec3(-0.5,  0.5, -0.5),
        vec3(-0.5, -0.5,  0.5),
        vec3( 0.5, -0.5,  0.5),
        vec3( 0.5,  0.5,  0.5),
        vec3(-0.5,  0.5,  0.5)
    ];

    function color(p) { return vec3(p[0] + 0.5, p[1] + 0.5, p[2] + 0.5); }

    function quad(a, b, c, d) {
        points.push(v[a]); colors.push(color(v[a]));
        points.push(v[b]); colors.push(color(v[b]));
        points.push(v[c]); colors.push(color(v[c]));
        points.push(v[a]); colors.push(color(v[a]));
        points.push(v[c]); colors.push(color(v[c]));
        points.push(v[d]); colors.push(color(v[d]));
    }

    quad(4, 5, 6, 7);
    quad(0, 1, 2, 3);
    quad(0, 4, 7, 3);
    quad(1, 5, 6, 2);
    quad(0, 1, 5, 4);
    quad(3, 2, 6, 7);
}

// Instances
function updateInstances() {
    instanceMatrices = [];
    rotationAngle = [];
    rotationSpeed = [];
    instanceScale = [];

    const spacing = 1.8;
    const maxCols = 4;

    for (var i = 0; i < numInstances; i++) {
        var col = i % maxCols;
        var row = Math.floor(i / maxCols);

        var x = (col - 1.5) * spacing;
        var z = (row - 1.5) * spacing;

        var s = 0.75 + 0.03 * i;
        instanceScale.push(s);

        var M = mult(translate(x, 0, z), scalem(s, s, s));
        instanceMatrices.push(M);

        rotationAngle.push(0);
        rotationSpeed.push(0.05 * (i + 1));
    }

    // flatten matrices to Float32Array
    matrixData = new Float32Array(numInstances * 16);
    for (let i = 0; i < numInstances; i++) {
        matrixData.set(flatten(instanceMatrices[i]), i * 16);
    }

    if (matrixBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW);
    }
}

function render(ext) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateCameraUniforms();

    for (let i = 0; i < numInstances; i++) {
        rotationAngle[i] += rotationSpeed[i];

        // extract translation from current matrix
        var T = instanceMatrices[i];
        var tx = T[0][3], ty = T[1][3], tz = T[2][3];

        var s = instanceScale[i] || 1.0;

        var R = rotateY(rotationAngle[i]);
        var M = mult(translate(tx, ty, tz), mult(R, scalem(s, s, s)));

        instanceMatrices[i] = M;
        matrixData.set(flatten(M), i * 16);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

    ext.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0,
        points.length,
        numInstances
    );

    requestAnimationFrame(() => render(ext));
}