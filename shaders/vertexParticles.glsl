uniform float time;
uniform sampler2D texture1;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
  gl_PointSize = 1000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
