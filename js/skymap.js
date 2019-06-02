"use strict";

AFRAME.registerComponent('stars', {
	schema: {
		source: { type: 'string', default: "hip_stars.json" },
		lat: { type: 'number', default: 35 },
		lng: { type: 'number', default: 140.0 },
		realtime: { type: 'boolean', default: true },
		timeMs: { type: 'number', default: 0 },
		updateIntervalMs: { type: 'number', default: -1 },
		speed: { type: 'number', default: 1 }
	},
	init: function () {

		var starMaterialParams = {
			uniforms: THREE.ShaderLib.points.uniforms,
			vertexShader: `
uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
}`,
			fragmentShader: `
uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	outgoingLight *= pow(0.5, length(gl_PointCoord - vec2(0.5, 0.5)) * 10.0);
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
			vertexColors: THREE.VertexColors,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		}
		var starMaterial = new THREE.ShaderMaterial(starMaterialParams);
		starMaterial.uniforms.size.value = 3;
		if (this.data.realtime) {
			this.el.setAttribute("stars", { timeMs: Date.now() });
		}
		this.currentSpeed = 0;

		getJson(this.data.source, (result) => {
			if (result) {
				for (let i = 0; i < 24; i++) {
					result.push({ dec: 0, ra: Math.PI * 2 * i / 24, mag: 2, color: new THREE.Color(1, 0, 0) });
				}
				// result.push({dec: Math.PI/2, ra:0, mag:0, color: new THREE.Color(0,1,0)}); // Polaris

				let geometry = new THREE.Geometry();
				let axisY = new THREE.Vector3(0, 1, 0);
				let axisX = new THREE.Vector3(1, 0, 0);
				for (let i = 0; i < result.length; i++) {
					var star = result[i];

					let v = new THREE.Vector3(0, 0, 1000);
					v.applyAxisAngle(axisX, -star.dec);
					v.applyAxisAngle(axisY, star.ra);

					let b = Math.max(0.05, Math.pow(0.6, star.mag));
					let color = star.color || new THREE.Color(b, b, b);

					geometry.vertices.push(v);
					geometry.colors.push(color);
				}
				let points = new THREE.Points(geometry, starMaterial);
				this.el.setObject3D('mesh', points);
			}
		});
	},
	update: function () {
		if (this.data.updateIntervalMs > 0 && this.currentSpeed != this.data.speed) {
			this.currentSpeed = this.data.speed;
			clearInterval(this.intervalId);
			let delta = this.data.speed * this.data.updateIntervalMs;
			this.intervalId = setInterval(() => {
				this.el.setAttribute("stars", { timeMs: this.data.timeMs + delta, realtime: false })
			}, this.data.updateIntervalMs);
		}

		let time = this.data.timeMs;
		let op = 365.242194;
		let d = (time / 1000 / 86400 - 80) % op; // 80: Spring equinox in 1970
		let t = time % 86400000 / 86400000.0;
		let deg = -360 * (d / op + t) - this.data.lng;
		this.el.object3D.rotation.set(THREE.Math.degToRad(90 - this.data.lat), THREE.Math.degToRad(deg), 0, 'XYZ');
	},
	remove: function () {
	}
});

AFRAME.registerShader('gridground', {
	schema: {
		color: { type: 'color', is: 'uniform', default: "#ffff00" },
		height: { default: 256 },
		offset: { type: 'vec2', default: { x: 0, y: 0 } },
		repeat: { type: 'vec2', default: { x: 1, y: 1 } },
		src: { type: 'map' },
		width: { default: 512 },
		wireframe: { default: false },
		wireframeLinewidth: { default: 2 }
	},
	init: function (data) {
		this.attributes = this.initVariables(data, 'attribute');
		this.uniforms = THREE.UniformsUtils.merge([this.initVariables(data, 'uniform'), THREE.UniformsLib.fog]);
		this.material = new (this.raw ? THREE.RawShaderMaterial : THREE.ShaderMaterial)({
			uniforms: this.uniforms,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			fog: true,
			transparent: true,
			blending: THREE.AdditiveBlending
		});
	},
	vertexShader: `
	varying vec2 vUv;
	#include <common>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <clipping_planes_pars_vertex>
	#define DISTANCE
	void main() {
		#include <color_vertex>
		#include <begin_vertex>
		#include <project_vertex>
		#include <worldpos_vertex>
		#include <clipping_planes_vertex>
		#include <fog_vertex>
		vUv = worldPosition.xz;
	}`,
	fragmentShader: `
	uniform vec3 diffuse;
	uniform vec3 color;
	uniform float opacity;
	varying vec2 vUv;
	#include <common>
	#include <color_pars_fragment>
	#include <fog_pars_fragment>
	#include <clipping_planes_pars_fragment>
	void main() {
		#include <clipping_planes_fragment>
		vec2 gpos = abs(mod(vUv * 0.2, 1.0) - vec2(0.5,0.5));
		float l = max(pow(0.5, gpos.x * 150.0), pow(0.5, gpos.y * 150.0)) * pow(0.5, length(gpos) * 40.0);
		if (l < 0.1) {
			discard;
		}
		vec4 diffuseColor = vec4( color * l, 1.0 );
		#include <color_fragment>
		gl_FragColor = diffuseColor;
		#include <fog_fragment>
	}`
});


AFRAME.registerComponent('main-menu', {
	schema: {
	},
	init: function () {
		this.configDialog = this._getEl('configDialog');
		this.openConfigButton = this._getEl('openConfigButton');
		this.exitVRButton = this._getEl('exitVRButton');

		this.configDialog.setAttribute("visible", false);
		this.openConfigButton.addEventListener('click', (e) => {
			this.configDialog.components["config-dialog"].showDialog();
		});
		this.exitVRButton.addEventListener('click', (e) => {
			document.querySelector('a-scene').exitVR();
		});
	},
	remove: function () {
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});


AFRAME.registerComponent('config-dialog', {
	schema: {
	},
	init: function () {
		this.latEl = this._getEl('lat');
		this.lngEl = this._getEl('lng');
		this.speedEl = this._getEl('speed');
		this.timeEl = this._getEl('time');
		this.resetTimeButtonEl = this._getEl('resetTime');
		this.applyButtonEl = this._getEl('apply');
		this.targetEl = document.querySelector("[stars]");

		this.applyButtonEl.addEventListener('click', (e) => {
			this.el.setAttribute("visible", false);
			this.targetEl.setAttribute("stars", {
				lat: this.latEl.value * 1.0, lng: this.lngEl.value * 1.0,
				timeMs: this.timeEl.value * 1.0, speed: this.speedEl.value * 1.0
			});
		});
		this.resetTimeButtonEl.addEventListener('click', (e) => {
			this.timeEl.value = Date.now();
			this.targetEl.setAttribute("stars", {
				timeMs: this.timeEl.value * 1.0, speed: this.speedEl.value * 1.0
			});
		});
	},
	remove: function () {
	},
	showDialog: function () {
		this.latEl.value = this.targetEl.components.stars.data.lat;
		this.lngEl.value = this.targetEl.components.stars.data.lng;
		this.speedEl.value = this.targetEl.components.stars.data.speed;
		this.timeEl.value = this.targetEl.components.stars.data.timeMs;
		this.el.setAttribute("visible", true);
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});

window.addEventListener('DOMContentLoaded', (function (e) {

	document.addEventListener('keydown', (function (e) {
		var camerEl = document.querySelector('#camerapos');
		var rotSpeed = 0.1;
		switch (e.code) {
			case "ArrowRight":
				camerEl.object3D.rotateY(-rotSpeed);
				break;
			case "ArrowLeft":
				camerEl.object3D.rotateY(rotSpeed);
				break;
			case "ArrowDown":
				camerEl.object3D.rotateX(-rotSpeed);
				break;
			case "ArrowUp":
				camerEl.object3D.rotateX(rotSpeed);
				break;
			case "Space":
				camerEl.setAttribute("rotation", { x: 0, y: 0, z: 0 });
				break;
		}
	}));

	document.addEventListener('wheel', (function (e) {
		document.querySelector('#camerapos').object3D.translateZ(e.deltaY * 0.01);
	}));

	var lastButton = false;
	function update() {
		var gp = navigator.getGamepads();
		if (gp.length > 0 && gp[0] != null) {
			var b = gp[0].buttons[0].pressed;
			if (!lastButton && b) {
				// press
				document.querySelectorAll("[drag-rotation]").forEach((el) => {
					el.setAttribute("drag-rotation", { mode: "move" });
				});
			}
			if (lastButton && !b) {
				// release
				document.querySelectorAll("[drag-rotation]").forEach((el) => {
					el.setAttribute("drag-rotation", { mode: "pan" });
				});
			}
			lastButton = b;
		}
		requestAnimationFrame(update);
	}
	update();
}), false);

addEventListener("gamepadconnected", (e) => {
});
