attribute vec4 vPosition;
attribute vec3 vColor;

varying vec3 fColor;

void main()
{
    gl_PointSize = 1.0;
    gl_Position = vPosition;
    fColor = vColor;
}