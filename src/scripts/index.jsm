import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.100.0/build/three.module.min.js';

import WebXRPolyfill from 'https://cdn.jsdelivr.net/npm/webxr-polyfill@1.0.13/build/webxr-polyfill.module.min.js';
{
	const xrpolyfill = new WebXRPolyfill(window, {
		webvr: true,
		cardboard: true
	});
}

function listenOnce(object, event) {
	return new Promise(resolve => {
		try {
			object.addEventListener(event, resolve);
		} finally {
			object.removeEventListener(event, resolve);
		}
	})
}

//Three variables - Global for now
let scene,
	camera,
	renderer,
	cube;

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const XRStatus = new (class {
	constructor() {
		this.el = document.body.querySelector('.xr-status');
		this._status = "unchecked";
	}
	get status() {
		return this._status;
	}
	set status(newVal) {
		this.el.classList.remove('available', 'unchecked', 'unsupported', 'pre-loading');
		this.el.classList.add(newVal);
	}
	// Once XR is available, this button will
	async xr_enterred() {
		if (this.status != "available") {
			throw new Error("Please wait until XR is available before asking when XR has been enterred.");
		}
		const enter_button = this.el.querySelector('button');
		await listenOnce(enter_button, 'click');
	}
})();
/*
 * Initializes three.js
 */
async function initialize() {

	//Initialize scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0, 0, 0);

	//Init camera
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);

	// Get an XR device...
	const device = await (async resolve => {
		while(1) {
			try {
				// DEBUG: Test any delay in checking whether or not XR is available
				await delay(1000);
				// See if a device is available immediately
				let device = await navigator.xr.requestDevice(); // This throws if no device is available
				XRStatus.status = 'pre-loading';
				return device;
			} catch(e) {
				// TODO: Display a notification that XR is not currently available
				console.log(`Unable to get a xr device immediately.  Waiting for a device change...`, e);
				XRStatus.status = 'unsupported';
				// Wait for either a device to join or leave
				console.log(await listenOnce(navigator.xr, 'devicechange'));
			}
		}
	})();

	// Check for Magic Window Support


	{	// Try loading a model and simulate the loading time.
		const GLTFLoader = (await import('./GLTFLoader.jsm')).default;

		// DEBUG: Simulate loading the assets we need:
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

initialize();
