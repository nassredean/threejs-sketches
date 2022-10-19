precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;

// vUv is the coordinate of the calculated pixel in UV measrement (0 to 1)
varying vec2 vUv;

const float duration = 8.0;
const float delay = 4.0;

#pragma glslify: random = require(./random);

void main() {
  float now = clamp((time - delay) / duration, 0.0, 1.0);

  // add white noise to the screen
  float r = random(vUv.xy * time) * 0.1 - 0.1;
  vec3 baseWhite = vec3(0.97, .92, .87);
  vec3 whiteNoise = r * baseWhite;

  // add monitor scan lines
  float monitor1 = abs(sin(vUv.y * resolution.y * 2.4 + time * 10.0)) * 0.04;
  float monitor2 = abs(sin(vUv.y * resolution.y * 2.4 + time * 3.0)) * 0.04;
  float monitor = monitor1 - monitor2;

  // gl_FragColor = vec4((vec3(1.0, 1.0, 1.0) + whiteNoise) + monitor, 1.0);
  gl_FragColor = vec4((vec3(1.0, 1.0, 1.0) + whiteNoise) + monitor, 1.0);
}
