import * as THREE from '../../node_modules/three/build/three.module.js';
//Three variables - Global for now
let scene,
	camera,
	renderer,
	cube;

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
/*
 * Initializes three.js
 */
async function initThree() {

	//Initialize scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(255, 255, 255);

	//Init camera
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
//	/*
	{
		const GLTFLoader = (await import('./GLTFLoader.jsm')).default;

		// Simulate loading the assets we need:
		await delay(3000);

		let importedScene = await new Promise((resolve, reject) => {
			const loader = new GLTFLoader();

			loader.load("resources/Suzanne.gltf", gltf => {
				resolve(gltf.scene);
			}, undefined, error => {
				reject(error);
			});
		});

		scene.add(importedScene);
	}
//	*/
	let geometry = new THREE.BoxGeometry( 1, 1, 1 );
	let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	camera.position.z = 5;

	const placeholder = document.body.querySelector('.magic-window.placeholder');

	//Init renderer
	renderer = new THREE.WebGLRenderer();
	{
		const destRect = placeholder.getBoundingClientRect();
		renderer.setSize(destRect.width, destRect.height);
	}
	renderer.domElement.classList.add('magic-window');
	// TODO: This replaceWith is a little jerky, Maybe swap it out with some delay and animation?
	placeholder.replaceWith(renderer.domElement);

	//Add event listener for automatic resizing
	window.addEventListener('resize', onWindowResize, false);

	animate();
}

/*
 * Main event loop
 */
function animate()
{
	requestAnimationFrame(animate);
	cube.rotation.y += .05;
	renderer.render(scene, camera);
}

/*
 * Handles automatic resizing
 */
function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

initThree();
