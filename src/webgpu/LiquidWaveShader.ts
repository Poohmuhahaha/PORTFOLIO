import * as THREE from 'three';

export interface LiquidWaveUniforms {
  uTexture: { value: THREE.Texture | null };
  uTime: { value: number };
  uVelocity: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  uHover: { value: number };
  uRGBShift: { value: number };
  uDrag: { value: number };
}

export function createLiquidWaveMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  const uniforms: LiquidWaveUniforms = {
    uTexture: { value: texture },
    uTime: { value: 0 },
    uVelocity: { value: new THREE.Vector2(0, 0) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uRGBShift: { value: 0 },
    uDrag: { value: 0 }
  };

  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform vec2 uVelocity;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uDrag;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vWave;

    void main() {
      vUv = uv;

      vec3 pos = position;

      // 1. Fluid drag wave across X & Y (Bends dynamically along scroll direction)
      float dragWave = sin(pos.y * 1.8 + uTime * 2.8) * uVelocity.x * 0.42;

      // 2. Interactive mouse fluid ripple
      vec2 localUv = uv - uMouse;
      float mouseDist = length(localUv);
      float mouseRipple = sin(mouseDist * 18.0 - uTime * 6.0) * exp(-mouseDist * 4.5) * 0.22 * uHover;

      // 3. Ambient organic breathing liquid surface
      float ambientWave = sin(pos.x * 2.2 + pos.y * 1.6 + uTime * 1.8) * 0.04;

      pos.z += dragWave + mouseRipple + ambientWave;

      vWave = dragWave + mouseRipple;
      vNormal = normal;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uVelocity;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uRGBShift;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vWave;

    void main() {
      vec2 uv = vUv;

      // 1. Liquid displacement offset (Fluid wave distortion)
      vec2 waveOffset = vec2(
        sin(uv.y * 14.0 + uTime * 2.5) * 0.012 + uVelocity.x * 0.05,
        cos(uv.x * 14.0 + uTime * 2.5) * 0.012
      );

      // 2. Mouse liquid ripple warp
      vec2 mouseDir = uv - uMouse;
      float dist = length(mouseDir);
      vec2 rippleOffset = normalize(mouseDir + 0.0001) * sin(dist * 18.0 - uTime * 5.5) * exp(-dist * 4.2) * 0.038 * uHover;

      vec2 distortedUv = uv + waveOffset * (0.4 + uHover * 0.8) + rippleOffset;
      distortedUv = clamp(distortedUv, 0.001, 0.999);

      // 3. Chromatic Aberration / RGB Split (Signature Patrick Heng & Codrops effect)
      float shift = (abs(uVelocity.x) * 0.04 + uRGBShift * 0.025 + uHover * 0.009);
      vec2 shiftDir = normalize(vec2(uVelocity.x * 1.5, 0.15) + mouseDir * uHover + 0.001);

      float r = texture2D(uTexture, clamp(distortedUv + shiftDir * shift, 0.001, 0.999)).r;
      float g = texture2D(uTexture, distortedUv).g;
      float b = texture2D(uTexture, clamp(distortedUv - shiftDir * shift, 0.001, 0.999)).b;

      vec4 color = vec4(r, g, b, 1.0);

      // 4. Liquid specular crest highlight (Water sheen)
      float crest = pow(max(0.0, sin(dist * 18.0 - uTime * 5.5)), 4.0) * exp(-dist * 3.8) * 0.35 * uHover;
      color.rgb += vec3(1.0, 0.97, 0.92) * crest;

      // Subtle vignette around borders
      vec2 vig = uv * (1.0 - uv.yx);
      float vigFactor = clamp(vig.x * vig.y * 30.0, 0.0, 1.0);
      color.rgb = mix(color.rgb * 0.95, color.rgb, vigFactor);

      gl_FragColor = color;
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
