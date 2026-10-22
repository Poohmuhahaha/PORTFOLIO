import * as THREE from 'three';

export interface LiquidWaveUniforms {
  uMap: { value: THREE.Texture | null };
  uNormal: { value: THREE.Texture | null };
  uTime: { value: number };
  uVelocity: { value: number };
  uVelocityAbs: { value: number };
  uHit: { value: THREE.Vector2 };
  uHover: { value: number };
  uIndex: { value: number };
  uFold: { value: number };
  uBump: { value: number };
  uAlpha: { value: number };
  uPaperBlend: { value: number };
  uPaperDisplacement: { value: number };
  uRGBShift: { value: number };
}

/**
 * Patrick Heng's signature Crumpled Paper & Fluid Wave Shader
 * Faithfully extracted from justinesoulie.fr with Eulerian liquid wave physics
 */
export function createLiquidWaveMaterial(
  mapTexture: THREE.Texture,
  normalTexture: THREE.Texture | null,
  cardIndex: number = 0
): THREE.ShaderMaterial {
  const uniforms: LiquidWaveUniforms = {
    uMap: { value: mapTexture },
    uNormal: { value: normalTexture },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uVelocityAbs: { value: 0 },
    uHit: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uIndex: { value: cardIndex },
    uFold: { value: 0 },
    uBump: { value: 1.0 },
    uAlpha: { value: 1.0 },
    uPaperBlend: { value: 0.22 },
    uPaperDisplacement: { value: 0.0085 },
    uRGBShift: { value: 0 }
  };

  const vertexShader = /* glsl */ `
    #define PI 3.14159265359

    uniform float uTime;
    uniform float uVelocity;
    uniform float uVelocityAbs;
    uniform float uIndex;
    uniform float uFold;
    uniform float uHover;
    uniform float uBump;
    uniform vec2 uHit;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vNDCPosition;

    float map(float oldVal, float oldMin, float oldMax, float newMin, float newMax) {
      float old = oldMax - oldMin;
      float new = newMax - newMin;
      return (((oldVal - oldMin) * new) / old) + newMin;
    }

    float cmap(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
      return clamp(map(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
    }

    float parabola(float x) {
      return 4.0 * x * (1.0 - x);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      vec4 clipPosition = modelViewMatrix * vec4(position, 1.0);
      vec3 ndcPosition = clipPosition.xyz / clipPosition.w;
      vNDCPosition = ndcPosition;

      vec3 newPos = position;

      // 1. Patrick Heng parabolic carousel arch toward camera
      newPos.z += parabola(cmap(ndcPosition.x, -1.0, 1.0, 0.0, 1.0)) * 0.38 * uBump;
      newPos.z += max(abs(uVelocityAbs) * -0.65, -0.16) * uBump;

      // 2. Tactile subtle paper curl & fold
      newPos.z -= sin(uv.y * 10.0 + uIndex) * 0.012 * uBump;
      newPos.y -= cos(uv.x * 10.0 + uIndex + 100.0) * 0.0035 * uBump;

      // 3. Fluid drag wave across Y
      float dragWave = sin(position.y * 1.5 + uTime * 2.5) * uVelocity * 0.32;
      newPos.z += dragWave;

      // 4. Interactive cursor press
      float dist = cmap(distance(uv - vec2(0.5), uHit), 0.0, 0.35, 1.0, 0.0) * uHover * cmap(uBump, 0.0, 1.0, 0.5, 1.0);
      newPos.z -= dist * 0.055;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    #define PI 3.14159265359

    uniform sampler2D uMap;
    uniform sampler2D uNormal;
    uniform float uTime;
    uniform float uVelocity;
    uniform float uHover;
    uniform vec2 uHit;
    uniform float uIndex;
    uniform float uAlpha;
    uniform float uPaperBlend;
    uniform float uPaperDisplacement;
    uniform float uRGBShift;

    varying vec2 vUv;
    varying vec3 vNormal;

    float map(float oldVal, float oldMin, float oldMax, float newMin, float newMax) {
      float old = oldMax - oldMin;
      float new = newMax - newMin;
      return (((oldVal - oldMin) * new) / old) + newMin;
    }

    float cmap(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
      return clamp(map(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
    }

    vec2 rotateUV(vec2 uv, float rot, vec2 origin) {
      vec3 u = vec3(uv, 1.0);
      mat3 mo1 = mat3(
        1.0, 0.0, -origin.x,
        0.0, 1.0, -origin.y,
        0.0, 0.0, 1.0
      );
      mat3 mo2 = mat3(
        1.0, 0.0, origin.x,
        0.0, 1.0, origin.y,
        0.0, 0.0, 1.0
      );
      mat3 mr = mat3(
        cos(rot), sin(rot), 0.0,
        -sin(rot), cos(rot), 0.0,
        0.0, 0.0, 1.0
      );
      u = u * mo1 * mr * mo2;
      return u.xy;
    }

    vec2 rotateUV(vec2 uv, float rot) {
      return rotateUV(uv, rot, vec2(0.5));
    }

    float blendScreen(float base, float blend) {
      return 1.0 - ((1.0 - base) * (1.0 - blend));
    }

    vec3 blendScreen(vec3 base, vec3 blend) {
      return vec3(blendScreen(base.r, blend.r), blendScreen(base.g, blend.g), blendScreen(base.b, blend.b));
    }

    vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
      return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
    }

    float rectangle(vec2 st, vec2 size, float aa) {
      size -= vec2(aa);
      size = vec2(0.5) - size * 0.5;
      vec2 uv = vec2(smoothstep(size.x - aa, size.x, st.x), smoothstep(size.y - aa, size.y, st.y));
      uv *= vec2(smoothstep(size.x - aa, size.x, 1.0 - st.x), smoothstep(size.y - aa, size.y, 1.0 - st.y));
      return uv.x * uv.y;
    }

    void main() {
      // 1. Rotate normal UV per card index so each card has unique wrinkle directions
      vec2 normalUV = rotateUV(vUv, uIndex * PI * 0.5);
      vec3 normalTexel = texture2D(uNormal, normalUV).rgb;

      // 2. Tactile surface crease displacement
      float dist = cmap(distance(vUv - vec2(0.5), uHit), 0.0, 0.35, 1.0, 0.0) * uHover;
      vec2 uvOffset = -normalTexel.g * uPaperDisplacement + dist * uPaperDisplacement * normalTexel.g;

      // 3. Fluid ripple warp
      vec2 mouseDir = vUv - (uHit + vec2(0.5));
      float mDist = length(mouseDir);
      vec2 rippleOffset = normalize(mouseDir + 0.0001) * sin(mDist * 16.0 - uTime * 5.0) * exp(-mDist * 4.0) * 0.018 * uHover;

      vec2 displacedUV = vUv + uvOffset + rippleOffset;

      // 4. Chromatic Aberration (RGB shift on dynamic swipe)
      float shift = abs(uVelocity) * 0.028 + uRGBShift * 0.015;
      vec2 shiftDir = normalize(vec2(uVelocity * 1.5, 0.1) + 0.001);

      float r = texture2D(uMap, clamp(displacedUV + shiftDir * shift, 0.001, 0.999)).r;
      float g = texture2D(uMap, clamp(displacedUV, 0.001, 0.999)).g;
      float b = texture2D(uMap, clamp(displacedUV - shiftDir * shift, 0.001, 0.999)).b;
      vec4 texel = vec4(r, g, b, 1.0);

      // 5. Authentic Patrick Heng Paper Normal Blending (folds & creases)
      texel.rgb = blendScreen(texel.rgb, normalTexel.rgb, uPaperBlend);
      texel.rgb -= (cmap(normalTexel.g, 0.0, 0.1, 0.05, 0.0) - normalTexel.g * dist * 0.1) * (uPaperBlend / 0.2);

      // 6. Smooth rounded paper corners
      float rect = rectangle(vUv, vec2(1.0), 0.008);

      gl_FragColor = texel;
      gl_FragColor.a = rect * uAlpha;
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  });
}
