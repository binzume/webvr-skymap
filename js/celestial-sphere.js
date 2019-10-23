"use strict";

if (typeof AFRAME === 'undefined') {
	throw 'AFRAME is not loaded.';
}

AFRAME.registerComponent('celestial-sphere', {
	schema: {
		src: { type: 'string', default: "" },
		lat: { type: 'number', default: 35 },
		lng: { type: 'number', default: 140.0 },
		realtime: { type: 'boolean', default: true },
		timeMs: { type: 'number', default: 0 },
		updateIntervalMs: { type: 'number', default: -1 },
		speed: { type: 'number', default: 1 },
		magFactor: { type: 'number', default: 0.65 },
		magOffset: { type: 'number', default: -1.0 },
		radius: { type: 'number', default: 4000 },
		constellationSrc: { type: 'string', default: "" },
		starNameSrc: { type: 'string', default: "" },
		solarsystem: { type: 'boolean', default: true },
		constellation: { type: 'boolean', default: false },
		grid: { type: 'boolean', default: false }
	},
	init: function () {
		this.currentSpeed = 0;
		this.gridLastUpdated = 0;
		this.gridPoints = null;
		this.epoch = 946727935.816; // J2000.0
		this.oe = {
			earth: {
				name: "Earth", color: 0x0000ff, size: 6371,
				a: [1.00000261, 5.62e-06], e: [0.01671123, -4.392e-05], i: [-1.531e-05, -0.01294668],
				l: [100.46645683, 129597742.283429 / 3600, 0.0204411 / 3600, 0],
				psi: [0, 5038.481507, -1.0790069, -0.00114045, 0.000132851, -0.0000000951],
				eps: [84381.406, -46.836769, -0.0001831, 0.0020034, -5.76e-7, -4.34e-8]
			},
			moon: {
				name: "Moon", color: 0x888877, size: 1737.1,
				a: [0.0025, 0], e: 0.055545526, i: [5.15668983, -0.00008 / 3600],
				l: [218.31664563, 1732559343.48470 / 3600, -6.3910 / 3600, 0.006588 / 3600],
				o: [125.04455501, -6967919.3631 / 3600, 6.3602 / 3600, 0.007625 / 3600],
				p: [83.35324312, 14643420.2669 / 3600, -38.2702 / 3600, -0.045047 / 3600]
			},
			planets: [
				//{
				//	name: "Sun", color: 0xffffee, size: 696000,
				//	a: [0, 0], e: [0, 0], i: [0, 0], l: [0, 0], p: [0, 0], o: [0, 0]
				//},
				{
					name: "Mercury", color: 0x998855, size: 2439.7,
					a: [0.38709927, 3.7e-07], e: [0.20563593, 1.906e-05], i: [7.00497902, -0.00594749],
					l: [252.2503235, 149472.67411175], p: [77.45779628, 0.16047689], o: [48.33076593, -0.12534081]
				},
				{
					name: "Venus", color: 0xffeecc, size: 6051.8,
					a: [0.72333566, 3.9e-06], e: [0.00677672, -4.107e-05], i: [3.39467605, -0.0007889],
					l: [181.9790995, 58517.81538729], p: [131.60246718, 0.00268329], o: [76.67984255, -0.27769418]
				},
				{
					name: "Mars", color: 0x705044, size: 3390.0,
					a: [1.52371034, 1.847e-05], e: [0.0933941, 7.882e-05], i: [1.84969142, -0.00813131],
					l: [-4.55343205, 19140.30268499], p: [-23.94362959, 0.44441088], o: [49.55953891, -0.29257343]
				},
				{
					name: "Jupiter", color: 0xddbb88, size: 69911,
					a: [5.202887, -0.00011607], e: [0.04838624, -0.00013253], i: [1.30439695, -0.00183714],
					l: [34.39644051, 3034.74612775], p: [14.72847983, 0.21252668], o: [100.47390909, 0.20469106]
				},
				{
					name: "Saturn", color: 0xddcccc, size: 58232,
					a: [9.53667594, -0.0012506], e: [0.05386179, -0.00050991], i: [2.48599187, 0.00193609],
					l: [49.95424423, 1222.49362201], p: [92.59887831, -0.41897216], o: [113.66242448, -0.28867794]
				},
				{
					name: "Uranus", color: 0x445566, size: 25362,
					a: [19.18916464, -0.00196176], e: [0.04725744, -4.397e-05], i: [0.77263783, -0.00242939],
					l: [313.23810451, 428.48202785], p: [170.9542763, 0.40805281], o: [74.01692503, 0.04240589]
				},
				{
					name: "Neptune", color: 0x444488, size: 24622,
					a: [30.06992276, 0.00026291], e: [0.00859048, 5.105e-05], i: [1.77004347, 0.00035372],
					l: [-55.12002969, 218.45945325], p: [44.96476227, -0.32241464], o: [131.78422574, -0.00508664]
				},
				{
					name: "Pluto", color: 0x554444, size: 1185,
					a: [39.48211675, -0.00031596], e: [0.2488273, 5.17e-05], i: [17.14001206, 4.818e-05],
					l: [238.92903833, 145.20780515], p: [224.06891629, -0.04062942], o: [110.30393684, -0.01183482]
				}
			]
		};

		this._makeSolarSystem();
		if (this.data.src !== '') {
			this._loadStars(this.data.src);
		}
		if (this.data.realtime) {
			this.el.setAttribute("celestial-sphere", { timeMs: Date.now() });
		}
	},
	update: function () {
		if (this.data.updateIntervalMs > 0 && (this.currentSpeed != this.data.speed || this.currentTimeMs != this.data.timeMs)) {
			this.currentSpeed = this.data.speed;
			clearInterval(this.intervalId);
			let startTime = Date.now();
			let baseTime = this.data.timeMs;
			this.intervalId = setInterval(() => {
				this.currentTimeMs = baseTime + (Date.now() - startTime) * this.data.speed;
				this.el.setAttribute("celestial-sphere", { timeMs: this.currentTimeMs, realtime: false })
			}, this.data.updateIntervalMs);
		}

		const axisY = new THREE.Vector3(0, 1, 0);
		const axisZ = new THREE.Vector3(0, 0, 1);
		const degToRad = Math.PI / 180;

		let time = this.data.timeMs / 1000.0 - this.epoch;
		let T = time / (36525 * 86400);
		let eps = this._calc4(this.oe.earth.eps, T) * degToRad / 3600;
		let psi = this._calc4(this.oe.earth.psi, T) * degToRad / 3600;
		let d = this._calc4(this.oe.earth.l, T) * degToRad % (2 * Math.PI);

		let stars = this.el.getObject3D('mesh');
		if (stars) {
			stars.setRotationFromAxisAngle(axisZ, -eps);
			stars.rotateOnAxis(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
			this.starMaterial.uniforms.magFactor.value = this.data.magFactor;
			this.starMaterial.uniforms.magOffset.value = this.data.magOffset;
			// TODO...
			if (this.constellationLines) {
				this.constellationLines.quaternion.copy(stars.quaternion);
			}
		}

		this.solarSystem.visible = this.data.solarsystem;
		if (this.solarSystem.visible) {
			let oev = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, eps);
			this.solarSystem.setRotationFromAxisAngle(axisZ, -eps);
			this.solarSystem.rotateOnAxis(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
			this.solarSystem.rotateOnAxis(oev, d);

			{
				// moon
				let params = this.oe.moon;
				let l = this._calc4(params.l, T) * degToRad;
				let m = l - this._calc4(params.p, T) * degToRad;
				let o = this._calc4(params.o, T) * degToRad;
				let i = this._calc2(params.i, T) * degToRad;
				let md = 2 * params.e * Math.sin(m);
				let ov = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, i).applyAxisAngle(axisY, o).applyAxisAngle(axisZ, eps);
				// let pos = new THREE.Vector3(0, 0, 1)
				//	.applyAxisAngle(axisY, o).applyAxisAngle(ov, l - o + md).applyAxisAngle(axisZ, eps).applyAxisAngle(oev, -d);
				let pos = new THREE.Vector3(1, 0, 0).cross(ov).applyAxisAngle(ov, l + md).applyAxisAngle(oev, -d);
				this.moon.position.copy(pos.multiplyScalar(this.data.radius * 0.98));
			}

			// planets
			let earthPos = new THREE.Vector3(0, 0, this._calc2(this.oe.earth.a, T)).applyAxisAngle(axisY, d);
			for (let p = 0; p < this.oe.planets.length; p++) {
				let params = this.oe.planets[p];
				let l = this._calc2(params.l, T) * degToRad;
				let m = l - this._calc2(params.p, T) * degToRad;
				let o = this._calc2(params.o, T) * degToRad;
				let i = this._calc2(params.i, T) * degToRad;
				let md = 2 * this._calc2(params.e, T) * Math.sin(m);
				let ov = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, i).applyAxisAngle(axisY, o);
				let pos = new THREE.Vector3(0, 0, this._calc2(params.a, T))
					.applyAxisAngle(axisY, o).applyAxisAngle(ov, l - o + md);
				let rpos = pos.clone().sub(earthPos).applyAxisAngle(axisY, -d).applyAxisAngle(axisZ, eps);

				let sz = Math.min(0.0002 / rpos.length(), this.data.radius * Math.PI / 180 * 0.002 / params.size);
				this.planets[p].scale.set(sz, sz, sz);
				this.planets[p].position.copy(rpos.normalize().multiplyScalar(this.data.radius * 0.98));
			}
		}

		let er = d + (time % 86400 / 86400 + this.data.lng / 360) * 2 * Math.PI;
		this.el.object3D.rotation.set(THREE.Math.degToRad(90 - this.data.lat), -er, 0);
		if (this.constellationLines) {
			this.constellationLines.visible = this.data.constellation;
		}
		if (this.data.grid) {
			if (Math.abs(this.gridLastUpdated - this.data.timeMs) > 3600000) {
				this._makeGrid(48 * 2);
			}
		} else if (this.gridPoints !== null) {
			this.el.object3D.remove(this.gridPoints);
			this.gridPoints = null;
			this.gridLastUpdated = 0;
		}
	},
	getConstellation: function (raycaster) {
		if (!this.constellations || !this.constellationBounds) {
			return null;
		}
		let intersecs = raycaster.intersectObject(this.constellationBounds);
		if (intersecs.length == 0) {
			return null;
		}
		let n = this.constellationMaterialIndices[intersecs[0].face.materialIndex];
		return n && this.constellations[n];
	},
	selectConstellation: function (name) {
		if (!this.constellations || !this.constellationBounds) {
			return;
		}
		let c = this.constellations[name] || { lineStart: 0, lineCount: Infinity };
		this.constellationLines.geometry.setDrawRange(c.lineStart, c.lineCount * 2);
		this._lineAnimation();
	},
	findStar: function (direction, r) {
		if (!this._starNames) {
			return null;
		}
		let q = (this.el.getObject3D('mesh') || this.el.object3D).getWorldQuaternion(new THREE.Quaternion());
		let d = direction.clone().applyQuaternion(q.inverse());
		let star = null, max = r;
		// TODO: BSP-tree
		for (let sn of this._starNames) {
			if (!sn.direction) continue;
			let dd = sn.direction.dot(d);
			if (dd > max) {
				max = dd;
				star = sn;
			}
		}
		return star;
	},
	_lineAnimation: function () {
		clearInterval(this.lineAnimationTimer);
		this.constellationLines.material.uniforms.k.value = 3.0;
		this.lineAnimationTimer = setInterval(() => {
			this.constellationLines.material.uniforms.k.value -= 0.2;
			if (this.constellationLines.material.uniforms.k.value <= 0.1) {
				this.constellationLines.material.uniforms.k.value = 0.1;
				clearInterval(this.lineAnimationTimer);
			}
		}, 15);
	},
	getCoord: function (direction) {
		let q = this.el.object3D.getWorldQuaternion(new THREE.Quaternion());
		let d = direction.clone().applyQuaternion(q.inverse());
		let l = Math.sqrt(d.x * d.x + d.z * d.z);
		return [(Math.atan2(d.x, d.z) * 180 / Math.PI + 360) % 360, Math.atan2(d.y, l) * 180 / Math.PI];
	},
	_calc4: function (param, t) {
		return param[0] + (param[1] + (param[2] + param[3] * t) * t) * t;
	},
	_calc2: function (param, t) {
		return param[0] + param[1] * t;
	},
	_makeGrid: function (d) {
		if (this.gridPoints) {
			this.el.object3D.remove(this.gridPoints);
		}
		const degToRad = Math.PI / 180;
		let time = this.data.timeMs / 1000.0 - this.epoch;
		let T = time / (36525 * 86400);
		let eps = this._calc4(this.oe.earth.eps, T) * degToRad / 3600;
		let psi = this._calc4(this.oe.earth.psi, T) * degToRad / 3600;

		this.gridLastUpdated = this.data.timeMs;
		let geometry = new THREE.Geometry();
		const axisY = new THREE.Vector3(0, 1, 0);
		const axisZ = new THREE.Vector3(0, 0, 1);
		let oev = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
		var doddedCircle = function (geometry, init, axis, n, color) {
			for (let i = 0; i < n; i++) {
				geometry.vertices.push(init.clone().applyAxisAngle(axis, Math.PI * 2 * i / n));
				geometry.colors.push(color);
			}
		};
		doddedCircle(geometry, new THREE.Vector3(0, 0, this.data.radius), axisY, d, new THREE.Color(0.8, 0, 0));
		doddedCircle(geometry, new THREE.Vector3(0, 0, this.data.radius).applyAxisAngle(axisY, -psi), oev, d, new THREE.Color(0.8, 0.8, 0.4));

		var v = axisZ.clone();
		for (var i = 0; i < 6; i++) {
			doddedCircle(geometry, new THREE.Vector3(0, this.data.radius, 0), v, d, new THREE.Color(0, 0, 0.6));
			v.applyAxisAngle(axisY, 2 * Math.PI / 12);
		}
		v = new THREE.Vector3(this.data.radius, 0, 0);
		for (var i = 1; i < 4; i++) {
			doddedCircle(geometry, v.clone().applyAxisAngle(axisZ, Math.PI / 2 / 4 * i), axisY, d, new THREE.Color(0, 0, 0.6));
			doddedCircle(geometry, v.clone().applyAxisAngle(axisZ, -Math.PI / 2 / 4 * i), axisY, d, new THREE.Color(0, 0, 0.6));
		}

		/*
		let params = this.oe.moon;
		let mo = this._calc4(params.o, T) * degToRad;
		let mi = this._calc2(params.i, T) * degToRad;
		let omv = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, mi).applyAxisAngle(axisY, mo).applyAxisAngle(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
		let st = new THREE.Vector3(1, 0, 0).cross(omv).multiplyScalar(this.data.radius);
		doddedCircle(geometry, st, omv, 270, new THREE.Color(0.6, 0.5, 0.1));
		*/

		let mat = new THREE.PointsMaterial({
			vertexColors: THREE.VertexColors, fog: false, depthWrite: false, sizeAttenuation: false,
			blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation
		});
		let points = new THREE.Points(geometry, mat);
		this.el.object3D.add(points);
		this.gridPoints = points;
		this.gridPoints.visible = this.data.grid;
	},
	_makeSolarSystem: function () {
		this.solarSystem = new THREE.Group();
		this.el.setObject3D('solar', this.solarSystem);
		this._makeSun();
		this._makeMoon();

		this.planets = [];
		for (let p = 0; p < this.oe.planets.length; p++) {
			let r = this.oe.planets[p].size * this.data.radius * Math.PI / 360;
			let geometry = new THREE.SphereGeometry(r, 32, 32);
			let material = new THREE.MeshBasicMaterial({
				color: this.oe.planets[p].color || 0xaaaaaa, fog: false
			});
			let sphere = new THREE.Mesh(geometry, material);
			this.solarSystem.add(sphere);
			this.planets[p] = sphere;
		}
	},
	_makeSun: function () {
		let r = this.data.radius * 0.99 * Math.PI * 1.06 / 360;
		let geometry = new THREE.SphereGeometry(r, 32, 32);
		let material = new THREE.MeshBasicMaterial({ color: 0xffffee, fog: false });
		let sun = new THREE.Mesh(geometry, material);
		sun.position.z = -this.data.radius * 0.99;
		this.solarSystem.add(sun);
	},
	_makeMoon: function () {
		let uniforms = {
			color: { value: new THREE.Color(this.oe.moon.color) },
			light: { value: new THREE.Vector3(0, 0, -1) }
		};
		var shaderParams = {
			uniforms: THREE.UniformsUtils.merge([uniforms, THREE.UniformsLib.fog]),
			vertexShader: `
			uniform vec3 color;
			uniform vec3 light;
			varying vec3 vNormal;
			#include <common>
			#include <color_pars_vertex>
			#include <fog_pars_vertex>
			void main() {
				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <color_vertex>
				#include <begin_vertex>
				#include <project_vertex>
				#include <fog_vertex>
				vNormal = normalize( objectNormal );
			}`,
			fragmentShader: `
			uniform vec3 color;
			uniform vec3 light;
			varying vec3 vNormal;
			#include <common>
			#include <color_pars_fragment>
			#include <fog_pars_fragment>
			void main() {
				vec4 diffuseColor = vec4( color * clamp(dot(light, vNormal) * 4.0,0.05,1.0), 1.0 );
				#include <color_fragment>
				gl_FragColor = diffuseColor;
				#include <fog_fragment>
			}`
		}
		let material = new THREE.ShaderMaterial(shaderParams);
		let r = this.data.radius * 0.99 * Math.PI * 1.03 / 360;
		let geometry = new THREE.SphereGeometry(r, 32, 32);
		let moon = new THREE.Mesh(geometry, material);
		this.solarSystem.add(moon);
		this.moon = moon;
	},
	_loadStars: async function (src) {
		let response = await fetch(src);
		let result = await response.json();
		const axisY = new THREE.Vector3(0, 1, 0);
		const axisX = new THREE.Vector3(1, 0, 0);
		let pointMap = {};
		let vertices = [];
		let colors = [];
		let sizes = [];
		for (let i = 0; i < result.length; i++) {
			var star = result[i];

			let v = new THREE.Vector3(0, 0, this.data.radius)
				.applyAxisAngle(axisX, -star.dec)
				.applyAxisAngle(axisY, star.ra);

			let t = 4600 * ((1 / ((0.92 * star.bv) + 1.7)) + (1 / ((0.92 * star.bv) + 0.62)));
			if (t < 6504) {
				let bg = t / 6504 * 0.3 + 0.7;
				colors.push(new THREE.Color(1, bg, bg));
			} else {
				let rg = 6504 / t * 0.4 + 0.6;
				colors.push(new THREE.Color(rg, rg, 1));
			}
			if (star.id != null) pointMap[star.id] = vertices.length;
			vertices.push(v);
			sizes.push(star.mag);
		}

		let uniforms = {
			magFactor: { value: this.data.magFactor },
			magOffset: { value: this.data.magOffset }
		};
		var starMaterialParams = {
			uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.points.uniforms, uniforms]),
			vertexShader: `
			uniform float magFactor;
			uniform float magOffset;
			attribute float size;
			#include <common>
			#include <color_pars_vertex>
			void main() {
				#include <color_vertex>
				#include <begin_vertex>
				#include <project_vertex>
				float b = max(0.05, pow(magFactor, size + magOffset));
				vColor = vColor * b;
				gl_PointSize = 3.0 + (b > 1.0 ? sqrt(b - 1.0) * 0.5 : 0.0);	
			}`,
			fragmentShader: `
			uniform vec3 diffuse;
			uniform float opacity;
			#include <common>
			#include <color_pars_fragment>
			void main() {
				vec3 outgoingLight = vec3( 0.0 );
				vec4 diffuseColor = vec4( diffuse, opacity );
				#include <color_fragment>
				outgoingLight = diffuseColor.rgb;
				outgoingLight *= pow(0.5, length(gl_PointCoord - vec2(0.5, 0.5)) * 10.0 - 0.3);
				gl_FragColor = vec4( outgoingLight, diffuseColor.a );
			}`,
			vertexColors: THREE.VertexColors,
			depthWrite: false,
			fog: false,
			blending: THREE.AdditiveBlending
		}
		var starMaterial = new THREE.ShaderMaterial(starMaterialParams);
		this.starMaterial = starMaterial;


		let geometry = new THREE.BufferGeometry();
		let positionAttr = new THREE.BufferAttribute(new Float32Array(vertices.length * 3), 3).copyVector3sArray(vertices);
		geometry.addAttribute('position', positionAttr);
		let colorAttr = new THREE.BufferAttribute(new Float32Array(colors.length * 3), 3).copyColorsArray(colors);
		geometry.addAttribute('color', colorAttr);
		let sizeAttr = new THREE.BufferAttribute(Float32Array.from(sizes), 1);
		geometry.addAttribute('size', sizeAttr);
		let points = new THREE.Points(geometry, this.starMaterial);
		this.el.setObject3D('mesh', points);

		if (this.data.starNameSrc != '') {
			this._loadStarNames(this.data.starNameSrc, vertices, pointMap);
		}
		if (this.data.constellationSrc != '') {
			this._loadConstellations(this.data.constellationSrc, vertices, pointMap);
		}
	},
	_loadStarNames: async function (src, vertices, pointMap) {
		let response = await fetch(src);
		let starNames = await response.json();
		this._starNames = starNames;
		for (let sn of this._starNames) {
			let s = pointMap[sn.id];
			if (s != null) {
				sn.direction = vertices[s].clone().normalize();
			}
		}
	},
	_loadConstellations: async function (src, points, pointMap) {
		let response = await fetch(src);
		let constellations = await response.json();

		let uniforms = {
			k: { value: .1 }
		};
		var shaderParams = {
			uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, uniforms]),
			vertexShader: `
			attribute float vertex_dist;
			varying float len;
			varying float pos;
			#include <common>
			void main() {
				#include <begin_vertex>
				#include <project_vertex>
				len = abs(vertex_dist);
				pos = (vertex_dist + len) * .5;
			}`,
			fragmentShader: `
			uniform vec3 diffuse;
			uniform float k;
			varying float len;
			varying float pos;
			#include <common>
			void main() {
				gl_FragColor = vec4( diffuse, 1.0 ) * (smoothstep(.0, k, pos) * smoothstep(.0, k, len - pos));
			}`,
			blending: THREE.AdditiveBlending
		}
		let material = new THREE.ShaderMaterial(shaderParams);
		material.uniforms.diffuse.value = new THREE.Color(0x002244);
		let boundaryShapes = [];
		let materialIndexToName = [];
		this.constellations = {};
		let lineVerts = [], lineDists = [];
		constellations.forEach((c) => {
			this.constellations[c.name] = c;
			for (let i = 0; i < c.lines.length; i++) {
				if (pointMap[c.lines[i]] == null) {
					console.log("star not found:", c, c.lines[i]);
					c.lines.splice(i - i % 2, 2);
					i = i - i % 2 - 1;
					continue;
				}
			}
			if (!c.lines.every(p => pointMap[p] != null) || c.lines.length % 2 != 0) {
				console.log("invalid lines:", c, c.lines.filter(p => pointMap[p] == null));
				return;
			}
			this.constellations[c.name].lineStart = lineVerts.length / 3;
			this.constellations[c.name].lineCount = c.lines.length / 2;
			c.lines.forEach((p, i) => {
				points[pointMap[p]].toArray(lineVerts, lineVerts.length);
				if (i % 2 == 0) {
					let l = points[pointMap[p]].distanceTo(points[pointMap[c.lines[i + 1]]]) * 10 / this.data.radius;
					lineDists.push(-l, l);
				}
			});

			c.boundary.forEach(b => {
				// b : [ra,dec,ra,dec,...]
				let shape = new THREE.Shape();
				let lastRa = b[0];
				for (let i = 0; i < b.length / 2; i++) {
					let ra = b[i * 2], dec = b[i * 2 + 1];
					if (ra - lastRa > 180) {
						ra -= 360;
					} else if (ra - lastRa < -180) {
						ra += 360;
					}
					if (i == 0) {
						shape.moveTo(ra, dec);
					} else {
						shape.lineTo(ra, dec);
					}
					lastRa = ra;
				}
				// UMi, Oct...
				if (b[0] - lastRa < -180) {
					shape.lineTo(lastRa, b[1] > 0 ? 90 : -90);
					shape.lineTo(b[0], b[1] > 0 ? 90 : -90);
				}
				materialIndexToName.push(c.name);
				boundaryShapes.push(shape);
			});
		});

		let geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from(lineVerts), 3));
		geometry.addAttribute('vertex_dist', new THREE.BufferAttribute(Float32Array.from(lineDists), 1));

		let line = new THREE.LineSegments(geometry, material);
		this.el.object3D.add(line);
		this.constellationLines = line;
		this.constellationLines.visible = this.data.constellation;
		this.constellationMaterialIndices = materialIndexToName;

		let boundaryGeometry = new THREE.ShapeGeometry(boundaryShapes);
		const axisY = new THREE.Vector3(0, 1, 0);
		const axisX = new THREE.Vector3(1, 0, 0);
		boundaryGeometry.vertices.forEach((v) => {
			let ra = v.x, dec = v.y;
			v.set(0, 0, this.data.radius)
				.applyAxisAngle(axisX, -dec * Math.PI / 180)
				.applyAxisAngle(axisY, ra * Math.PI / 180);
		});
		let boundaryMaterial = new THREE.MeshBasicMaterial({
			wireframe: true, color: 0xff0000, visible: false, fog: false, side: THREE.BackSide
		});
		let bounds = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
		bounds.scale.set(0.1, 0.1, 0.1);
		bounds.position.set(-18, 0, -8);
		this.el.object3D.add(bounds);
		this.constellationBounds = bounds;
	}
});
