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
		magOffset: { type: 'number', default: -0.5 },
		radius: { type: 'number', default: 4000 },
		constellationSrc: { type: 'string', default: "" },
		solarsystem: { type: 'boolean', default: true },
		constellation: { type: 'boolean', default: false },
		grid: { type: 'boolean', default: false }
	},
	init: function () {
		var starMaterialParams = {
			uniforms: THREE.ShaderLib.points.uniforms,
			vertexShader: `
			uniform float size;
			uniform float scale;
			#include <common>
			#include <color_pars_vertex>
			void main() {
				#include <color_vertex>
				#include <begin_vertex>
				#include <project_vertex>
				gl_PointSize = size;
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
			blending: THREE.AdditiveBlending
		}
		var starMaterial = new THREE.ShaderMaterial(starMaterialParams);
		starMaterial.uniforms.size.value = 3;
		this.starMaterial = starMaterial;
		this.currentSpeed = 0;
		this.gridLastUpdated = 0;
		this.gridPoints = null;
		this.epoch = 946727935.816; // J2000.0
		this.oe = {
			moon: {
				a: 1, e: 0.055545526, i: 5.15668983 * Math.PI / 180,
				l: [218.31664563 * 3600, 1732559343.48470, -6.3910, 0.006588],
				o: [125.04455501 * 3600, -6967919.3631, 6.3602, 0.007625],
				p: [83.35324312 * 3600, 14643420.2669, -38.2702, -0.045047],
				o0: 125.04455501 * Math.PI / 180, o1: -6967919.3631 / 3600 * Math.PI / 180,
				p0: 83.35324312 * Math.PI / 180, p1: 14643420.2669 / 3600 * Math.PI / 180
			},
			earth: {
				a: 1.00000261, e: 0.0167086342, i: 46.997289 / 3600 * Math.PI / 180,
				l: [100.46645683 * 3600, 129597742.283429, 0.0204411, 0],
				psi: [0, 5038.481507, -1.0790069, -0.00114045, 0.000132851, -0.0000000951],
				eps: [84381.406, -46.836769, -0.0001831, 0.0020034, -5.76e-7, -4.34e-8]
			}
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
		const secToRad = Math.PI / 180 / 3600;
		let time = this.data.timeMs / 1000.0 - this.epoch;
		let T = time / (36525 * 86400);
		let eps = this._calc4(this.oe.earth.eps, T) * secToRad;
		let psi = this._calc4(this.oe.earth.psi, T) * secToRad;
		let d = (this._calc4(this.oe.earth.l, T) * secToRad + Math.PI) % (2 * Math.PI);

		let stars = this.el.getObject3D('mesh');
		if (stars) {
			stars.setRotationFromAxisAngle(axisZ, -eps);
			stars.rotateOnAxis(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
			// TODO...
			if (this.constellationLines) {
				this.constellationLines.quaternion.copy(stars.quaternion);
			}
		}

		this.solarSystem.visible = stars && this.data.solarsystem;
		if (this.solarSystem.visible) {
			let oev = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, eps);
			this.solarSystem.setRotationFromAxisAngle(axisZ, -eps);
			this.solarSystem.rotateOnAxis(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
			this.solarSystem.rotateOnAxis(oev, d);

			// moon
			let params = this.oe.moon;
			let L = this._calc4(params.l, T) * secToRad;
			let M = L - this._calc4(params.p, T) * secToRad;
			let mo = this._calc4(params.o, T) * secToRad;
			let md = 2 * params.e * Math.sin(M);
			let omv = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, params.i).applyAxisAngle(axisY, mo).applyAxisAngle(axisZ, eps);
			let st = new THREE.Vector3(1, 0, 0).cross(omv).multiplyScalar(this.data.radius * 0.98);
			let pos = st.applyAxisAngle(omv, L + md).applyAxisAngle(oev, -d);

			this.moon.position.copy(pos);
		}

		let er = d + (time % 86400 / 86400 + this.data.lng / 360) * 2 * Math.PI + Math.PI;
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
	_makeGrid: function (d) {
		if (this.gridPoints) {
			this.el.object3D.remove(this.gridPoints);
		}
		const secToRad = Math.PI / 180 / 3600;
		let time = this.data.timeMs / 1000.0 - this.epoch;
		let T = time / (36525 * 86400);
		let eps = this._calc4(this.oe.earth.eps, T) * secToRad;
		let psi = this._calc4(this.oe.earth.psi, T) * secToRad;

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
			doddedCircle(geometry, new THREE.Vector3(0, this.data.radius, 0), v, d, new THREE.Color(0, 0, 0.4));
			v.applyAxisAngle(axisY, 2 * Math.PI / 12);
		}
		v = new THREE.Vector3(this.data.radius, 0, 0);
		for (var i = 1; i < 4; i++) {
			doddedCircle(geometry, v.clone().applyAxisAngle(axisZ, Math.PI / 2 / 4 * i), axisY, d, new THREE.Color(0, 0, 0.4));
			doddedCircle(geometry, v.clone().applyAxisAngle(axisZ, -Math.PI / 2 / 4 * i), axisY, d, new THREE.Color(0, 0, 0.4));
		}

		let params = this.oe.moon;
		let mo = params.o0 + params.o1 * T;
		let omv = new THREE.Vector3(0, 1, 0).applyAxisAngle(axisZ, params.i).applyAxisAngle(axisY, mo).applyAxisAngle(axisZ.clone().applyAxisAngle(axisY, -psi), eps);
		let st = new THREE.Vector3(1, 0, 0).cross(omv).multiplyScalar(this.data.radius);
		// doddedCircle(geometry, st, omv, 270, new THREE.Color(0.6, 0.5, 0.1));

		let points = new THREE.Points(geometry, this.starMaterial);
		this.el.object3D.add(points);
		this.gridPoints = points;
		this.gridPoints.visible = this.data.grid;
	},
	_makeSolarSystem: function () {
		this.solarSystem = new THREE.Object3D();
		this.el.setObject3D('solar', this.solarSystem);
		this._makeSun();
		this._makeMoon();
	},
	_makeSun: function () {
		let r = this.data.radius * 0.99 * Math.PI * 1.06 / 360;
		let geometry = new THREE.SphereGeometry(r, 32, 32);
		let material = new THREE.MeshBasicMaterial({ color: 0xffffee, fog: false });
		let sun = new THREE.Mesh(geometry, material);
		sun.position.z = this.data.radius * 0.99;
		this.solarSystem.add(sun);
	},
	_makeMoon: function () {
		let uniforms = {
			color: { value: new THREE.Color(0x888877) },
			light: { value: new THREE.Vector3(0, 0, 1) }
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
				vec4 diffuseColor = vec4( color * clamp(dot(light, vNormal) * 4.0,0.1,1.0), 1.0 );
				#include <color_fragment>
				gl_FragColor = diffuseColor;
				#include <fog_fragment>
			}`
		}
		let material = new THREE.ShaderMaterial(shaderParams);
		// let material = new THREE.MeshBasicMaterial({ color: 0x555544, fog: false });
		let r = this.data.radius * 0.99 * Math.PI * 1.03 / 360;
		let geometry = new THREE.SphereGeometry(r, 32, 32);
		let moon = new THREE.Mesh(geometry, material);
		this.solarSystem.add(moon);
		this.moon = moon;
	},
	_loadStars: async function (src) {
		let response = await fetch(src);
		let result = await response.json();
		let geometry = new THREE.Geometry();
		const axisY = new THREE.Vector3(0, 1, 0);
		const axisX = new THREE.Vector3(1, 0, 0);
		let pointMap = {};
		for (let i = 0; i < result.length; i++) {
			var star = result[i];

			let v = new THREE.Vector3(0, 0, this.data.radius)
				.applyAxisAngle(axisX, -star.dec)
				.applyAxisAngle(axisY, star.ra);

			let b = Math.max(0.05, Math.pow(this.data.magFactor, star.mag + this.data.magOffset));
			let t = 4600 * ((1 / ((0.92 * star.bv) + 1.7)) + (1 / ((0.92 * star.bv) + 0.62)));
			if (t < 6504) {
				let bg = t / 6504 * 0.3 + 0.7;
				geometry.colors.push(new THREE.Color(b, b * bg, b * bg));
			} else {
				let rg = 6504 / t * 0.4 + 0.6;
				geometry.colors.push(new THREE.Color(b * rg, b * rg, b));
			}
			if (star.id != null) pointMap[star.id] = geometry.vertices.length;
			geometry.vertices.push(v);
		}
		let points = new THREE.Points(geometry, this.starMaterial);
		this.el.setObject3D('mesh', points);

		if (this.data.constellationSrc != '') {
			this._loadConstellations(this.data.constellationSrc, points, pointMap);
		}
	},
	_loadConstellations: async function (src, points, pointMap) {
		let response = await fetch(src);
		let constellations = await response.json();

		let material = new THREE.LineBasicMaterial({
			color: 0x002244,
			fog: false
		});
		let geometry = new THREE.BufferGeometry();
		let boundaryShapes = [];
		let materialIndexToName = [];
		this.constellations = {};
		let lineVerts = [];
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
			c.lines.forEach(p => {
				points.geometry.vertices[pointMap[p]].toArray(lineVerts, lineVerts.length);
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

		geometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from(lineVerts), 3));

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
