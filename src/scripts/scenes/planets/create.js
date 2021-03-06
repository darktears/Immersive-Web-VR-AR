import {
  SphereGeometry,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Object3D
} from 'three';
import { createPlanetText } from './ui';
import TriggerMesh from '../../trigger';

const DISTANCE_DIVIDER = 1e6;
export const CAMERA_OFFSET = {
  x: 0,
  y: 5,
  z: 20
};

export const cameraPointName = planetName => `CameraPoint${planetName}`;
export const planetTextName = planetName => `TextPoint${planetName}`;
export const nextPointName = planetName => `NextPoint${planetName}`;
export const prevPointName = planetName => `PrevPoint${planetName}`;
export const exitPointName = planetName => `ExitPoint${planetName}`;

/**
 * build planets, with mesh and randomized position
 *
 * @returns {TriggerMesh[]} created planets
 */
export function createPlanets(planetData, cache) {
  return Object.keys(planetData).map(planetName => {
    const texture = cache[planetName];
    const planet = planetData[planetName];
    const geo = new SphereGeometry(planet.fakeRadius, 20, 20);

    let material;
    if (planetName === 'Sun') {
      material = new MeshBasicMaterial({ map: texture });
    } else {
      material = new MeshPhongMaterial({ map: texture });
    }

    const mesh = new TriggerMesh(geo, material);

    mesh.position.setFromSphericalCoords(
      planet.orbitDistance / DISTANCE_DIVIDER,
      Math.PI / 2,
      Math.random() * Math.PI
    );
    mesh.name = planetName;

    // camera point
    const cameraPoint = new Object3D();
    mesh.add(cameraPoint);
    cameraPoint.position.set(
      CAMERA_OFFSET.x,
      CAMERA_OFFSET.y + planet.fakeRadius,
      CAMERA_OFFSET.z
    );
    cameraPoint.name = cameraPointName(planetName);

    // text description
    const text = createPlanetText(planet);
    mesh.add(text);
    text.position.set(0, planet.fakeRadius + 8, 0);

    text.name = planetTextName(planetName);
    text.visible = false;

    // next button
    const nextButtonPoint = new Object3D();
    nextButtonPoint.position.set(18, planet.fakeRadius + 8, 0);
    nextButtonPoint.name = nextPointName(planetName);
    mesh.add(nextButtonPoint);

    // prev button
    const prevButtonPoint = new Object3D();
    prevButtonPoint.position.set(-18, planet.fakeRadius + 8, 0);
    prevButtonPoint.name = prevPointName(planetName);
    mesh.add(prevButtonPoint);

    // exit button
    const exitButtonPoint = new Object3D();
    exitButtonPoint.position.set(0, planet.fakeRadius + 2, 0);
    exitButtonPoint.name = exitPointName(planetName);
    mesh.add(exitButtonPoint);

    return mesh;
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
