import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.100.0/build/three.module.min.js';
import WebXRPolyfill from 'https://cdn.jsdelivr.net/npm/webxr-polyfill@1.0.13/build/webxr-polyfill.module.min.js';
const xrpolyfill = new WebXRPolyfill(window, {webvr: true, cardboard: true});

import {delay, listenOnce} from './utilities.jsm';
import {XRStatus} from './xr-status.jsm';


class Experience {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.cube = null;
		this.renderer = null;
		this.session = null;
		this.referenceFrame = null;

		this.run();
	}
	async run() {
		//Initialize scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(100, 100, 100);

		//Init camera
		this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);

		// Magic Window Placeholder:
		const mwPlaceholder = document.body.querySelector('.magic-window.placeholder');
		const targetRect = mwPlaceholder.getBoundingClientRect();

		// Get an XR device...
		const device = await (async resolve => {
			while(1) {
				try {
					// DEBUG: Test any delay in checking whether or not XR is available
	//				await delay(1000);
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

		// Load Content
		await this.fillScene();
		this.camera.position.z = 5;

		// Create renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(targetRect.width, targetRect.height);

		// Check for Magic Window Support
		{
			const magicCanvas = document.createElement('canvas');
			magicCanvas.classList.add('magic-window');
			const magicContext = magicCanvas.getContext('xrpresent');
			try {
				this.session = await device.requestSession({ outputContext: magicContext });
				// Magic Window is supported
				{
					magicCanvas.width = targetRect.width;
					magicCanvas.height = targetRect.height;
					mwPlaceholder.replaceWith(magicCanvas);

					await this.renderer.vr.setDevice(device);

					this.referenceFrame = await this.session.requestFrameOfReference("eye-level");

					this.session.baseLayer = new XRWebGLLayer(this.session, this.renderer.context);

					this.session.requestAnimationFrame(this.frameUpdate.bind(this));
				}
			} catch(e) {
				console.log('Unable to start the magic window:', e);
			}
		}
	}
	frameUpdate(timestamp, xrFrame) {
		this.cube.rotation.y += .05;
//		this.renderer.render(this.scene, this.camera);

		this.scene.matrixAutoUpdate = false;
		this.renderer.autoClear = false;

		this.renderer.clear();

		let pose = xrFrame.getDevicePose(this.referenceFrame);

		const baseLayer = this.session.baseLayer;
		this.renderer.setSize(baseLayer.framebufferWidth, baseLayer.framebufferHeight, false);

		this.renderer.context.bindFramebuffer(this.renderer.context.FRAMEBUFFER, baseLayer.frameBuffer);

		for (let view of xrFrame.views) {
			this.drawEye(
				pose.getViewMatrix(view),
				view.projectionMatrix,
				baseLayer.getViewport(view)
			);
		}

		this.session.requestAnimationFrame(this.frameUpdate.bind(this));
	}
	drawEye(viewMatrixArray, projMatrix, viewport) {
		this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);


		let viewMatrix = new THREE.Matrix4();
		viewMatrix.fromArray(viewMatrixArray);

		// Update the scene and camera matrices.
		this.camera.projectionMatrix.fromArray(projMatrix);
		this.camera.matrixWorldInverse.copy(viewMatrix);
		this.scene.matrix.copy(viewMatrix);

		// Tell the scene to update (otherwise it will ignore the change of matrix).
		this.scene.updateMatrixWorld(true);
		this.renderer.render(this.scene, this.camera);
		// Ensure that left eye calcs aren't going to interfere.
		this.renderer.clearDepth();
	}
	async fillScene(scene) {
		// Try loading a model and simulate the loading time.
		const GLTFLoader = (await import('./GLTFLoader.jsm')).default;

		// DEBUG: Simulate loading the assets we need:
//		await delay(3000);

		let importedScene = await new Promise((resolve, reject) => {
			const loader = new GLTFLoader();

			loader.load("resources/Suzanne.gltf", gltf => {
				resolve(gltf.scene);
			}, undefined, error => {
				reject(error);
			});
		});

		this.scene.add(importedScene);

		let geometry = new THREE.BoxGeometry( 1, 1, 1 );
		let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		this.cube = new THREE.Mesh( geometry, material );
		this.scene.add( this.cube );
	}
}

new Experience();
