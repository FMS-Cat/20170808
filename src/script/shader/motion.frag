#define BLOCK_SIZE 8

// ------

precision highp float;

uniform vec2 resolution;

uniform sampler2D texture;
uniform sampler2D textureP;

// ------

vec3 rgb2yuv( vec3 rgb ) {
  return vec3(
      0.299 * rgb.x + 0.587 * rgb.y + 0.114 * rgb.z,
    - 0.14713 * rgb.x - 0.28886 * rgb.y + 0.436 * rgb.z + 0.5,
      0.615 * rgb.x - 0.51499 * rgb.y - 0.10001 * rgb.z + 0.5
  );
}

vec3 yuv2rgb( vec3 yuv ) {
  return vec3(
    yuv.x + 1.13983 * yuv.z,
    yuv.x - 0.39465 * yuv.y - 0.58060 * yuv.z,
    yuv.x + 2.03211 * yuv.y
  );
}

void main() {
  vec2 currOrig = 0.5 + floor( gl_FragCoord.xy / float( BLOCK_SIZE ) ) * float( BLOCK_SIZE );
  
  float sum = 0.0;
  vec3 sumDev = vec3( 0.0 );

  for ( int iy = 0; iy < BLOCK_SIZE; iy ++ ) {
    for ( int ix = 0; ix < BLOCK_SIZE; ix ++ ) {
      vec2 pDelta = vec2( float( ix ), float( iy ) );

      vec2 prevUv = ( gl_FragCoord.xy + pDelta - float( BLOCK_SIZE / 2 ) ) / resolution;
      vec2 currUv = ( currOrig + pDelta ) / resolution;

      vec3 prevTex = rgb2yuv( texture2D( textureP, prevUv ).xyz );
      vec3 currTex = rgb2yuv( texture2D( texture, currUv ).xyz );

      float len = length( prevTex - currTex ) / float( BLOCK_SIZE * BLOCK_SIZE );
      sum += len;
    }
  }

  gl_FragColor = vec4( sum, 0.0, 0.0, 1.0 );
}