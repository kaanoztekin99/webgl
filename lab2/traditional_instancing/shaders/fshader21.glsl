#ifdef GL_ES
precision mediump float;
#endif

varying vec3 fColor;

void main()
{
    gl_FragColor = vec4(fColor, 1.0); 
}
