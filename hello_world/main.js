const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}
function clearScreen() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(clearScreen);
}
clearScreen();