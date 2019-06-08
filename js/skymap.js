"use strict";

function instantiate(id, parent) {
	var p = document.createElement('a-entity');
	p.innerHTML = document.querySelector('#' + id).innerHTML;
	var el = p.firstElementChild;
	(parent || document.querySelector("a-scene")).appendChild(el);
	p.destroy();
	return el;
}

AFRAME.registerComponent('stars', {
	schema: {
		src: { type: 'string', default: "hip_stars.json" },
		lat: { type: 'number', default: 35 },
		lng: { type: 'number', default: 140.0 },
		realtime: { type: 'boolean', default: true },
		timeMs: { type: 'number', default: 0 },
		updateIntervalMs: { type: 'number', default: -1 },
		speed: { type: 'number', default: 1 },
		magFactor: { type: 'number', default: 0.6 },
		magOffset: { type: 'number', default: -0.5 },
		constellationSrc: { type: 'string', default: "" },
		constellation: { type: 'boolean', default: false },
		debug: { type: 'boolean', default: true }
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
		this.starMaterial = starMaterial;
		if (this.data.realtime) {
			this.el.setAttribute("stars", { timeMs: Date.now() });
		}
		this.currentSpeed = 0;

		getJson(this.data.src, (result) => {
			result = result || [];
			let geometry = new THREE.Geometry();
			let axisY = new THREE.Vector3(0, 1, 0);
			let axisX = new THREE.Vector3(1, 0, 0);
			let pointMap = {};
			for (let i = 0; i < result.length; i++) {
				var star = result[i];

				let v = new THREE.Vector3(0, 0, 1000);
				v.applyAxisAngle(axisX, -star.dec);
				v.applyAxisAngle(axisY, star.ra);

				let b = Math.max(0.05, Math.pow(this.data.magFactor, star.mag + this.data.magOffset));
				let color = star.color || new THREE.Color(b, b, b);

				if (star.id != null) pointMap[star.id] = geometry.vertices.length;
				geometry.vertices.push(v);
				geometry.colors.push(color);
			}
			let points = new THREE.Points(geometry, starMaterial);
			this.el.setObject3D('mesh', points);

			if (this.data.constellationSrc != "") {
				getJson(this.data.constellationSrc, (constellations) => {
					if (constellations) this._makeCLines(points, pointMap, constellations);
				});
			}
			this._makeGrid(48);
			this._makeSun();
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
		let d = (time / 1000 / 86400 - 79) % op; // 79: Spring equinox in 1970
		let t = time % 86400000 / 86400000.0;
		let deg = -360 * (d / op + t) - this.data.lng;
		this.el.object3D.rotation.set(THREE.Math.degToRad(90 - this.data.lat), THREE.Math.degToRad(deg), 0, 'XYZ');
		if (this.constellations) {
			this.constellations.visible = this.data.constellation;
		}
		if (this.gridPoints) {
			this.gridPoints.visible = this.data.constellation;
		}
		if (this.sun) {
			let oe = 84381.406 / 3600 * Math.PI / 180;
			let axisZ = new THREE.Vector3(0, 0, 1);
			let oev = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, oe);
			let r = d / op * Math.PI * 2;
			this.sun.setRotationFromAxisAngle(oev, r);
		}
	},
	remove: function () {
	},
	_makeGrid: function (d) {
		let geometry = new THREE.Geometry();
		let axisY = new THREE.Vector3(0, 1, 0);
		let axisZ = new THREE.Vector3(0, 0, 1);
		let oe = 84381.406 / 3600 * Math.PI / 180;
		let oev = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, oe);
		for (let i = 0; i < d; i++) {
			let v = new THREE.Vector3(0, 0, 1000).applyAxisAngle(axisY, Math.PI * 2 * i / d);
			geometry.vertices.push(v);
			geometry.colors.push(new THREE.Color(0.8, 0, 0));

			let ov = new THREE.Vector3(0, 0, 1000).applyAxisAngle(oev, Math.PI * 2 * i / d);
			geometry.vertices.push(ov);
			geometry.colors.push(new THREE.Color(0.8, 0.8, 0));
		}
		let points = new THREE.Points(geometry, this.starMaterial);

		this.el.object3D.add(points);
		this.gridPoints = points;
		this.gridPoints.visible = this.data.constellation;
	},
	_makeSun: function (d) {
		let geometry = new THREE.SphereGeometry( 4.63, 32, 32 );
		let material = new THREE.MeshBasicMaterial( {color: 0xffffee, fog: false} );
		let sun = new THREE.Mesh( geometry, material );
		sun.position.z = 1000;
		let sunC = new THREE.Object3D();
		sunC.add(sun);
		this.el.object3D.add(sunC);
		this.sun = sunC;
	},
	_makeCLines: function (points, pointMap, constellations) {
		var material = new THREE.LineBasicMaterial({
			color: 0x002244,
			fog: false
		});
		var geometry = new THREE.Geometry();
		constellations.forEach(c => {
			if (!c.lines.every(p => pointMap[p] != null) || c.lines.length % 2 != 0) {
				console.log("star not found:", c);
				return;
			}
			c.lines.forEach(p => geometry.vertices.push(points.geometry.vertices[pointMap[p]]));
		});
		let line = new THREE.LineSegments(geometry, material);
		this.el.object3D.add(line);
		this.constellations = line;
		this.constellations.visible = this.data.constellation;
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
		this.configDialog = null;
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
			var el = document.querySelector("[stars]");
			el.setAttribute("stars", "constellation", !el.getAttribute("stars").constellation);
		});
		this._getEl('speed-x1').addEventListener('click', (e) => {
			document.querySelector("[stars]").setAttribute("stars", "speed", 1.0);
		});
		this._getEl('speed-x60').addEventListener('click', (e) => {
			document.querySelector("[stars]").setAttribute("stars", "speed", 60.0);
		});
		this._getEl('speed-x300').addEventListener('click', (e) => {
			document.querySelector("[stars]").setAttribute("stars", "speed", 300.0);
		});
		this._getEl('speed-x3600').addEventListener('click', (e) => {
			document.querySelector("[stars]").setAttribute("stars", "speed", 3600.0);
		});
		this._getEl('time-now').addEventListener('click', (e) => {
			document.querySelector("[stars]").setAttribute("stars", "timeMs", Date.now());
		});
		this.timer = setInterval(() => {
			let t = new Date(document.querySelector("[stars]").getAttribute("stars").timeMs);
			let d2 = n => ("0" + n).substr(-2);
			let timeStr = [t.getFullYear(), d2(t.getMonth() + 1), d2(t.getDate())].join("-") + " " +
				[d2(t.getHours()), d2(t.getMinutes()), d2(t.getSeconds())].join(":");
			this._getEl('time-text').setAttribute("value", timeStr);
		}, 1000);
	},
	remove: function () {
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});

