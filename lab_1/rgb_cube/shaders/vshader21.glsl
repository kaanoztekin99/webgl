
attribute vec3 vPosition;
attribute vec3 vColor;

uniform mat4 uMVP; // Model-View-Projection Matrice
varying vec3 fColor;

void main()
{
    gl_Position =  uMVP * vec4(vPosition, 1.0);
    fColor = vColor;
}
