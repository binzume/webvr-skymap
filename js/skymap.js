"use strict";

AFRAME.registerComponent('instantiate-on-click', {
	schema: {
		template: { default: '' },
		id: { default: '' },
		event: { default: 'click' },
		parent: { default: '' },
	},
	init() {
		this.el.addEventListener(this.data.event, async (ev) => {
			let parent = this.data.parent ? document.querySelector(this.data.parent) : null;
			if (this.data.id && document.getElementById(this.data.id)) {
				if (!parent) {
					this._updateRotation(document.getElementById(this.data.id));
				}
				return;
			}
			let el = await this.instantiate(document.getElementById(this.data.template), parent);
			if (this.data.id) {
				el.id = this.data.id;
			}
			if (!ev.detail.cursorEl || !ev.detail.cursorEl.components.raycaster) {
				return;
			}
			if (parent) {
				return;
			}
			var raycaster = ev.detail.cursorEl.components.raycaster.raycaster;
			var rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), raycaster.ray.direction);
			var origin = raycaster.ray.origin;

			el.addEventListener('loaded', (ev) => {
				// @ts-ignore
				let pos = new THREE.Vector3(0, 0, el.getAttribute('position').z).applyQuaternion(rot);
				// @ts-ignore
				el.setAttribute('position', pos.add(origin));
				this._updateRotation(el);
			}, { once: true });
		});
	},
	async instantiate(template, parent = null) {
		let wrapper = document.createElement('div');
		wrapper.innerHTML = ['SCRIPT', 'TEMPLATE'].includes(template.tagName) ? template.innerHTML : template.outerHTML;
		let el = wrapper.firstElementChild;
		(parent || this.el.sceneEl).appendChild(el);
		return el;
	},
	_updateRotation(el) {
		let camPos = new THREE.Vector3();
		let camRot = new THREE.Quaternion();
		this.el.sceneEl.camera.matrixWorld.decompose(camPos, camRot, new THREE.Vector3());
		let targetPosition = el.object3D.getWorldPosition(new THREE.Vector3());
		let tr = new THREE.Matrix4().lookAt(camPos, targetPosition, new THREE.Vector3(0, 1, 0));
		el.object3D.setRotationFromMatrix(tr);
	}
});

AFRAME.registerComponent('sky-pointer', {
	schema: {
		event: { default: "gripdown" },
		lineColor: { default: '#3060a0' }
	},
	init() {
		let sphereEl = document.querySelector("[celestial-sphere]");
		let component = 'celestial-cursor';
		this.el.addEventListener(this.data.event, ev => {
			let c = sphereEl.getAttribute(component);
			if (!c || c.raycaster != this.el) {
				sphereEl.setAttribute(component, { raycaster: this.el });
				this.el.setAttribute('line', { color: '#3050b0' });
			} else {
				sphereEl.removeAttribute(component);
				this.el.setAttribute('line', { color: this.data.lineColor });
			}
		});
	}
});