AFRAME.registerComponent('menu-on-click', {
	schema: {
		template: { type: 'string', default: "" },
		distance: { type: 'number', default: 10 },
		offsetY: { type: 'number', default: 0 },
	},
	init: function () {
		this.el.classList.add("clickable");
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
		this.targetEl = document.querySelector("[stars]");

		this._getEl('apply').addEventListener('click', (e) => {
			this.el.setAttribute("visible", false);
			let tt = this.timeEl.value.split(/[: /-]+/).map(a => a * 1);
			let t = new Date(tt[0], tt[1] - 1, tt[2], tt[3] || 0, tt[4] || 0, tt[5] || 0);
			this.targetEl.setAttribute("stars", {
				lat: this.latEl.value * 1.0, lng: this.lngEl.value * 1.0,
				timeMs: t.getTime(), speed: this.speedEl.value * 1.0
			});
		});
		this.showDialog();
	},
	remove: function () {
	},
	showDialog: function () {
		this.latEl.value = this.targetEl.components.stars.data.lat;
		this.lngEl.value = this.targetEl.components.stars.data.lng;
		this.speedEl.value = this.targetEl.components.stars.data.speed;
		let t = new Date(this.targetEl.components.stars.data.timeMs);
		let d2 = n => ("0" + n).substr(-2);
		this.timeEl.value = [t.getFullYear(), d2(t.getMonth() + 1), d2(t.getDate())].join("-") + " " +
			[d2(t.getHours()), d2(t.getMinutes()), d2(t.getSeconds())].join(":");
		this.el.setAttribute("visible", true);
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});

window.addEventListener('DOMContentLoaded', (function (e) {
	document.querySelector("[main-menu]") || instantiate('mainMenuTemplate');

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
