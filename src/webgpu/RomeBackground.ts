import * as THREE from 'three';

/**
 * Loads the authentic Giovanni Paolo Panini Roman Ruins masterwork
 * ("Capriccio of Roman Ruins with Colosseum, Columns & Farnese Hercules")
 * formatted as an optimized WebP texture with sRGB color space.
 */
export function createRomeBackgroundTexture(onLoad?: () => void): THREE.Texture {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/rome-capriccio.webp', () => {
    if (onLoad) onLoad();
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
