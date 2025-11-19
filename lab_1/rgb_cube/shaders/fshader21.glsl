#ifdef GL_ES
precision mediump float;
#endif

varying vec3 fColor;

void main()
{
    vec3 c = pow(fColor, vec3(1));  // for brightness
    gl_FragColor = vec4(c, 1.0); 
}
