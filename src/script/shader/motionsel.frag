#define BLOCK_SIZE 8

// ------

precision highp float;

uniform float time;
uniform float frame;
uniform vec2 resolution;

uniform sampler2D textureMotion;
uniform sampler2D textureCurrent;
uniform sampler2D textureMosh;
uniform sampler2D textureImage;

// ------

void main() {
  vec2 uv = floor( gl_FragCoord.xy ) / resolution;
  vec2 orig = 0.5 + floor( gl_FragCoord.xy / float( BLOCK_SIZE ) ) * float( BLOCK_SIZE );

  if ( frame == 1.0 ) {
    gl_FragColor = texture2D( textureImage, vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * uv );
  } else if ( frame == 90.0 ) {
    gl_FragColor = texture2D( textureCurrent, uv );
  } else {
    float minV = 9E9;
    vec2 minP = vec2( 0.0 );

    for ( int iy = 0; iy < BLOCK_SIZE; iy ++ ) {
      for ( int ix = 0; ix < BLOCK_SIZE; ix ++ ) {
        vec2 pDelta = vec2( float( ix ), float( iy ) );

        vec2 currUv = ( orig + pDelta ) / resolution;

        float tex = texture2D( textureMotion, currUv ).x;
        if ( !( ix == BLOCK_SIZE / 2 && iy == BLOCK_SIZE / 2 ) ) {
          tex += 1E-4;
        }

        if ( tex < minV ) {
          minV = tex;
          minP = vec2( float( ix ), float( iy ) ) - float( BLOCK_SIZE / 2 );
        }
      }
    }

    if ( minV < 0.5 ) {
      vec3 tex = texture2D( textureMosh, ( gl_FragCoord.xy + minP ) / resolution ).xyz;
      gl_FragColor = vec4( tex, 1.0 );
    } else {
      gl_FragColor = texture2D( textureCurrent, uv );
      // gl_FragColor = texture2D( textureImage, vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * uv );
    }
  }
  
  float mCol = max( gl_FragColor.x, max( gl_FragColor.y, gl_FragColor.z ) );
  if ( mCol < 0.1 + 1.0 * smoothstep( 0.9, 1.0, time ) ) {
    gl_FragColor = texture2D( textureImage, vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * uv );
  }
}