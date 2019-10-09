"use strict";

AFRAME.ASSETS_PATH = "./3rdparty/assets"; // assets for a-frame-material

function instantiate(id, parent) {
	var p = document.createElement('div');
	p.innerHTML = document.getElementById(id).innerHTML;
	var el = p.firstElementChild;

	let mod = document.getElementById(id).dataset.import;
	if (mod) {
		(async () => {
			await import((mod.startsWith("/") || mod.includes("://")) ? mod : "../" + mod);
			(parent || document.querySelector("a-scene")).appendChild(el);
		})();
	} else {
		(parent || document.querySelector("a-scene")).appendChild(el);
	}
	return el;
}

AFRAME.registerComponent('position-controls', {
	schema: {
		arrowkeys: { default: "" },
		rotationSpeed: { default: 0.1 },
		speed: { default: 0.1 }
	},
	init: function () {
		if (this.data.arrowkeys == "rotation") {
			document.addEventListener('keydown', ev => {
				let rot = this.data.rotationSpeed;
				switch (ev.code) {
					case "ArrowRight":
						this.el.object3D.rotateY(-rot);
						break;
					case "ArrowLeft":
						this.el.object3D.rotateY(rot);
						break;
					case "ArrowDown":
						this.el.object3D.rotateX(-rot);
						break;
					case "ArrowUp":
						this.el.object3D.rotateX(rot);
						break;
					case "Space":
						this.el.setAttribute("rotation", { x: 0, y: 0, z: 0 });
						break;
				}
			});
		}
		document.addEventListener('wheel', ev => {
			this.el.object3D.translateZ(ev.deltaY * 0.01);
		});
		this.el.addEventListener('gripdown', ev => {
			document.querySelectorAll("[xy-drag-control]").forEach(el => {
				el.setAttribute("xy-drag-control", { mode: "move" });
			});
		});
		this.el.addEventListener('gripup', ev => {
			document.querySelectorAll("[xy-drag-control]").forEach(el => {
				el.setAttribute("xy-drag-control", { mode: "grab" });
			});
		});
		this.el.querySelectorAll('[laser-controls]').forEach(el => el.addEventListener('axismove', ev => {
			let speedFactor = 0.1;
			let direction = ev.target.components.raycaster.raycaster.ray.direction;
			let rot = Math.atan2(direction.x, direction.z);
			let v = new THREE.Vector3(-ev.detail.axis[0], 0, -ev.detail.axis[1]).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
			this.el.object3D.position.add(v.multiplyScalar(speedFactor));
		}));
	}
});


AFRAME.registerShader('msdf2', {
	schema: {
		diffuse: { type: 'color', is: 'uniform', default: "#ffffff" },
		opacity: { type: 'number', is: 'uniform', default: 1.0 },
		src: { type: 'map', is: 'uniform' },
		offset: { type: 'vec2', is: 'uniform', default: { x: 0, y: 0 } },
		repeat: { type: 'vec2', is: 'uniform', default: { x: 1, y: 1 } },
		msdfUnit: { type: 'vec2', is: 'uniform', default: { x: 0.1, y: 0.1 } },
	},
	init: function (data) {
		this.attributes = this.initVariables(data, 'attribute');
		this.uniforms = THREE.UniformsUtils.merge([this.initVariables(data, 'uniform'), THREE.UniformsLib.fog]);
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			flatShading: true,
			fog: true
		});
	},
	vertexShader: `
	#define USE_MAP
	#define USE_UV
	#include <common>
	#include <uv_pars_vertex>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <clipping_planes_pars_vertex>
	uniform vec2 offset;
	uniform vec2 repeat;
	void main() {
		vUv = uv * repeat + offset;
		#include <color_vertex>
		#include <begin_vertex>
		#include <project_vertex>
		#include <worldpos_vertex>
		#include <clipping_planes_vertex>
		#include <fog_vertex>
	}`,
	fragmentShader: `
	#extension GL_OES_standard_derivatives : enable
	uniform vec3 diffuse;
	uniform float opacity;
	uniform vec2 msdfUnit;
	uniform sampler2D src;
	#define USE_MAP
	#define USE_UV
	#include <common>
	#include <color_pars_fragment>
	#include <uv_pars_fragment>
	#include <fog_pars_fragment>
	#include <clipping_planes_pars_fragment>
	float median(float r, float g, float b) {
		return max(min(r, g), min(max(r, g), b));
	}
	void main() {
		#include <clipping_planes_fragment>
		vec4 sample = texture2D( src, vUv );
		float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
		sigDist *= dot(msdfUnit, 0.5/fwidth(vUv));

		vec4 diffuseColor = vec4( diffuse, opacity * clamp(sigDist + 0.5, 0.0, 1.0));
		#include <color_fragment>
		#include <alphatest_fragment>
		gl_FragColor = diffuseColor;
		#include <fog_fragment>
	}`
});

