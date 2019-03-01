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
      fog: false
    },
    redrawInterval: 250,
    minFontSize: 1,
    texture: {
      fontFamily: 'Roboto, sans-serif',
      text
    }
  });

  sprite.depthWrite = false;
  sprite.renderOrder = -2;

  const animateFn = object => {
    sprite.position.copy(object.position);
    sprite.position.x = sprite.position.x + xOffset;
  };

  return [sprite, animateFn];
}
