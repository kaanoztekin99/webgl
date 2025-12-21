
attribute vec4 vPosition;
attribute vec3 vColor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

varying vec3 fColor;

void main()
{
    fColor = vColor;
    gl_Position = uProj * uView * uModel * vPosition;
}