AFRAME.registerComponent('atlas', {
	schema: {
		src: { default: "" },
		index: { default: 0 },
		cols: { default: 1 },
		rows: { default: 1 },
		margin: { default: 0.01 }
	},
	update() {
		let u = (this.data.index % this.data.cols + this.data.margin) / this.data.cols;
		let v = (this.data.rows - 1 - Math.floor(this.data.index / this.data.cols) + this.data.margin) / this.data.rows;
		this.el.setAttribute("material", {
			shader: 'msdf2',
			transparent: true,
			repeat: { x: 1 / this.data.cols - this.data.margin, y: 1 / this.data.rows - this.data.margin },
			src: this.data.src
		});
		this.el.setAttribute("material", "offset", { x: u, y: v });
	},
});

AFRAME.registerShader('gridground', {
	schema: {
		color: { type: 'color', is: 'uniform', default: "#ffff00" }
	},
	init: function (data) {
		this.attributes = this.initVariables(data, 'attribute');
		this.uniforms = THREE.UniformsUtils.merge([this.initVariables(data, 'uniform'), THREE.UniformsLib.fog]);
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			fog: true,
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
		vec2 gpos = abs(mod(vUv * 0.5, 1.0) - vec2(0.5,0.5));
		float l = max(pow(0.5, gpos.x * 400.0), pow(0.5, gpos.y * 400.0)) * pow(0.5, length(gpos) * 25.0);
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
		this.configDialog = null;
		let sphereEl = document.querySelector("[celestial-sphere]");
		this.timer = setInterval(() => this._refreshTime(), 1000);
		this._getEl('openConfigButton').addEventListener('click', (e) => {
			if (!this.configDialog) {
				this.configDialog = instantiate("configDialogTemplate", this.el);
			} else {
				this.configDialog.components["config-dialog"].showDialog();
			}
		});
		this._getEl('exitVRButton').addEventListener('click', (e) => {
			document.querySelector('a-scene').exitVR();
		});
		this._getEl('constellations').addEventListener('click', (e) => {
			let v = !sphereEl.getAttribute("celestial-sphere").constellation;
			sphereEl.setAttribute("celestial-sphere", "constellation", v);
			this._getEl('constellations').querySelector("a-plane").setAttribute("material", "diffuse", v ? 0x44aaff : 0xffffff);
		});
		this._getEl('drawgrid').addEventListener('click', (e) => {
			let v = !sphereEl.getAttribute("celestial-sphere").grid;
			sphereEl.setAttribute("celestial-sphere", "grid", v);
			this._getEl('drawgrid').querySelector("a-plane").setAttribute("material", "diffuse", v ? 0x44aaff : 0xffffff);
		});
		this._getEl('drawsol').addEventListener('click', (e) => {
			let v = !sphereEl.getAttribute("celestial-sphere").solarsystem;
			sphereEl.setAttribute("celestial-sphere", "solarsystem", v);
			this._getEl('drawsol').querySelector("a-plane").setAttribute("material", "diffuse", v ? 0x44aaff : 0xffffff);
		});
		this._getEl('speed').addEventListener('change', ev => {
			sphereEl.setAttribute("celestial-sphere", "speed", [1, 60, 300, 3600, 0][ev.detail.index]);
		});
		this._getEl('time-now').addEventListener('click', (e) => {
			sphereEl.setAttribute("celestial-sphere", "timeMs", Date.now());
		});
		this._getEl('time-uy').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setFullYear(d.getFullYear() + 1));
		});
		this._getEl('time-dy').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setFullYear(d.getFullYear() - 1));
		});
		this._getEl('time-um').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setMonth(d.getMonth() + 1));
		});
		this._getEl('time-dm').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setMonth(d.getMonth() - 1));
		});
		this._getEl('time-ud').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setDate(d.getDate() + 1));
		});
		this._getEl('time-dd').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setDate(d.getDate() - 1));
		});
		this._getEl('time-uh').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setHours(d.getHours() + 1));
		});
		this._getEl('time-dh').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setHours(d.getHours() - 1));
		});
		this._getEl('time-ui').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setMinutes(d.getMinutes() + 1));
		});
		this._getEl('time-di').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setMinutes(d.getMinutes() - 1));
		});
		this._getEl('time-us').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setSeconds(d.getSeconds() + 1));
		});
		this._getEl('time-ds').addEventListener('click', (e) => {
			this._modifyTime(sphereEl, d => d.setSeconds(d.getSeconds() - 1));
		});
		this._getEl('selector').addEventListener('click', ev => {
			let component = 'constellation-selector';
			let v = !this.el.hasAttribute(component);
			if (this.el.hasAttribute(component)) {
				this.el.removeAttribute(component);
			} else {
				this.el.setAttribute(component, { raycaster: ev.detail.cursorEl });
			}
			this._getEl('selector').querySelector("a-plane").setAttribute("material", "diffuse", v ? 0x44aaff : 0xffffff);
		});
	},
	remove: function () {
		clearInterval(this.timer);
	},
	_modifyTime(sphereEl, f) {
		let d = new Date(sphereEl.getAttribute("celestial-sphere").timeMs);
		f(d);
		sphereEl.setAttribute("celestial-sphere", "timeMs", d.getTime());
		this._refreshTime();
	},
	_refreshTime() {
		let t = new Date(document.querySelector("[celestial-sphere]").getAttribute("celestial-sphere").timeMs);
		let d2 = n => ("0" + n).substr(-2);
		let timeStr = [t.getFullYear(), d2(t.getMonth() + 1), d2(t.getDate())].join("-") + " " +
			[d2(t.getHours()), d2(t.getMinutes()), d2(t.getSeconds())].join(":");
		this._getEl('time-text').setAttribute("value", timeStr);
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});