AFRAME.registerComponent('position-controls', {
	schema: {
		arrowkeys: { default: "rotation" },
		wasdkeys: { default: "translation" },
		axismove: { default: "translation" },
		speed: { default: 0.1 },
		rotationSpeed: { default: 0.1 }
	},
	init() {
		let data = this.data;
		let el = this.el;
		if (data.arrowkeys || data.wasdkeys) {
			let fns = {
				rotation: [
					(o) => o.rotateY(-data.rotationSpeed),
					(o) => o.rotateY(data.rotationSpeed),
					(o) => o.rotateX(-data.rotationSpeed),
					(o) => o.rotateX(data.rotationSpeed),
					(o) => o.quaternion.set(0, 0, 0, 1)
				],
				translation: [
					(o) => o.translateX(-data.speed),
					(o) => o.translateX(data.speed),
					(o) => o.translateZ(data.speed),
					(o) => o.translateZ(-data.speed),
					(o) => o.position.set(0, 0, 0)
				]
			};
			let arrowKeyFns = fns[data.arrowkeys] || [];
			let wasdKeyFns = fns[data.wasdkeys] || [];
			document.addEventListener('keydown', ev => {
				if (document.activeElement != document.body) {
					return;
				}
				switch (ev.code) {
					case "ArrowRight":
						arrowKeyFns[0] && arrowKeyFns[0](this.el.object3D);
						break;
					case "ArrowLeft":
						arrowKeyFns[1] && arrowKeyFns[1](this.el.object3D);
						break;
					case "ArrowDown":
						arrowKeyFns[2] && arrowKeyFns[2](this.el.object3D);
						break;
					case "ArrowUp":
						arrowKeyFns[3] && arrowKeyFns[3](this.el.object3D);
						break;
					case "Space":
						arrowKeyFns[4] && arrowKeyFns[4](this.el.object3D);
						break;
					case "KeyA":
						wasdKeyFns[0] && wasdKeyFns[0](this.el.object3D);
						break;
					case "KeyD":
						wasdKeyFns[1] && wasdKeyFns[1](this.el.object3D);
						break;
					case "KeyS":
						wasdKeyFns[2] && wasdKeyFns[2](this.el.object3D);
						break;
					case "KeyW":
						wasdKeyFns[3] && wasdKeyFns[3](this.el.object3D);
						break;
				}
			});
		}
		el.querySelectorAll('[laser-controls]').forEach(el => el.addEventListener('thumbstickmoved', ev => {
			let direction = ev.target.components.raycaster.raycaster.ray.direction;
			if (this.data.axismove == "translation") {
				let rot = Math.atan2(direction.x, direction.z);
				let v = new THREE.Vector3(-ev.detail.x, 0, -ev.detail.y).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
				el.object3D.position.add(v.multiplyScalar(this.data.speed));
			} else if (this.data.axismove == "rotation") {
				el.object3D.rotateY(-(ev.detail.x) * this.data.rotationSpeed * 0.1);
			} else {
				let rot = Math.atan2(direction.x, direction.z);
				let v = new THREE.Vector3(0, 0, -ev.detail.y).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
				el.object3D.position.add(v.multiplyScalar(this.data.speed));
				el.object3D.rotateY(-ev.detail.x * this.data.rotationSpeed * 0.1);
			}
		}));
	}
});


