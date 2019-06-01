"use strict";

AFRAME.registerComponent('stars', {
	schema: {
		source: { type: 'string', default: "/vr/hip_stars.json" },
		lat: { type: 'number', default: 35 },
		lng: { type: 'number', default: 140.0 },
		update: { type: 'boolean', default: true },
		timeOffset: { type: 'number', default: 0 }
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
			depthWrite: false
		}
		var starMaterial = new THREE.ShaderMaterial(starMaterialParams);
		starMaterial.uniforms.size.value = 3;
		var t = 0;
		if (this.data.update) {
			this.intervalId = setInterval(() => {t += 0.001; this.el.setAttribute("stars", {timeOffset: t})}, 100);
		}

		getJson(this.data.source, (result) => {
			if (result) {
				for (let i = 0; i < 24; i++) {
					result.push({dec: 0, ra:Math.PI * 2 * i /24, mag:2, color: new THREE.Color(1,0,0)});
				}
				// result.push({dec: Math.PI/2, ra:0, mag:0, color: new THREE.Color(0,1,0)}); // Polaris

				let geometry = new THREE.Geometry();
				let axisY = new THREE.Vector3( 0, 1, 0 );
				let axisX = new THREE.Vector3( 1, 0, 0 );
				for (let i = 0; i < result.length; i++) {
					var star = result[i];
		
					let v = new THREE.Vector3(0,0,1000);
					v.applyAxisAngle( axisX, -star.dec );
					v.applyAxisAngle( axisY, star.ra );

					let b = Math.pow(0.5, star.mag);
					let color = star.color || new THREE.Color(b,b,b);

					geometry.vertices.push(v);
					geometry.colors.push(color);
				}
				let points = new THREE.Points(geometry, starMaterial);
				this.el.setObject3D('mesh', points);
			}
		});
	},
	update: function() {
		let time = new Date().getTime();
		let op = 365.242194;
		let d = (time / 1000 / 86400 - 80) % op;
		let t = -360 * (d / op + this.data.timeOffset);
		this.el.object3D.rotation.set( THREE.Math.degToRad(90 - this.data.lat), THREE.Math.degToRad(this.data.lng + t), 0, 'XYZ' );
	},
	remove: function () {
	}
});

AFRAME.registerShader('gridground', {
	schema: {
		color: {type: 'vec3', is: 'uniform', default: {x:1, y:1, z:1}},
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
      // attributes: this.attributes,
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			fog: true
	});
	this.material.uniforms.color.value = [0,0,1];
    return this.material;
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
		vec4 diffuseColor = vec4( diffuse, opacity );
		#include <color_fragment>
		vec2 gpos = abs(mod(vUv * 0.2, 1.0) - vec2(0.5,0.5));
		float l = max(pow(0.5, gpos.x * 150.0), pow(0.5, gpos.y * 150.0)) * pow(0.5, length(gpos) * 20.0);
		if (l < 0.01) {
			discard;
		}
		gl_FragColor = vec4(color * l, 1.0);
		#include <fog_fragment>
	}`
});


AFRAME.registerComponent('main-menu', {
	schema: {
	},
	init: function () {
		this.configDialog = this._getEl('configDialog');
		this.openConfigButton = this._getEl('openConfigButton');

		this.configDialog.setAttribute("visible", false);
		this.openConfigButton.addEventListener('click', (e) => {
			this.configDialog.setAttribute("visible", true);
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
		this.applyButtonEl = this._getEl('apply');

		this.applyButtonEl.addEventListener('click', (e) => {
			this.el.setAttribute("visible", false);
			document.querySelector("[stars]").setAttribute("stars", {lat: this.latEl.value*1.0, lng: this.lngEl.value * 1.0});
		});
	},
	remove: function () {
	},
	_getEl(name) {
		return this.el.querySelector("[name=" + name + "]");
	}
});


function instantiate(id, parent) {
	var p = document.createElement('a-entity');
	p.innerHTML = document.querySelector('#' + id).innerHTML;
	var el = p.firstElementChild;
	(parent || document.querySelector("a-scene")).appendChild(el);
	return el;
}

window.addEventListener('DOMContentLoaded', (function (e) {

	document.addEventListener('keydown', (function (e) {
		switch (e.code) {
			case "KeyW":
				document.querySelector('a-camera').object3D.rotateX(-0.1);
				break;
			case "KeyS":
				document.querySelector('a-camera').object3D.rotateX(0.1);
				break;
			case "ArrowRight":
				if (mediaPlayer) {
					mediaPlayer.movePos(1);
				}
				break;
			case "ArrowLeft":
				if (mediaPlayer) {
					mediaPlayer.movePos(-1);
				}
				break;
			case "Space":
				if (mediaPlayer) {
					mediaPlayer.togglePause();
				}
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