AFRAME.registerComponent('constellation-selector', {
	schema: {
		raycaster: { type: 'selector', default: "[raycaster]" }
	},
	init: function () {
		let sphereEl = document.querySelector('[celestial-sphere]');
		this.sphere = sphereEl.components['celestial-sphere'];
		this.orgconstellation = this.sphere.data.constellation;
		this.balloonEl = document.createElement('a-entity');
		this.el.sceneEl.appendChild(this.balloonEl);
		this.labelEl = document.createElement('a-xylabel');
		this.labelEl.setAttribute("xyrect", { width: 4, height: 0.4 });
		this.labelEl.setAttribute("xylabel", { align: "left", xOffset: 2.2 });
		this.labelEl.setAttribute("position", { x: 0, y: 0.2, z: 0 });
		this.coodEl = document.createElement('a-xylabel');
		this.coodEl.setAttribute("xyrect", { width: 4, height: 0.4 });
		this.coodEl.setAttribute("xylabel", { align: "left", xOffset: 2.2 });
		this.coodEl.setAttribute("position", { x: 0, y: -0.2, z: 0 });
		this.balloonEl.appendChild(this.labelEl);
		this.balloonEl.appendChild(this.coodEl);
		sphereEl.setAttribute('celestial-sphere', 'constellation', true);
		this.selected = null;
	},
	tick: function () {
		let raycaster = this.data.raycaster.components.raycaster.raycaster;
		let c = this.sphere.getConstellation(raycaster);
		if (c !== this.selected) {
			this.selected = c;
			this.sphere.selectConstellation(c ? c.name : null);
		}
		let coord = this.sphere.getCoord(raycaster.ray.direction);
		let displayName = navigator.language.startsWith("ja") ? c.nameJa : c.nameEn;
		let defformat = (d, s) => {
			let dd = Math.abs(d), d1 = Math.floor(dd), d2 = Math.floor((dd - d1) * 60);
			return (d < 0 ? "-" : "") + `${("0" + d1).slice(-2)}${s}${("0" + d2).slice(-2)}'`;
		};
		this.coodEl.setAttribute('value', "RA:" + defformat(coord[0] / 360 * 24, "h") + " Dec:" + defformat(coord[1], "d"));
		this.labelEl.setAttribute('value', c ? `${displayName} (${c.name})` : "");
		let ray = raycaster.ray;
		let rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), ray.direction);
		this.balloonEl.object3D.position.copy(ray.origin.clone().add(ray.direction.clone().multiplyScalar(10)));
		this.balloonEl.object3D.quaternion.copy(rot);
	},
	remove: function () {
		this.el.sceneEl.removeChild(this.labelEl);
		this.sphere.selectConstellation(null);
		this.sphere.el.setAttribute('celestial-sphere', 'constellation', this.orgconstellation);
	}
});

