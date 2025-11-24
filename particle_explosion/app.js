"use strict";

var gl;

var particles = [];
var MAX_PARTICLES = 300;

var uPointSizeLoc;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL not available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.07, 0.07, 0.07, 1.0);

    var program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    // Buffers
    var vBuffer = gl.createBuffer();
    var cBuffer = gl.createBuffer();

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPos);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);

    uPointSizeLoc = gl.getUniformLocation(program, "uPointSize");

    // MOUSE INTERACTION
    canvas.addEventListener("click", function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
        var y = -(((e.clientY - rect.top) / canvas.height) * 2 - 1);

        spawnExplosion(x, y);
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        updateParticles();

        // Prepare arrays for GPU
        var positions = [];
        var colors = [];

        for (var p of particles) {
            positions.push(p.x, p.y);
            colors.push(p.r, p.g, p.b, p.a);
        }

        // Upload positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);

        // Upload colors
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uPointSizeLoc, 20.0);

        gl.drawArrays(gl.POINTS, 0, particles.length);

        requestAnimationFrame(render);
    }

    render();
};


// ========================
// PARTICLE SYSTEM
// ========================
function spawnExplosion(x, y) {
    for (var i = 0; i < 100; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.random() * 0.03 + 0.005;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random(),
            g: Math.random(),
            b: Math.random(),
            a: 1.0,
            life: Math.random() * 80 + 40
        });
    }

    // Prevent infinite growth
    if (particles.length > MAX_PARTICLES)
        particles.splice(0, particles.length - MAX_PARTICLES);
}

function updateParticles() {
    for (var p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.a -= 0.015;          // fade out
        p.vx *= 0.98;          // friction
        p.vy *= 0.98;
        p.life--;
    }

    // Remove dead particles
    particles = particles.filter(p => p.a > 0 && p.life > 0);
}