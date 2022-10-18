uniform float time;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;

float WIRE_WIDTH = 10.0;

void main()	{
	vec2 fw = WIRE_WIDTH * (abs(dFdx(vUv)) + abs(dFdy(vUv)));
	vec2 ne = clamp(1.0 - ((vUv) / fw), 0.0, 1.0);
	vec2 sw = clamp(1.0 - ((1.0 - vUv) / fw), 0.0, 1.0);
	vec2 al = max(ne, sw);
	float edge = ceil(max(al.x, al.y));
	gl_FragColor = vec4(edge, edge, edge,1.);
}
