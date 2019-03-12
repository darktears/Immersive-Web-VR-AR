import TextSprite from 'three.textsprite';

/**
 *
 * @param {string} text
 * @param {number} xOffset text x position relative to object. defaults to 5
 */
export function createStats(text, xOffset = 5) {
  const sprite = new TextSprite({
    material: {
      color: 'white',
      fog: false,
      depthTest: false
    },
    redrawInterval: 250,
    textSize: 1,
    texture: {
      fontFamily: 'Roboto, sans-serif',
      text
    }
  });

  const animateFn = object => {
    sprite.position.copy(object.position);
    sprite.position.x = sprite.position.x + xOffset;
  };

  return [sprite, animateFn];
}
