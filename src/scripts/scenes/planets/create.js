import {
  SphereGeometry, Mesh, MeshLambertMaterial, Vector3
} from 'three';

function randomColor() {
  return '#000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));
}

/**
 * build a planet mesh and return it
 *
 * @param {number} size
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function createPlanetMesh(size, x, y, z) {
  const geometry = new SphereGeometry(size, 20, 20);
  const mat = new MeshLambertMaterial({ color: randomColor() });

  const ball = new Mesh(geometry, mat);
  ball.position.set(x, y, z);
  ball.material.smoothShading = true;

  return ball;
}

/**
 * returns a random number between the two values
 *
 * @param {number} low
 * @param {number} high
 */
const randBetweenPos = (low, high) => Math.random() * (high - low) + low;

/**
 * return random number (posive or negative) whose absolute value
 * lies between the given values.
 *
 * @param {number} low
 * @param {number} high
 */
const randBetween = (low, high) => randBetweenPos(low, high) * (Math.random() > 0.5 ? -1 : 1);

/**
 * @typedef Planet
 * @property {Vector3} velocity
 * @property {number} mass
 * @property {number} radius
 * @property {Mesh} mesh
 */

/**
 * build planets, with mesh and randomized position
 *
 * @returns {Planet[]} created planets
 */
export function createPlanets() {
  const sizes = [5.0, 7.5, 10.0, 5.0, 10.0, 7.5, 10.0, 5.0];
  return sizes.map((radius) => {
    const x = randBetween(40, 100);
    const y = randBetween(40, 100);
    const z = randBetween(40, 100);

    const velocity = new Vector3(0, 0, 0);

    return {
      velocity,
      radius,
      mass: Math.PI * (4 / 3) * (radius ** 3),
      mesh: createPlanetMesh(radius, x, y, z)
    };
  });
}

/**
 * update `planet`'s z velocity in place to ensure the planet's
 * velocity is equal to it's escape velocity
 *
 * @param {Planet} planet
 * @param {Planet[]} allPlanets
 */
// export function safeInitialVelocity(planet, allPlanets) {}