AFRAME.registerComponent('menu-on-click', {
	schema: {
		template: { type: 'string', default: "" },
		distance: { type: 'number', default: 10 },
		offsetY: { type: 'number', default: 0 },
	},
	init: function () {
		this.el.addEventListener('click', (ev) => {
			if (document.querySelector("[main-menu]")) {
				return;
			}
			var menuEl = instantiate(this.data.template);
			if (!ev.detail.cursorEl || !ev.detail.cursorEl.components.raycaster) {
				return;
			}
			var raycaster = ev.detail.cursorEl.components.raycaster.raycaster;
			var rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), raycaster.ray.direction);
			menuEl.object3D.quaternion.copy(rot);
			var d = raycaster.ray.direction.clone().multiplyScalar(this.data.distance);
			menuEl.setAttribute("position", raycaster.ray.origin.clone().add(d).add(new THREE.Vector3(0, this.data.offsetY, 0)));
		});
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
		this.targetEl = document.querySelector("[celestial-sphere]");

		this._getEl('apply').addEventListener('click', (e) => {
			this.el.setAttribute("visible", false);
			let tt = this.timeEl.value.split(/[: /-]+/).map(a => a * 1);
			let t = new Date(tt[0], tt[1] - 1, tt[2], tt[3] || 0, tt[4] || 0, tt[5] || 0);
			this.targetEl.setAttribute("celestial-sphere", {
				lat: this.latEl.value * 1.0, lng: this.lngEl.value * 1.0,
				timeMs: t.getTime(), speed: this.speedEl.value * 1.0
			});
		});
		this._getEl('gps').addEventListener('click', (e) => {
			this.getCurrentLocation();
		});
		this.showDialog();
	},
	remove: function () {
	},
	showDialog: function () {
		var attrs = this.targetEl.getAttribute("celestial-sphere");
		this.latEl.value = attrs.lat;
		this.lngEl.value = attrs.lng;
		this.speedEl.value = attrs.speed;
		let t = new Date(attrs.timeMs);
		let d2 = n => ("0" + n).substr(-2);
		this.timeEl.value = [t.getFullYear(), d2(t.getMonth() + 1), d2(t.getDate())].join("-") + " " +
			[d2(t.getHours()), d2(t.getMinutes()), d2(t.getSeconds())].join(":");
		this.el.setAttribute("visible", true);
	},
	_getEl: function (name) {
		return this.el.querySelector("[name=" + name + "]");
	},
	getCurrentLocation: function () {
		if (!navigator.geolocation) {
			console.log("geolocation unsupported");
			return;
		}
		navigator.geolocation.getCurrentPosition(location => {
			this.latEl.value = location.coords.latitude;
			this.lngEl.value = location.coords.longitude;
		}, async (err) => {
			let response = await fetch("https://ipapi.co/json/");
			let result = await response.json();
			this.latEl.value = result.latitude;
			this.lngEl.value = result.longitude;
		});
	}
});

window.addEventListener('DOMContentLoaded', (function (e) {
	document.querySelector("[main-menu]") || instantiate('mainMenuTemplate');
}), false);