AFRAME.registerComponent('fill-parent', {
	async init() {
		let el = this.el;
		let parentEl = el.parentNode;
		el.setAttribute("xyitem", { fixed: true });
		if (!parentEl.hasLoaded) {
			await new Promise((resolve, _) => parentEl.addEventListener('loaded', resolve, { once: true }));
		}
		let resize = (rect) => rect && el.setAttribute("geometry", { width: rect.width, height: rect.height });
		parentEl.addEventListener('xyresize', (ev) => resize(ev.detail.xyrect));
		resize(parentEl.components.xyrect);
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
	init(data) {
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
	// #extension GL_OES_standard_derivatives : enable
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
		vec4 texcol = texture2D( src, vUv );
		float sigDist = median(texcol.r, texcol.g, texcol.b) - 0.5;
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

AFRAME.registerComponent('main-menu', {
	schema: {
	},
	init() {
		let sphereEl = document.querySelector("[celestial-sphere]");
		this.timer = setInterval(() => this._refreshTime(), 1000);
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
			if (sphereEl.components['celestial-sphere'].constellationBounds) sphereEl.components['celestial-sphere'].constellationBounds.visible = v;
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
			let component = 'celestial-cursor';
			let v = !sphereEl.hasAttribute(component);
			if (v) {
				sphereEl.setAttribute(component, { raycaster: ev.detail.cursorEl });
			} else {
				sphereEl.removeAttribute(component);
			}
			this._getEl('selector').querySelector("a-plane").setAttribute("material", "diffuse", v ? 0x44aaff : 0xffffff);
		});
	},
	remove() {
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

AFRAME.registerComponent('celestial-cursor', {
	schema: {
		raycaster: { type: 'selector', default: "[raycaster]" }
	},
	init() {
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
	tick() {
		let raycaster = this.data.raycaster.components.raycaster.raycaster;
		let coord = this.sphere.getCoord(raycaster.ray.direction);
		let starData = this.sphere.findStar(raycaster.ray.direction, 0.9998);
		if (starData) {
			coord = [starData.ra, starData.dec];
			this.sphere.setCursor(starData.ra, starData.dec);
		} else {
			this.sphere.clearCursor();
		}
		let c = this.sphere.getConstellation(coord[0], coord[1]);
		if (c !== this.selected) {
			this.selected = c;
			this.sphere.selectConstellation(c ? c.name : null);
		}
		let displayName = c ? (navigator.language.startsWith("ja") ? c.nameJa : c.nameEn) + ` (${c.name})` : "";
		if (starData) {
			let starName = (navigator.language.startsWith("ja") ? starData.nameJa || starData.nameEn : starData.nameEn);
			if (starData.type == "solar") {
				displayName = starName;
			} else {
				displayName = starName + " :" + displayName;
			}
		}
		let defformat = (d, s) => {
			let dd = Math.abs(d), d1 = Math.floor(dd), d2 = Math.floor((dd - d1) * 60);
			return `${d1}${s}${("0" + d2).slice(-2)}`;
		};
		this.coodEl.setAttribute('value', "RA:" + defformat(coord[0] * 24 / 360, "h") + "m Dec:"
			+ (coord[1] < 0 ? "-" : "+") + defformat(coord[1], " ") + "'");
		this.labelEl.setAttribute('value', displayName);
		let ray = raycaster.ray;
		this.balloonEl.object3D.position.copy(ray.origin.clone().add(ray.direction.clone().multiplyScalar(10)));
		this.balloonEl.object3D.lookAt(ray.origin);
	},
	remove() {
		this.el.sceneEl.removeChild(this.balloonEl);
		this.sphere.selectConstellation(null);
		this.sphere.clearCursor();
		this.sphere.el.setAttribute('celestial-sphere', 'constellation', this.orgconstellation);
	}
});


AFRAME.registerComponent('config-dialog', {
	schema: {
	},
	init() {
		this.latEl = this._getEl('lat');
		this.lngEl = this._getEl('lng');
		this.speedEl = this._getEl('speed');
		this.timeEl = this._getEl('time');
		this.targetEl = document.querySelector("[celestial-sphere]");

		this._getEl('apply').addEventListener('click', (e) => {
			let tt = this.timeEl.value.split(/[: /-]+/).map(a => a * 1);
			let t = new Date(tt[0], tt[1] - 1, tt[2], tt[3] || 0, tt[4] || 0, tt[5] || 0);
			this.targetEl.setAttribute("celestial-sphere", {
				lat: this.latEl.value * 1.0, lng: this.lngEl.value * 1.0,
				timeMs: t.getTime(), speed: this.speedEl.value * 1.0
			});
			this.el.parentElement.removeChild(this.el);
		});
		this._getEl('gps').addEventListener('click', (e) => {
			this.getCurrentLocation();
		});
		let magOffset = this._getEl('magOffset');
		magOffset.addEventListener('change', (ev) => {
			this.targetEl.setAttribute("celestial-sphere", "magOffset", ev.detail.value);
		});
		magOffset.setAttribute("value", this.targetEl.getAttribute("celestial-sphere").magOffset);
		this.showDialog();
	},
	remove() {
	},
	showDialog() {
		var attrs = this.targetEl.getAttribute("celestial-sphere");
		this.latEl.value = attrs.lat;
		this.lngEl.value = attrs.lng;
		this.speedEl.value = attrs.speed;
		let t = new Date(attrs.timeMs);
		let d2 = n => ("0" + n).substr(-2);
		this.timeEl.value = [t.getFullYear(), d2(t.getMonth() + 1), d2(t.getDate())].join("-") + " " +
			[d2(t.getHours()), d2(t.getMinutes()), d2(t.getSeconds())].join(":");
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	},
	getCurrentLocation() {
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


async function instantiate(id, parent) {
	let template = document.getElementById(id);
	let wrapper = document.createElement('div');
	wrapper.innerHTML = ['SCRIPT', 'TEMPLATE'].includes(template.tagName) ? template.innerHTML : template.outerHTML;
	var el = wrapper.firstElementChild;
	(parent || document.querySelector('a-scene')).appendChild(el);
	return el;
}

window.addEventListener('DOMContentLoaded', async (ev) => {
	(await instantiate('mainMenuTemplate')).id = "mainMenu";
});
