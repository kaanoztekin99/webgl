"use strict";

var gl;
var points;

var NumPoints = 5000;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Next, generate the rest of the points, by first finding a random point
    //  within our gasket boundary.  We use Barycentric coordinates
    //  (simply the weighted average of the corners) to find the point

    var coeffs = vec3( Math.random(), Math.random(), Math.random() );
    coeffs = normalize( coeffs );

    var a = scale( coeffs[0], vertices[0] );
    var b = scale( coeffs[1], vertices[1] );
    var c = scale( coeffs[2], vertices[2] );

    var p = add( a, add(b, c) );

    // Add our randomly chosen point into our array of points
    points = [ p ];
    
    // Here is the place we made changes to "Contraction Factor"
    var r = 0.5;  // Contraction Factor
    // • For r = 0.5, we get the classic Sierpinski gasket with clear triangular holes.
	// • For r > 0.5, The points go more towards the corner. The triangular holes become smaller.
    // • For r < 0.5, The points approach the corners very slightly. The gaps grow larger.
    
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);

        p = add( points[i], vertices[j] );
        p = scale( r, p );
        points.push( p );
    }
    // Random vertex selection
    // for (var i = 0; points.length < NumPoints; ++i) {

    // 
    // var t = Math.random();
    // var j;

    // if (t < 0.5)
    //     j = 0;        // %50
    // else if (t < 0.75)
    //     j = 1;        // %25
    // else
    //     j = 2;        // %25

    // p = add(points[i], vertices[j]);
    // p = scale(r, p);
    // points.push(p);
    // }


    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "shaders/vshader21.glsl",
                               "shaders/fshader21.glsl" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, points.length );
}
