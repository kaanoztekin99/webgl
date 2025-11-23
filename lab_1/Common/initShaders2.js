//
// initShaders(gl, "vshaderID", "fshaderID")
// Works with <script id="vshaderID"> shader blocks in HTML
//
function initShaders(gl, vertexShaderId, fragmentShaderId) {

    // Load shader from <script> tag by ID
    function loadShaderFromScript(gl, id, shaderType) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            alert("Shader script not found: " + id);
            return null;
        }

        var source = shaderScript.textContent;

        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPLETE_STATUS) &&
            !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("Shader compile error in " + id + ":");
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var vertexShader = loadShaderFromScript(gl, vertexShaderId, gl.VERTEX_SHADER);
    var fragmentShader = loadShaderFromScript(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Shader program failed to link.");
        return null;
    }

    return program;
}