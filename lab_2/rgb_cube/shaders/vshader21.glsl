attribute vec3 vPosition;
attribute vec3 vColor;

attribute vec4 a_matrix0;
attribute vec4 a_matrix1;
attribute vec4 a_matrix2;
attribute vec4 a_matrix3;

uniform mat4 uView;
uniform mat4 uProj;

varying vec3 fColor;

void main()
{
    mat4 uModel = mat4(
        a_matrix0,
        a_matrix1,
        a_matrix2,
        a_matrix3
    );

    fColor = vColor;
    gl_Position = uProj * uView * uModel * vec4(vPosition, 1.0);
}