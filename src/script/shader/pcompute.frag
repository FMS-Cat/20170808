#define HUGE 9E16
#define PI 3.14159265
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

precision highp float;

uniform float time;
uniform float particlePixels;
uniform float frame;
uniform float frames;
uniform bool init;
uniform float deltaTime;
uniform vec2 resolution;

uniform sampler2D textureReturn;
uniform sampler2D textureRandom;
uniform sampler2D textureOctahedron;

// ------

vec2 vInvert( vec2 _uv ) {
  return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec4 random( vec2 _uv ) {
  return texture2D( textureRandom, _uv );
}

#pragma glslify: noise = require( ./noise )

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 puv = vec2( ( floor( gl_FragCoord.x / particlePixels ) * particlePixels + 0.5 ) / resolution.x, uv.y );
  float mode = mod( gl_FragCoord.x, particlePixels );
  vec2 dpix = vec2( 1.0 ) / resolution;

  vec4 pos = texture2D( textureReturn, puv );
  vec4 vel = texture2D( textureReturn, puv + dpix * V.yx );
  vec4 center = texture2D( textureReturn, puv + dpix * V.yx * 2.0 );
  vec4 impact = texture2D( textureReturn, puv + dpix * V.yx * 3.0 );

  float timing = 0.0;//floor( ( uv.y + uv.x / resolution.y ) * frames );

  vec2 puv2 = vec2( ( floor( gl_FragCoord.x / particlePixels ) + 0.5 ) / 3.0, uv.y );

  float timeE = exp( -2.0 * time );

  pos = vec4( texture2D( textureOctahedron, puv2 ).xyz * 0.7, 1.0 ) * ( 1.0 - exp( -5.0 * time ) );
  pos.zx = rotate2D( timeE ) * pos.zx;

  vel = V.xxxy;

  center = V.xxxy;
  
  impact = vec4(
    random( vec2( 0.0, uv.y ) ).xyz,
    1.0
  );

  float dt = deltaTime;

  {
    mat2 rot = rotate2D( dt * 5.0 );
    pos.zx = rot * pos.zx;
    vel.zx = rot * vel.zx;
  }

  vec3 noi = vec3(
    noise( vec4( pos.xyz * 1.4 + 3.7, 1.0 ) ),
    noise( vec4( pos.xyz * 1.4 + 3.7, 2.0 ) ),
    noise( vec4( pos.xyz * 1.4 + 3.7, 3.0 ) )
  );
  float nPow = exp( -2.0 * length( pos.xyz - 0.7 * vec3( sin( timeE * 8.0 + 1.6 ), 0.0, sin( timeE * 8.0 ) ) ) );
  pos.xyz += ( noi ) * nPow * 400.0 * dt;

  pos.xyz *= ( 1.0 + 2.0 * smoothstep( 0.5, 1.3, time ) ) * ( 1.0 - smoothstep( 0.9, 1.0, time ) );

  pos.xyz += vel.xyz * dt;

  gl_FragColor = (
    mode < 1.0 ? pos :
    mode < 2.0 ? vel :
    mode < 3.0 ? center :
    impact
  );
}