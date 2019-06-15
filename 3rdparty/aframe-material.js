/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	(function () {
	  if (!AFRAME) {
	    return console.error('AFRAME is required!');
	  }
	  if (!AFRAME.ASSETS_PATH) {
	    AFRAME.ASSETS_PATH = "./assets";
	  }
	  __webpack_require__(2);
	  __webpack_require__(3);
	  __webpack_require__(13);
	  __webpack_require__(14);
	  __webpack_require__(17);
	  __webpack_require__(18);
	  __webpack_require__(21);
	  __webpack_require__(24);
	})();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	!function(t){function e(i){if(a[i])return a[i].exports;var d=a[i]={exports:{},id:i,loaded:!1};return t[i].call(d.exports,d,d.exports,e),d.loaded=!0,d.exports}var a={};return e.m=t,e.c=a,e.p="",e(0)}([function(t,e){AFRAME.registerComponent("rounded",{schema:{enabled:{default:!0},width:{type:"number",default:1},height:{type:"number",default:1},radius:{type:"number",default:.3},topLeftRadius:{type:"number",default:-1},topRightRadius:{type:"number",default:-1},bottomLeftRadius:{type:"number",default:-1},bottomRightRadius:{type:"number",default:-1},color:{type:"color",default:"#F0F0F0"},opacity:{type:"number",default:1}},init:function(){this.rounded=new THREE.Mesh(this.draw(),new THREE.MeshPhongMaterial({color:new THREE.Color(this.data.color),side:THREE.DoubleSide})),this.updateOpacity(),this.el.setObject3D("mesh",this.rounded)},update:function(){this.data.enabled?this.rounded&&(this.rounded.visible=!0,this.rounded.geometry=this.draw(),this.rounded.material.color=new THREE.Color(this.data.color),this.updateOpacity()):this.rounded.visible=!1},updateOpacity:function(){this.data.opacity<0&&(this.data.opacity=0),this.data.opacity>1&&(this.data.opacity=1),this.data.opacity<1?this.rounded.material.transparent=!0:this.rounded.material.transparent=!1,this.rounded.material.opacity=this.data.opacity},tick:function(){},remove:function(){this.rounded&&(this.el.object3D.remove(this.rounded),this.rounded=null)},draw:function(){function t(t,e,a,i,d,o,u,r,s){o||(o=1e-5),u||(u=1e-5),r||(r=1e-5),s||(s=1e-5),t.moveTo(e,a+o),t.lineTo(e,a+d-o),t.quadraticCurveTo(e,a+d,e+o,a+d),t.lineTo(e+i-u,a+d),t.quadraticCurveTo(e+i,a+d,e+i,a+d-u),t.lineTo(e+i,a+s),t.quadraticCurveTo(e+i,a,e+i-s,a),t.lineTo(e+r,a),t.quadraticCurveTo(e,a,e,a+r)}var e=new THREE.Shape,a=[this.data.radius,this.data.radius,this.data.radius,this.data.radius];return this.data.topLeftRadius!=-1&&(a[0]=this.data.topLeftRadius),this.data.topRightRadius!=-1&&(a[1]=this.data.topRightRadius),this.data.bottomLeftRadius!=-1&&(a[2]=this.data.bottomLeftRadius),this.data.bottomRightRadius!=-1&&(a[3]=this.data.bottomRightRadius),t(e,0,0,this.data.width,this.data.height,a[0],a[1],a[2],a[3]),new THREE.ShapeBufferGeometry(e)},pause:function(){},play:function(){}}),AFRAME.registerPrimitive("a-rounded",{defaultComponents:{rounded:{}},mappings:{enabled:"rounded.enabled",width:"rounded.width",height:"rounded.height",radius:"rounded.radius","top-left-radius":"rounded.topLeftRadius","top-right-radius":"rounded.topRightRadius","bottom-left-radius":"rounded.bottomLeftRadius","bottom-right-radius":"rounded.bottomRightRadius",color:"rounded.color",opacity:"rounded.opacity"}})}]);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Draw = __webpack_require__(5);
	var Behaviors = __webpack_require__(9);
	var SFX = __webpack_require__(11);
	var Event = __webpack_require__(10);
	
	AFRAME.registerComponent('keyboard', {
	  schema: {
	    isOpen: { type: "boolean", default: false },
	    physicalKeyboard: { type: "boolean", default: false }
	  },
	  currentInput: null,
	  init: function init() {
	    var that = this;
	
	    // SFX
	    SFX.init(this.el);
	
	    // Draw
	    Draw.init(this.el);
	
	    // Init keyboard UI
	    var numericalUI = Draw.numericalUI(),
	        mainUI = Draw.mainUI(),
	        actionsUI = Draw.actionsUI();
	
	    // Create layout
	    this.el.alphabeticalLayout = Draw.alphabeticalLayout();
	    this.el.symbolsLayout = Draw.symbolsLayout();
	
	    // Append layouts to UI
	    numericalUI.appendChild(Draw.numericalLayout());
	    mainUI.appendChild(this.el.alphabeticalLayout);
	    actionsUI.appendChild(Draw.actionsLayout());
	
	    this.el.appendChild(numericalUI);
	    this.el.appendChild(mainUI);
	    this.el.appendChild(actionsUI);
	
	    // Inject methods in elements..
	    this.el.show = function () {
	      Behaviors.showKeyboard(that.el);
	    };
	    this.el.hide = function () {
	      Behaviors.hideKeyboard(that.el);
	    };
	    this.el.open = function () {
	      Behaviors.openKeyboard(that.el);
	    };
	    this.el.dismiss = function () {
	      Behaviors.dismissKeyboard(that.el);
	    };
	    this.el.destroyKeyboard = function () {
	      Behaviors.destroyKeyboard(that.el);
	    };
	
	    // Bind event handlers
	    this.inputEvent = this.inputEvent.bind(this);
	    this.backspaceEvent = this.backspaceEvent.bind(this);
	    this.dismissEvent = this.dismissEvent.bind(this);
	    this.keydownEvent = this.keydownEvent.bind(this);
	    this.didFocusInputEvent = this.didFocusInputEvent.bind(this);
	    this.didBlurInputEvent = this.didBlurInputEvent.bind(this);
	
	    // Set default value
	    this.el.setAttribute("scale", "2 2 2");
	    this.el.setAttribute("rotation", "-20 0 0");
	    this.el.setAttribute("position", "-1.5 -0.3 -2");
	
	    // Register keyboard events
	    this.el.addEventListener('input', this.inputEvent);
	    this.el.addEventListener('backspace', this.backspaceEvent);
	    this.el.addEventListener('dismiss', this.dismissEvent);
	
	    // Register global events
	    document.addEventListener('keydown', this.keydownEvent);
	    document.body.addEventListener('didfocusinput', this.didFocusInputEvent);
	    document.body.addEventListener('didblurinput', this.didBlurInputEvent);
	  },
	  update: function update() {
	    if (this.data.isOpen) {
	      Behaviors.showKeyboard(this.el);
	    } else {
	      Behaviors.hideKeyboard(this.el);
	    }
	  },
	  tick: function tick() {},
	  remove: function remove() {
	    this.el.removeEventListener('input', this.inputEvent);
	    this.el.removeEventListener('backspace', this.backspaceEvent);
	    this.el.removeEventListener('dismiss', this.dismissEvent);
	
	    document.removeEventListener('keydown', this.keydownEvent);
	    document.body.removeEventListener('didfocusinput', this.didFocusInputEvent);
	    document.body.removeEventListener('didblurinput', this.didBlurInputEvent);
	  },
	
	  // Fired on keyboard key press
	  inputEvent: function inputEvent(e) {
	    if (this.currentInput) {
	      this.currentInput.appendString(e.detail);
	    }
	  },
	
	  // Fired on backspace key press
	  backspaceEvent: function backspaceEvent(e) {
	    if (this.currentInput) {
	      this.currentInput.deleteLast();
	    }
	  },
	
	  dismissEvent: function dismissEvent(e) {
	    if (this.currentInput) {
	      this.currentInput.blur();
	    }
	  },
	
	  // physical keyboard event
	  keydownEvent: function keydownEvent(e) {
	    if (this.currentInput && this.data.physicalKeyboard) {
	      e.preventDefault();
	      e.stopPropagation();
	
	      if (e.key === 'Enter') {
	        Event.emit(Behaviors.el, 'input', '\n');
	        Event.emit(Behaviors.el, 'enter', '\n');
	      } else if (e.key === 'Backspace') {
	        Event.emit(Behaviors.el, 'backspace');
	      } else if (e.key === 'Escape') {
	        Event.emit(Behaviors.el, 'dismiss');
	      } else if (e.key.length < 2) {
	        Event.emit(Behaviors.el, 'input', e.key);
	      }
	    }
	  },
	
	  // Fired when an input has been selected
	  didFocusInputEvent: function didFocusInputEvent(e) {
	    if (this.currentInput) this.currentInput.blur(true);
	    this.currentInput = e.detail;
	    if (!this.el.isOpen) Behaviors.openKeyboard(this.el);
	  },
	
	  // Fired when an input has been deselected
	  didBlurInputEvent: function didBlurInputEvent(e) {
	    this.currentInput = null;
	    Behaviors.dismissKeyboard(this.el);
	  }
	});
	
	AFRAME.registerPrimitive('a-keyboard', {
	  defaultComponents: {
	    keyboard: {}
	  },
	  mappings: {
	    'is-open': 'keyboard.isOpen',
	    'physical-keyboard': 'keyboard.physicalKeyboard'
	  }
	});

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';
	
	var Utils = {};
	
	/**
	  Utils.preloadAssets([])
	  Add assets to Assets managment system.
	*/
	Utils.preloadAssets = function (assets_arr) {
	  var assets = document.querySelector('a-assets'),
	      already_exists = void 0;
	
	  if (!assets) {
	    var scene = document.querySelector('a-scene');
	    assets = document.createElement('a-assets');
	    scene.appendChild(assets);
	  }
	
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = assets_arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var item = _step.value;
	
	      already_exists = false;
	
	      /***** With Edge, assets.children is a HTMLCollection, not an Array! *****/
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = Array.from(assets.children)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var stuff = _step2.value;
	
	          if (item.id === stuff.id) {
	            already_exists = true;
	          }
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      if (!already_exists) {
	        var asset_item = document.createElement(item.type);
	        asset_item.setAttribute('id', item.id);
	        asset_item.setAttribute('src', item.src);
	        assets.appendChild(asset_item);
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	};
	
	/**
	  Utils.extend(a, b)
	  Assign object to other object.
	*/
	Utils.extend = function (a, b) {
	  for (var key in b) {
	    if (b.hasOwnProperty(key)) {
	      a[key] = b[key];
	    }
	  }
	  return a;
	};
	
	Utils.clone = function (original) {
	  if (Array.isArray(original)) {
	    return original.slice(0);
	  }
	
	  // First create an empty object with
	  // same prototype of our original source
	  var clone = Object.create(Object.getPrototypeOf(original));
	  var i = undefined;
	  var keys = Object.getOwnPropertyNames(original);
	  i = 0;
	  while (i < keys.length) {
	    // copy each property into the clone
	    Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(original, keys[i]));
	    i++;
	  }
	  return clone;
	};
	
	Utils.updateOpacity = function (el, opacity) {
	  if (el.hasAttribute('text')) {
	    var props = el.getAttribute('text');
	    if (props) {
	      props.opacity = opacity;
	      el.setAttribute('text', props);
	    }
	  }
	  el.object3D.traverse(function (o) {
	    if (o.material) {
	      o.material.transparent = true;
	      o.material.opacity = opacity;
	    }
	  });
	  var _iteratorNormalCompletion3 = true;
	  var _didIteratorError3 = false;
	  var _iteratorError3 = undefined;
	
	  try {
	    for (var _iterator3 = el.querySelectorAll('a-text')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	      var text = _step3.value;
	
	      text.setAttribute('opacity', opacity);
	    }
	  } catch (err) {
	    _didIteratorError3 = true;
	    _iteratorError3 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion3 && _iterator3.return) {
	        _iterator3.return();
	      }
	    } finally {
	      if (_didIteratorError3) {
	        throw _iteratorError3;
	      }
	    }
	  }
	};
	
	// Calculate the width factor
	Utils.getWidthFactor = function (el, wrapCount) {
	  var widthFactor = 0.00001;
	  if (el.components.text && el.components.text.currentFont) {
	    widthFactor = el.components.text.currentFont.widthFactor;
	    widthFactor = (0.5 + wrapCount) * widthFactor;
	  }
	  return widthFactor;
	};
	
	module.exports = Utils;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Assets = __webpack_require__(6);
	var Layouts = __webpack_require__(7);
	var Config = __webpack_require__(8);
	var Behaviors = __webpack_require__(9);
	var Draw = {};
	
	Draw.el = null;
	
	Draw.init = function (el) {
	  Draw.el = el;
	  Behaviors.el = el;
	  Behaviors.SFX = el.SFX;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW NUMERICAL UI
	
	Draw.numericalUI = function () {
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.025 0 0.12');
	  wrapper.setAttribute('rotation', '0 25 0');
	  wrapper.setAttribute('data-ui', true);
	
	  var el = document.createElement('a-rounded');
	  el.setAttribute('width', '0.280');
	  el.setAttribute('height', '0.360');
	  el.setAttribute('radius', '0.02');
	  el.setAttribute('color', Config.KEYBOARD_COLOR);
	  wrapper.appendChild(el);
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW MAIN UI
	
	Draw.mainUI = function () {
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.312 0 0');
	  wrapper.setAttribute('data-ui', true);
	
	  var el = document.createElement('a-rounded');
	  el.setAttribute('width', '0.840');
	  el.setAttribute('height', '0.360');
	  el.setAttribute('radius', '0.02');
	  el.setAttribute('color', Config.KEYBOARD_COLOR);
	  wrapper.appendChild(el);
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW ACTION UI
	
	Draw.actionsUI = function () {
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '1.180 0 0.01');
	  wrapper.setAttribute('rotation', '0 -25 0');
	  wrapper.setAttribute('data-ui', true);
	
	  var el = document.createElement('a-rounded');
	  el.setAttribute('width', '0.180');
	  el.setAttribute('height', '0.360');
	  el.setAttribute('radius', '0.02');
	  el.setAttribute('color', Config.KEYBOARD_COLOR);
	  wrapper.appendChild(el);
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW NUMERICAL LAYOUT
	
	Draw.numericalLayout = function () {
	  var data = Layouts.numerical;
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.02 0.26 0.001');
	
	  var index_y = 0;
	  for (var i in data) {
	    var key_id = 'num-' + i;
	    var key = Draw.key(key_id, data[i].type, data[i].value);
	    var index_x = i % 3;
	    var x = Config.KEY_WIDTH * index_x;
	    var y = Config.KEY_WIDTH * index_y;
	    key.setAttribute('position', x + ' -' + y + ' 0');
	    if (index_x === 2) {
	      index_y++;
	    }
	    wrapper.appendChild(key);
	  }
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW ALPHABETICAL LAYOUT
	
	Draw.alphabeticalLayout = function () {
	  var data = Layouts.alphabetical;
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.02 0.26 0.001');
	
	  var index_y = 0,
	      index_x = 0,
	      prev_was_space = false;
	
	  for (var i in data) {
	    var key_id = 'main-' + i;
	    var key = Draw.key(key_id, data[i].type, data[i].value);
	
	    var x = Config.KEY_WIDTH * index_x;
	    var y = Config.KEY_WIDTH * index_y;
	
	    // Add left padding on the second line
	    if (index_y === 1) {
	      x = x + Config.KEY_WIDTH / 2;
	    }
	
	    // Add margin on the key next to the spacebar key
	    if (prev_was_space) {
	      x = x + Config.SPACE_KEY_WIDTH - Config.KEY_WIDTH + 0.055 * 2;
	    }
	
	    // Add margin to the spacebar key
	    if (data[i].type === 'spacebar') {
	      prev_was_space = true;
	      x = x + 0.055;
	      y = Config.KEY_WIDTH * index_y - 0.01;
	    }
	
	    key.setAttribute('position', x + ' -' + y + ' 0');
	
	    if (index_y === 1 && index_x === 8) {
	      index_x = -1;
	      index_y++;
	    } else if (index_x === 9) {
	      index_x = -1;
	      index_y++;
	    }
	    index_x++;
	
	    wrapper.appendChild(key);
	  }
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW SYMBOLS LAYOUT
	
	Draw.symbolsLayout = function () {
	  var data = Layouts.symbols;
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.02 0.26 0.001');
	
	  var index_y = 0,
	      index_x = 0,
	      prev_was_space = false;
	
	  for (var i in data) {
	
	    var key_id = 'symbols-' + i;
	    var key = Draw.key(key_id, data[i].type, data[i].value);
	    var x = Config.KEY_WIDTH * index_x;
	    var y = Config.KEY_WIDTH * index_y;
	
	    // Add margin on the key next to the spacebar key
	    if (prev_was_space) {
	      x = x + Config.SPACE_KEY_WIDTH - Config.KEY_WIDTH + 0.055 * 2;
	    }
	
	    // Add margin to the spacebar key
	    if (data[i].type === 'spacebar') {
	      prev_was_space = true;
	      x = x + 0.055;
	      y = Config.KEY_WIDTH * index_y - 0.01;
	    }
	
	    key.setAttribute('position', x + ' -' + y + ' 0');
	
	    if (index_x === 9) {
	      index_x = -1;
	      index_y++;
	    }
	    index_x++;
	    wrapper.appendChild(key);
	  }
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW ACTIONS LAYOUT
	
	Draw.actionsLayout = function () {
	  var data = Layouts.actions;
	  var wrapper = document.createElement('a-entity');
	  wrapper.setAttribute('position', '0.02 0.26 0.001');
	
	  var val_y = 0;
	  for (var i in data) {
	    var key_id = 'action-' + i;
	    var key = Draw.key(key_id, data[i].type, data[i].value);
	
	    key.setAttribute('position', '0 -' + val_y + ' 0');
	    if (i == 0) {
	      val_y += Config.ACTION_WIDTH + 0.01;
	    } else if (i == 1) {
	      val_y += Config.KEY_WIDTH + 0.01;
	    }
	    wrapper.appendChild(key);
	  }
	
	  return wrapper;
	};
	
	// -----------------------------------------------------------------------------
	// DRAW KEY
	
	Draw.key = function (id, type, value) {
	  var that = undefined;
	
	  var el = document.createElement('a-rounded');
	  el.setAttribute('key-id', id);
	  el.setAttribute('width', Config.KEY_WIDTH);
	  el.setAttribute('height', Config.KEY_WIDTH);
	  el.setAttribute('radius', '0.008');
	  el.setAttribute('position', '0 0 0');
	  el.setAttribute('key-type', type);
	  el.setAttribute('key-value', value);
	  el.setAttribute('color', Config.KEYBOARD_COLOR);
	
	  // ---------------------------------------------------------------------------
	  // EVENTS
	
	  Behaviors.addKeyEvents(el);
	
	  // ---------------------------------------------------------------------------
	  // SHADOW
	
	  el.shadow_el = document.createElement('a-image');
	  el.shadow_el.setAttribute('width', Config.KEY_WIDTH * 1.25);
	  el.shadow_el.setAttribute('height', Config.KEY_WIDTH * 1.25);
	  el.shadow_el.setAttribute('position', Config.KEY_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' -0.002');
	  el.shadow_el.setAttribute('src', Assets.aframeKeyboardShadow);
	  el.appendChild(el.shadow_el);
	
	  // ---------------------------------------------------------------------------
	  // TEXT KEY
	
	  if (type === 'text' || type === 'spacebar' || type === 'symbol') {
	    var letter_el = document.createElement('a-text');
	    letter_el.setAttribute('value', value);
	    letter_el.setAttribute('color', '#dbddde');
	    letter_el.setAttribute('position', Config.KEY_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' 0.01');
	    letter_el.setAttribute('scale', '0.16 0.16 0.16');
	    letter_el.setAttribute('align', 'center');
	    letter_el.setAttribute('baseline', 'center');
	    el.appendChild(letter_el);
	  }
	
	  // ---------------------------------------------------------------------------
	  // SPACEBAR KEY
	
	  if (type === 'spacebar') {
	    el.setAttribute('width', Config.SPACE_KEY_WIDTH);
	    el.setAttribute('height', Config.SPACE_KEY_HEIGHT);
	    el.setAttribute('color', '#404b50');
	    el.shadow_el.setAttribute('width', Config.SPACE_KEY_WIDTH * 1.12);
	    el.shadow_el.setAttribute('height', Config.SPACE_KEY_HEIGHT * 1.2);
	    el.shadow_el.setAttribute('position', Config.SPACE_KEY_WIDTH / 2 + ' ' + Config.SPACE_KEY_HEIGHT / 2 + ' -0.02');
	    letter_el.setAttribute('color', '#adb1b3');
	    letter_el.setAttribute('scale', '0.12 0.12 0.12');
	    letter_el.setAttribute('position', Config.SPACE_KEY_WIDTH / 2 + ' ' + Config.SPACE_KEY_HEIGHT / 2 + ' 0');
	  }
	
	  // ---------------------------------------------------------------------------
	  // SYMBOL KEY
	
	  else if (type === 'symbol') {
	      letter_el.setAttribute('scale', '0.12 0.12 0.12');
	    }
	
	  // ---------------------------------------------------------------------------
	  // ACTION KEY
	
	  if (type === 'backspace' || type === 'enter' || type === 'dismiss') {
	    el.setAttribute('width', Config.ACTION_WIDTH);
	    el.shadow_el.setAttribute('width', Config.ACTION_WIDTH * 1.25);
	    el.shadow_el.setAttribute('position', Config.ACTION_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' -0.02');
	  }
	
	  // ---------------------------------------------------------------------------
	  // SHIFT KEY
	
	  if (type === 'shift') {
	    var icon_el = document.createElement('a-image');
	    icon_el.setAttribute('data-type', 'icon');
	    icon_el.setAttribute('width', '0.032');
	    icon_el.setAttribute('height', '0.032');
	    icon_el.setAttribute('position', '0.04 0.04 0.01');
	    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
	    el.appendChild(icon_el);
	    Draw.el.shiftKey = el;
	  }
	
	  // ---------------------------------------------------------------------------
	  // GLOBAL
	
	  else if (type === 'global') {
	      var icon_el = document.createElement('a-image');
	      icon_el.setAttribute('width', '0.032');
	      icon_el.setAttribute('height', '0.032');
	      icon_el.setAttribute('position', '0.04 0.04 0.01');
	      icon_el.setAttribute('src', Assets.aframeKeyboardGlobal);
	      el.appendChild(icon_el);
	    }
	
	    // ---------------------------------------------------------------------------
	    // BACKSPACE
	
	    else if (type === 'backspace') {
	        var icon_el = document.createElement('a-image');
	        icon_el.setAttribute('width', '0.046');
	        icon_el.setAttribute('height', '0.046');
	        icon_el.setAttribute('position', '0.07 0.04 0.01');
	        icon_el.setAttribute('src', Assets.aframeKeyboardBackspace);
	        el.appendChild(icon_el);
	      }
	
	      // ---------------------------------------------------------------------------
	      // ENTER
	
	      else if (type === 'enter') {
	          el.setAttribute('height', Config.ACTION_WIDTH);
	          el.shadow_el.setAttribute('height', Config.ACTION_WIDTH * 1.25);
	          el.shadow_el.setAttribute('position', Config.ACTION_WIDTH / 2 + ' ' + Config.ACTION_WIDTH / 2 + ' -0.02');
	
	          var circle_el = document.createElement('a-circle');
	          circle_el.setAttribute('color', '#4285f4');
	          circle_el.setAttribute('radius', 0.044);
	          circle_el.setAttribute('position', '0.07 0.07 0.01');
	          el.appendChild(circle_el);
	
	          var icon_el = document.createElement('a-image');
	          icon_el.setAttribute('width', '0.034');
	          icon_el.setAttribute('height', '0.034');
	          icon_el.setAttribute('position', '0.07 0.07 0.011');
	          icon_el.setAttribute('src', Assets.aframeKeyboardEnter);
	          el.appendChild(icon_el);
	        }
	
	        // ---------------------------------------------------------------------------
	        // DISMISS
	
	        else if (type === 'dismiss') {
	            var icon_el = document.createElement('a-image');
	            icon_el.setAttribute('width', '0.046');
	            icon_el.setAttribute('height', '0.046');
	            icon_el.setAttribute('position', '0.07 0.04 0.01');
	            icon_el.setAttribute('src', Assets.aframeKeyboardDismiss);
	            el.appendChild(icon_el);
	          }
	
	  return el;
	};
	
	module.exports = Draw;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = {
	  aframeKeyboardShift: AFRAME.ASSETS_PATH + "/images/ShiftIcon.png",
	  aframeKeyboardShiftActive: AFRAME.ASSETS_PATH + "/images/ShiftActiveIcon.png",
	  aframeKeyboardGlobal: AFRAME.ASSETS_PATH + "/images/GlobalIcon.png",
	  aframeKeyboardBackspace: AFRAME.ASSETS_PATH + "/images/BackspaceIcon.png",
	  aframeKeyboardEnter: AFRAME.ASSETS_PATH + "/images/EnterIcon.png",
	  aframeKeyboardDismiss: AFRAME.ASSETS_PATH + "/images/DismissIcon.png",
	  aframeKeyboardShadow: AFRAME.ASSETS_PATH + "/images/KeyShadow.png",
	  aframeKeyboardKeyIn: AFRAME.ASSETS_PATH + "/sounds/KeyIn.mp3",
	  aframeKeyboardKeyDown: AFRAME.ASSETS_PATH + "/sounds/KeyDown.mp3"
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';
	
	var Layouts = {
	  numerical: [{ type: 'text', value: '1' }, { type: 'text', value: '2' }, { type: 'text', value: '3' }, { type: 'text', value: '4' }, { type: 'text', value: '5' }, { type: 'text', value: '6' }, { type: 'text', value: '7' }, { type: 'text', value: '8' }, { type: 'text', value: '9' }, { type: 'text', value: '.' }, { type: 'text', value: '0' }, { type: 'text', value: '-' }],
	
	  alphabetical: [{ type: 'text', value: 'q' }, { type: 'text', value: 'w' }, { type: 'text', value: 'e' }, { type: 'text', value: 'r' }, { type: 'text', value: 't' }, { type: 'text', value: 'y' }, { type: 'text', value: 'u' }, { type: 'text', value: 'i' }, { type: 'text', value: 'o' }, { type: 'text', value: 'p' }, { type: 'text', value: 'a' }, { type: 'text', value: 's' }, { type: 'text', value: 'd' }, { type: 'text', value: 'f' }, { type: 'text', value: 'g' }, { type: 'text', value: 'h' }, { type: 'text', value: 'j' }, { type: 'text', value: 'k' }, { type: 'text', value: 'l' }, { type: 'shift' }, { type: 'text', value: 'z' }, { type: 'text', value: 'x' }, { type: 'text', value: 'c' }, { type: 'text', value: 'v' }, { type: 'text', value: 'b' }, { type: 'text', value: 'n' }, { type: 'text', value: 'm' }, { type: 'text', value: '!' }, { type: 'text', value: '?' }, { type: 'symbol', value: '#+=' }, { type: 'text', value: '@' }, { type: 'spacebar', value: '' }, { type: 'text', value: ',' }, { type: 'text', value: '.' }],
	
	  symbols: [{ type: 'text', value: '@' }, { type: 'text', value: '#' }, { type: 'text', value: '$' }, { type: 'text', value: '%' }, { type: 'text', value: '&' }, { type: 'text', value: '*' }, { type: 'text', value: '-' }, { type: 'text', value: '+' }, { type: 'text', value: '(' }, { type: 'text', value: ')' }, { type: 'text', value: '~' }, { type: 'text', value: '`' }, { type: 'text', value: '"' }, { type: 'text', value: '\'' }, { type: 'text', value: ':' }, { type: 'text', value: ';' }, { type: 'text', value: '_' }, { type: 'text', value: '=' }, { type: 'text', value: '\\' }, { type: 'text', value: '/' }, { type: 'text', value: '{' }, { type: 'text', value: '}' }, { type: 'text', value: '[' }, { type: 'text', value: ']' }, { type: 'text', value: '<' }, { type: 'text', value: '>' }, { type: 'text', value: '^' }, { type: 'text', value: '|' }, { type: 'text', value: '!' }, { type: 'text', value: '?' }, { type: 'symbol', value: 'ABC' }, { type: 'text', value: '@' }, { type: 'spacebar', value: '' }, { type: 'text', value: ',' }, { type: 'text', value: '.' }],
	
	  actions: [{ type: 'backspace', value: 'Del' }, { type: 'enter', value: 'OK' }, { type: 'dismiss', value: 'W' }]
	};
	
	module.exports = Layouts;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";
	
	var Config = {
	  KEYBOARD_COLOR: "#263238",
	  KEY_COLOR_HIGHLIGHT: "#29363c",
	  KEY_COLOR_ACTIVE: "#404b50",
	  SPACEBAR_COLOR_ACTIVE: "#3c464b",
	  SPACEBAR_COLOR_HIGHLIGHT: "#445055",
	  KEY_WIDTH: 0.08,
	  SPACE_KEY_WIDTH: 0.368,
	  SPACE_KEY_HEIGHT: 0.05,
	  ACTION_WIDTH: 0.140
	};
	
	module.exports = Config;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Assets = __webpack_require__(6);
	var Config = __webpack_require__(8);
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	var SFX = __webpack_require__(11);
	var Behaviors = {};
	
	Behaviors.el = null;
	
	// -----------------------------------------------------------------------------
	// KEYBOARD METHODS
	
	Behaviors.showKeyboard = function (el) {
	  el.isOpen = true;
	  var p = el.object3D.position;
	  console.log('show keyboard position');
	  console.log(p.x);
	  console.log(p.y);
	  console.log(p.z);
	  if (p.x === -10000 && p.y === -10000 && p.z === -10000) {
	    el.object3D.position.set(0, 0, 0);
	  }
	  !el.parentNode && el.sceneEl.appendChild(el);
	};
	
	Behaviors.hideKeyboard = function (el) {
	  el.isOpen = false;
	  // TODO: Figure out a better way to hide stuff.
	  el.object3D.position.set(-10000, -10000, -10000);
	};
	
	Behaviors.destroyKeyboard = function (el) {
	  var parent = el.parentNode;
	  if (!parent) {
	    return;
	  }
	  parent && parent.removeChild(el);
	};
	
	Behaviors.openKeyboard = function (el) {
	  Behaviors.showKeyboard(el);
	  Event.emit(Behaviors.el, 'didopen');
	};
	
	Behaviors.dismissKeyboard = function (el) {
	  Behaviors.hideKeyboard(el);
	  Event.emit(Behaviors.el, 'diddismiss');
	};
	
	// -----------------------------------------------------------------------------
	// KEY EVENTS
	
	Behaviors.addKeyEvents = function (el) {
	  el.addEventListener('click', Behaviors.keyClick);
	  el.addEventListener('mousedown', Behaviors.keyDown);
	  el.addEventListener('mouseup', Behaviors.keyOut);
	  el.addEventListener('raycaster-intersected', Behaviors.keyIn);
	  el.addEventListener('raycaster-intersected-cleared', Behaviors.keyOut);
	  //triggerdown
	  // https://aframe.io/docs/0.6.0/components/hand-controls.html
	};
	
	// -----------------------------------------------------------------------------
	// KEYCLICK
	
	Behaviors.keyClick = function () {
	  SFX.keyDown(Behaviors.el);
	
	  var type = this.getAttribute('key-type');
	  var value = this.getAttribute('key-value');
	
	  if (type === 'text' || type === 'spacebar') {
	    if (type === 'spacebar') {
	      value = ' ';
	    }
	    if (Behaviors.isShiftEnabled) {
	      value = value.toUpperCase();
	      Behaviors.shiftToggle();
	    } else if (Behaviors.isSymbols) {
	      Behaviors.symbolsToggle();
	    }
	    Event.emit(Behaviors.el, 'input', value);
	  } else if (type === 'shift') {
	    Behaviors.shiftToggle();
	  } else if (type === 'symbol') {
	    Behaviors.symbolsToggle();
	  } else if (type === 'backspace') {
	    Event.emit(Behaviors.el, 'backspace');
	  } else if (type === 'enter') {
	    Event.emit(Behaviors.el, 'input', '\n');
	    Event.emit(Behaviors.el, 'enter', '\n');
	  } else if (type === 'dismiss') {
	    Event.emit(Behaviors.el, 'dismiss');
	  }
	};
	
	// -----------------------------------------------------------------------------
	// KEYDOWN
	
	Behaviors.keyDown = function () {
	  this.object3D.position.z = 0.003;
	  if (this.getAttribute('key-type') === 'spacebar') {
	    this.setAttribute('color', Config.SPACEBAR_COLOR_ACTIVE);
	  } else {
	    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
	  }
	};
	
	// -----------------------------------------------------------------------------
	// KEYIN
	
	Behaviors.keyIn = function () {
	  if (this.object3D.children[2] && this.object3D.children[2].material && !this.object3D.children[2].material.opacity) {
	    return;
	  }
	  SFX.keyIn(Behaviors.el);
	  if (this.getAttribute('key-type') === 'spacebar') {
	    this.setAttribute('color', Config.SPACEBAR_COLOR_HIGHLIGHT);
	  } else {
	    this.setAttribute('color', Config.KEY_COLOR_HIGHLIGHT);
	  }
	};
	
	// -----------------------------------------------------------------------------
	// KEYOUT
	
	Behaviors.keyOut = function () {
	  this.object3D.position.z = 0;
	  if (this.getAttribute('key-type') === 'spacebar') {
	    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
	  } else {
	    this.setAttribute('color', Config.KEYBOARD_COLOR);
	  }
	};
	
	// -----------------------------------------------------------------------------
	// SHIFT
	
	Behaviors.isShiftEnabled = false;
	Behaviors.shiftToggle = function () {
	  Behaviors.isShiftEnabled = !Behaviors.isShiftEnabled;
	
	  var icon_el = Behaviors.el.shiftKey.querySelector('[data-type]');
	  if (Behaviors.isShiftEnabled) {
	    icon_el.setAttribute('src', Assets.aframeKeyboardShiftActive);
	  } else {
	    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
	  }
	
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = document.querySelectorAll("[key-id]")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var keyEl = _step.value;
	
	      var key_id = keyEl.getAttribute('key-id'),
	          key_type = keyEl.getAttribute('key-type');
	      if (key_id.startsWith('main-') && key_type === "text") {
	        var textEl = keyEl.querySelector('a-text');
	        if (textEl) {
	          var value = textEl.getAttribute('value').toLowerCase();
	          if (this.isShiftEnabled) {
	            value = value.toUpperCase();
	          }
	          textEl.setAttribute('value', value);
	        }
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	};
	
	// -----------------------------------------------------------------------------
	// SYMBOLS
	
	Behaviors.isSymbols = false;
	Behaviors.symbolsToggle = function () {
	  Behaviors.isSymbols = !Behaviors.isSymbols;
	  if (!Behaviors.isSymbols) {
	    var parent = Behaviors.el.symbolsLayout.parentNode;
	    parent.removeChild(Behaviors.el.symbolsLayout);
	    parent.appendChild(Behaviors.el.alphabeticalLayout);
	    setTimeout(function () {
	      Utils.updateOpacity(Behaviors.el.alphabeticalLayout, 1);
	    }, 0);
	  } else {
	    var _parent = Behaviors.el.alphabeticalLayout.parentNode;
	    _parent.removeChild(Behaviors.el.alphabeticalLayout);
	    _parent.appendChild(Behaviors.el.symbolsLayout);
	  }
	};
	
	module.exports = Behaviors;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = {
	  emit: function emit(el, name, data) {
	    el.dispatchEvent(new CustomEvent(name, { detail: data }));
	  }
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Assets = __webpack_require__(12);
	
	var SFX = {
	
	  init: function init(parent) {
	    var el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeKeyboardKeyInSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', Assets.aframeKeyboardKeyIn);
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	
	    el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeKeyboardKeyDownSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', Assets.aframeKeyboardKeyDown);
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	  },
	
	  keyIn: function keyIn(parent) {
	    var el = parent.querySelector('[key=aframeKeyboardKeyInSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  },
	
	  keyDown: function keyDown(parent) {
	    var el = parent.querySelector('[key=aframeKeyboardKeyDownSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  }
	};
	
	module.exports = SFX;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = {
	  aframeKeyboardShift: AFRAME.ASSETS_PATH + "/images/ShiftIcon.png",
	  aframeKeyboardShiftActive: AFRAME.ASSETS_PATH + "/images/ShiftActiveIcon.png",
	  aframeKeyboardGlobal: AFRAME.ASSETS_PATH + "/images/GlobalIcon.png",
	  aframeKeyboardBackspace: AFRAME.ASSETS_PATH + "/images/BackspaceIcon.png",
	  aframeKeyboardEnter: AFRAME.ASSETS_PATH + "/images/EnterIcon.png",
	  aframeKeyboardDismiss: AFRAME.ASSETS_PATH + "/images/DismissIcon.png",
	  aframeKeyboardShadow: AFRAME.ASSETS_PATH + "/images/KeyShadow.png",
	  aframeKeyboardKeyIn: AFRAME.ASSETS_PATH + "/sounds/KeyIn.mp3",
	  aframeKeyboardKeyDown: AFRAME.ASSETS_PATH + "/sounds/KeyDown.mp3"
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	
	/*
	@BUG: Space has not effect when no letter comes after.
	@TODO: <progress value="70" max="100">70 %</progress>
	*/
	
	AFRAME.registerComponent('input', {
	  schema: {
	    value: { type: "string", default: "" },
	    name: { type: "string", default: "" },
	    disabled: { type: "boolean", default: false },
	    color: { type: "color", default: "#000" },
	    align: { type: "string", default: "left" },
	    font: { type: "string", default: "" },
	    letterSpacing: { type: "int", default: 0 },
	    lineHeight: { type: "string", default: "" },
	    opacity: { type: "number", default: 1 },
	    side: { type: "string", default: 'front' },
	    tabSize: { type: "int", default: 4 },
	    placeholder: { type: "string", default: "" },
	    placeholderColor: { type: "color", default: "#AAA" },
	    maxLength: { type: "int", default: 0 },
	    type: { type: "string", default: "text" },
	    width: { type: "number", default: 1 },
	    cursorWidth: { type: "number", default: 0.01 },
	    cursorHeight: { type: "number", default: 0.08 },
	    cursorColor: { type: "color", default: "#007AFF" },
	    backgroundColor: { type: "color", default: "#FFF" },
	    backgroundOpacity: { type: "number", default: 1 }
	  },
	
	  init: function init() {
	    var that = this;
	
	    this.background = document.createElement('a-rounded');
	    this.background.setAttribute('radius', 0.01);
	    this.background.setAttribute('height', 0.18);
	    this.background.setAttribute('side', 'double');
	    this.el.appendChild(this.background);
	
	    this.cursor = document.createElement('a-plane');
	    this.cursor.setAttribute('position', '0 0 0.003');
	    this.cursor.setAttribute('visible', false);
	    this.el.appendChild(this.cursor);
	
	    this.text = document.createElement('a-entity');
	    this.el.appendChild(this.text);
	
	    this.placeholder = document.createElement('a-entity');
	    this.placeholder.setAttribute('visible', false);
	    this.el.appendChild(this.placeholder);
	
	    this.el.focus = this.focus.bind(this);
	    this.el.blur = this.blur.bind(this);
	    this.el.appendString = this.appendString.bind(this);
	    this.el.deleteLast = this.deleteLast.bind(this);
	
	    //setTimeout(function() { that.updateText(); }, 0);
	    this.blink();
	
	    this.el.addEventListener('click', function () {
	      if (this.components.input.data.disabled) {
	        return;
	      }
	      that.focus();
	    });
	
	    Object.defineProperty(this.el, 'value', {
	      get: function get() {
	        return this.getAttribute('value');
	      },
	      set: function set(value) {
	        this.setAttribute('value', value);
	      },
	      enumerable: true,
	      configurable: true
	    });
	  },
	  blink: function blink() {
	    var that = this;
	    if (!this.isFocused) {
	      that.cursor.setAttribute('visible', false);
	      clearInterval(this.cursorInterval);
	      this.cursorInterval = null;
	      return;
	    }
	    this.cursorInterval = setInterval(function () {
	      that.cursor.setAttribute('visible', !that.cursor.getAttribute('visible'));
	    }, 500);
	  },
	  isFocused: false,
	  focus: function focus(noemit) {
	    if (this.isFocused) return;
	    this.isFocused = true;
	    this.cursor.setAttribute('visible', true);
	    this.blink();
	    Event.emit(this.el, 'focus');
	    if (!noemit) Event.emit(document.body, 'didfocusinput', this.el);
	  },
	  blur: function blur(noemit) {
	    if (!this.isFocused) {
	      return;
	    }
	    this.isFocused = false;
	    if (this.cursorInterval) {
	      clearInterval(this.cursorInterval);
	      this.cursorInterval = null;
	    }
	    this.cursor.setAttribute('visible', false);
	    Event.emit(this.el, 'blur');
	    if (!noemit) {
	      Event.emit(document.body, 'didblurinput', this.el);
	    }
	  },
	  appendString: function appendString(data) {
	    if (data === '\n') {
	      return this.blur();
	    }
	    var str = this.el.getAttribute("value");
	    if (!str) {
	      str = "";
	    }
	    str = str + data;
	    this.el.setAttribute("value", str);
	    Event.emit(this.el, 'change', str);
	  },
	  deleteLast: function deleteLast() {
	    var str = this.el.getAttribute("value");
	    if (!str) {
	      str = "";
	    }
	    str = str.slice(0, -1);
	    this.el.setAttribute("value", str);
	    Event.emit(this.el, 'change', str);
	  },
	  updateText: function updateText() {
	    var that = this;
	    var padding = {
	      left: 0.021,
	      right: 0.021
	    };
	
	    var props = {
	      color: this.data.color,
	      align: this.data.align,
	      side: this.data.side,
	      tabSize: this.data.tabSize,
	      wrapCount: 24 * this.data.width,
	      width: this.data.width
	
	      // Make cursor stop blinking when typing..
	      // (and blinking again after typing stop).
	    };var attr = this.text.getAttribute("text");
	    if (attr) {
	      if (this.data.value !== attr.value) {
	        if (this.cursorInterval) {
	          clearInterval(this.cursorInterval);
	          this.cursorInterval = null;
	        }
	        if (this.cursorTimer) {
	          clearTimeout(this.cursorTimer);
	          this.cursorTimer = null;
	        }
	        this.cursor.setAttribute('visible', true);
	        this.cursorTimer = setTimeout(function () {
	          that.blink();
	        }, 50);
	      }
	    }
	
	    // Max length
	    if (this.data.maxLength) {
	      props.value = this.data.value.substring(0, this.data.maxLength);
	      this.el.setAttribute('value', props.value);
	    } else {
	      props.value = this.data.value;
	    }
	
	    if (this.data.type === "password") {
	      props.value = "*".repeat(this.data.value.length);
	    }
	
	    if (this.data.font.length) {
	      props.font = this.data.font;
	    }
	    if (this.data.letterSpacing) {
	      props.letterSpacing = this.data.letterSpacing;
	    }
	    if (this.data.lineHeight.length) {
	      props.lineHeight = this.data.lineHeight;
	    }
	    this.text.setAttribute('visible', false);
	    this.text.setAttribute("text", props);
	
	    function getTextWidth(el, data, trimFirst, _widthFactor) {
	      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
	        return 0;
	      }
	      var v = el.object3D.children[0].geometry.visibleGlyphs;
	      if (!v) {
	        return 0;
	      }
	      v = v[v.length - 1];
	      if (!v) {
	        return 0;
	      }
	      if (v.line) {
	        if (trimFirst) {
	          data.value = data.value.substr(1);
	        } else {
	          data.value = data.value.slice(0, -1);
	        }
	        el.setAttribute("text", data);
	        return getTextWidth(el, data, trimFirst);
	      } else {
	        if (!_widthFactor) {
	          _widthFactor = Utils.getWidthFactor(el, data.wrapCount);
	        }
	        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
	        var textRatio = (v + padding.left + padding.right) / that.data.width;
	
	        if (textRatio > 1) {
	          if (trimFirst) {
	            data.value = data.value.substr(1);
	          } else {
	            data.value = data.value.slice(0, -1);
	          }
	          el.setAttribute("text", data);
	          return getTextWidth(el, data, trimFirst, _widthFactor);
	        }
	      }
	      return v;
	    }
	
	    if (props.value.length) {
	      this.placeholder.setAttribute('visible', false);
	    } else {
	      this.placeholder.setAttribute('visible', true);
	    }
	
	    var placeholder_props = Utils.clone(props);
	    placeholder_props.value = this.data.placeholder;
	    placeholder_props.color = this.data.placeholderColor;
	    this.placeholder.setAttribute("text", placeholder_props);
	
	    setTimeout(function () {
	      if (that.text.object3D) {
	        var children = that.text.object3D.children;
	        if (children[0] && children[0].geometry && children[0].geometry.visibleGlyphs) {
	          var v = 0;
	          if (children[0].geometry.visibleGlyphs.length) {
	            v = getTextWidth(that.text, props, true);
	            that.text.setAttribute('visible', true);
	          }
	          that.cursor.setAttribute('position', v + padding.left + ' 0 0.003');
	        } else {
	          that.cursor.setAttribute('position', padding.left + ' 0 0.003');
	        }
	      } else {
	        that.cursor.setAttribute('position', padding.left + ' 0 0.003');
	      }
	      getTextWidth(that.placeholder, placeholder_props);
	    }, 0);
	
	    this.background.setAttribute('color', this.data.backgroundColor);
	    /*if (this.data.backgroundOpacity) {
	      setTimeout(function() {
	        Utils.updateOpacity(that.background, that.data.backgroundOpacity);
	      }, 0);
	    }*/
	    this.background.setAttribute('width', this.data.width);
	    //this.background.setAttribute('position', this.data.width/2+' 0 0');
	    this.background.setAttribute('position', '0 -0.09 0.001');
	    this.text.setAttribute('position', padding.left - 0.001 + this.data.width / 2 + ' 0 0.002');
	    this.placeholder.setAttribute('position', padding.left - 0.001 + this.data.width / 2 + ' 0 0.002');
	  },
	  updateCursor: function updateCursor() {
	    this.cursor.setAttribute('width', this.data.cursorWidth);
	    this.cursor.setAttribute('height', this.data.cursorHeight);
	    this.cursor.setAttribute('color', this.data.cursorColor);
	  },
	  update: function update() {
	    var that = this;
	    setTimeout(function () {
	      //  Utils.updateOpacity(that.el, that.data.opacity);
	    }, 0);
	
	    this.updateCursor();
	    this.updateText();
	  }
	});
	
	AFRAME.registerPrimitive('a-input', {
	  defaultComponents: {
	    input: {}
	  },
	  mappings: {
	    value: 'input.value',
	    name: 'input.name',
	    disabled: 'input.disabled',
	    color: 'input.color',
	    align: 'input.align',
	    font: 'input.font',
	    'letter-spacing': 'input.letterSpacing',
	    'line-height': 'input.lineHeight',
	    'opacity': 'input.opacity',
	    'side': 'input.side',
	    'tab-size': 'input.tabSize',
	    placeholder: 'input.placeholder',
	    'placeholder-color': 'input.placeholderColor',
	    'max-length': 'input.maxLength',
	    type: 'input.type',
	    width: 'input.width',
	    'cursor-width': "input.cursorWidth",
	    'cursor-height': "input.cursorHeight",
	    'cursor-color': "input.cursorColor",
	    'background-color': 'input.backgroundColor',
	    'background-opacity': 'input.backgroundOpacity'
	  }
	});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	var Assets = __webpack_require__(15);
	var SFX = __webpack_require__(16);
	
	AFRAME.registerComponent('switch', {
	  schema: {
	    name: { type: "string", default: "" },
	    enabled: { type: 'boolean', default: false },
	    disabled: { type: 'boolean', default: false },
	    fillColor: { type: "color", default: "#bababa" },
	    knobColor: { type: "color", default: "#f5f5f5" },
	    fillColorEnabled: { type: "color", default: "#80a8ff" },
	    knobColorEnabled: { type: "color", default: "#4076fd" },
	    fillColorDisabled: { type: "color", default: "#939393" },
	    knobColorDisabled: { type: "color", default: "#a2a2a2" }
	  },
	  init: function init() {
	    var that = this;
	
	    // Assets
	    Utils.preloadAssets(Assets);
	
	    // SFX
	    SFX.init(this.el);
	
	    // FILL
	    this.el.fill = document.createElement('a-rounded');
	    this.el.fill.setAttribute('width', 0.36);
	    this.el.fill.setAttribute('height', 0.16);
	    this.el.fill.setAttribute('radius', 0.08);
	    this.el.fill.setAttribute('side', 'double');
	    this.el.fill.setAttribute('position', '0 0 0.01');
	    this.el.appendChild(this.el.fill);
	
	    // KNOB
	    this.el.knob = document.createElement('a-circle');
	    this.el.knob.setAttribute('position', '0.06 0.08 0.02');
	    this.el.knob.setAttribute('radius', 0.12);
	    this.el.knob.setAttribute('side', 'double');
	    this.el.appendChild(this.el.knob);
	
	    // SHADOW
	    this.el.shadow_el = document.createElement('a-image');
	    this.el.shadow_el.setAttribute('width', 0.24 * 1.25);
	    this.el.shadow_el.setAttribute('height', 0.24 * 1.25);
	    this.el.shadow_el.setAttribute('position', '0 0 -0.001');
	    this.el.shadow_el.setAttribute('src', '#aframeSwitchShadow');
	    this.el.knob.appendChild(this.el.shadow_el);
	
	    this.el.addEventListener('click', function () {
	      if (this.components.switch.data.disabled) {
	        return;
	      }
	      this.setAttribute('enabled', !this.components.switch.data.enabled);
	      Event.emit(this, 'change', this.components.switch.data.enabled);
	    });
	    this.el.addEventListener('mousedown', function () {
	      if (this.components.switch.data.disabled) {
	        return SFX.clickDisabled(this);
	      }
	      SFX.click(this);
	    });
	
	    Object.defineProperty(this.el, 'enabled', {
	      get: function get() {
	        return this.getAttribute('enabled');
	      },
	      set: function set(value) {
	        this.setAttribute('enabled', value);
	      },
	      enumerable: true,
	      configurable: true
	    });
	  },
	  on: function on() {
	    this.el.fill.setAttribute('color', this.data.fillColorEnabled);
	    this.el.knob.setAttribute('position', '0.32 0.08 0.02');
	    this.el.knob.setAttribute('color', this.data.knobColorEnabled);
	  },
	  off: function off() {
	    this.el.fill.setAttribute('color', this.data.fillColor);
	    this.el.knob.setAttribute('position', '0.06 0.08 0.02');
	    this.el.knob.setAttribute('color', this.data.knobColor);
	  },
	  disable: function disable() {
	    this.el.fill.setAttribute('color', this.data.fillColorDisabled);
	    this.el.knob.setAttribute('color', this.data.knobColorDisabled);
	  },
	  update: function update() {
	    if (this.data.enabled) {
	      this.on();
	    } else {
	      this.off();
	    }
	    if (this.data.disabled) {
	      this.disable();
	    }
	  }
	});
	
	AFRAME.registerPrimitive('a-switch', {
	  defaultComponents: {
	    switch: {}
	  },
	  mappings: {
	    name: 'switch.name',
	    enabled: 'switch.enabled',
	    disabled: 'switch.disabled',
	    'fill-color': 'switch.fillColor',
	    'knob-color': 'switch.knobColor',
	    'fill-color-enabled': 'switch.fillColorEnabled',
	    'knob-color-enabled': 'switch.knobColorEnabled',
	    'fill-color-disabled': 'switch.fillColorDisabled',
	    'knob-color-disabled': 'switch.knobColorDisabled'
	  }
	});

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = [{ type: 'img', id: 'aframeSwitchShadow', src: AFRAME.ASSETS_PATH + '/images/SwitchShadow.png' }, { type: 'audio', id: 'aframeSwitchClick', src: AFRAME.ASSETS_PATH + '/sounds/InputClick.mp3' }, { type: 'audio', id: 'aframeSwitchClickDisabled', src: AFRAME.ASSETS_PATH + '/sounds/ButtonClickDisabled.mp3' }];

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	'use strict';
	
	var SFX = {
	
	  init: function init(parent) {
	    var el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeSwitchClickSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeSwitchClick');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	
	    el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeSwitchClickDisabledSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeSwitchClickDisabled');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	  },
	
	  click: function click(parent) {
	    var el = parent.querySelector('[key=aframeSwitchClickSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  },
	
	  clickDisabled: function clickDisabled(parent) {
	    var el = parent.querySelector('[key=aframeSwitchClickDisabledSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  }
	};
	
	module.exports = SFX;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	
	AFRAME.registerComponent('form', {
	  schema: {},
	  init: function init() {}
	});
	
	AFRAME.registerPrimitive('a-form', {
	  defaultComponents: {
	    form: {}
	  },
	  mappings: {}
	});

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	var Assets = __webpack_require__(19);
	var SFX = __webpack_require__(20);
	
	AFRAME.registerComponent('radio', {
	  schema: {
	    checked: { type: 'boolean', default: false },
	    disabled: { type: 'boolean', default: false },
	    name: { type: "string", default: "" },
	    value: { type: "string", default: "" },
	    label: { type: "string", default: "" },
	    radioColor: { type: "color", default: "#757575" },
	    radioColorChecked: { type: "color", default: "#4076fd" },
	    color: { type: "color", default: "#757575" },
	    font: { type: "string", default: "" },
	    letterSpacing: { type: "int", default: 0 },
	    lineHeight: { type: "string", default: "" },
	    opacity: { type: "number", default: 1 },
	    width: { type: "number", default: 1 }
	  },
	  init: function init() {
	    var that = this;
	
	    // Assets
	    Utils.preloadAssets(Assets);
	
	    // SFX
	    SFX.init(this.el);
	
	    // HITBOX
	    this.hitbox = document.createElement('a-plane');
	    this.hitbox.setAttribute('height', 0.2);
	    this.hitbox.setAttribute('opacity', 0);
	    this.hitbox.setAttribute('position', '0 0 0.001');
	    this.el.appendChild(this.hitbox);
	
	    // OUTLINE
	    this.outline = document.createElement('a-ring');
	    this.outline.setAttribute('radius-outer', 0.1);
	    this.outline.setAttribute('radius-inner', 0.078);
	    this.outline.setAttribute('position', '0.1 0 0.002');
	    this.el.appendChild(this.outline);
	
	    // CIRCLE
	    this.circle = document.createElement('a-circle');
	    this.circle.setAttribute('radius', 0.05);
	    this.circle.setAttribute('position', '0.1 0 0.002');
	    this.el.appendChild(this.circle);
	
	    // LABEL
	    this.label = document.createElement('a-entity');
	    this.el.appendChild(this.label);
	
	    // EVENTS
	    this.el.addEventListener('click', function () {
	      if (this.components.radio.data.disabled) {
	        return;
	      }
	      this.setAttribute('checked', true);
	      that.onClick();
	    });
	    this.el.addEventListener('mousedown', function () {
	      if (this.components.radio.data.disabled) {
	        return SFX.clickDisabled(this);
	      }
	      SFX.click(this);
	    });
	
	    Object.defineProperty(this.el, 'value', {
	      get: function get() {
	        return this.getAttribute('value');
	      },
	      set: function set(value) {
	        this.setAttribute('value', value);
	      },
	      enumerable: true,
	      configurable: true
	    });
	  },
	  onClick: function onClick(noemit) {
	    if (this.data.name) {
	      var nearestForm = this.el.closest("a-form");
	      if (nearestForm) {
	        var didCheck = false;
	        var children = Array.from(nearestForm.querySelectorAll('[name=' + this.data.name + ']'));
	        children.reverse();
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	          for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var child = _step.value;
	
	            // Radio + not disabled
	            if (child.components.radio) {
	              // Currently checked
	              if (child === this.el && child.hasAttribute('checked')) {
	                didCheck = true;
	                child.components.radio.check();
	                if (!noemit) {
	                  Event.emit(child, 'change', true);
	                }
	              } else {
	                if (!didCheck && !this.data.checked && child.hasAttribute('checked')) {
	                  didCheck = true;
	                  child.components.radio.check();
	                } else {
	                  child.components.radio.uncheck();
	                }
	              }
	            }
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	
	        if (!didCheck && this.el.hasAttribute('checked')) {
	          this.check();
	          if (!noemit) {
	            Event.emit(this.el, 'change', true);
	          }
	        }
	      }
	    }
	  },
	  check: function check() {
	    this.outline.setAttribute('color', this.data.radioColorChecked);
	    this.circle.setAttribute('color', this.data.radioColorChecked);
	    this.circle.setAttribute('visible', true);
	    if (this.data.disabled) {
	      this.disabled();
	    }
	  },
	  uncheck: function uncheck() {
	    this.outline.setAttribute('color', this.data.radioColor);
	    this.circle.setAttribute('visible', false);
	    if (this.data.disabled) {
	      this.disabled();
	    }
	  },
	  disabled: function disabled() {
	    this.outline.setAttribute('color', this.data.radioColor);
	    this.circle.setAttribute('color', this.data.radioColor);
	  },
	  update: function update() {
	    var that = this;
	    this.onClick(true);
	
	    // HITBOX
	    this.hitbox.setAttribute('width', this.data.width);
	    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.001');
	
	    var props = {
	      color: this.data.color,
	      align: 'left',
	      wrapCount: 10 * (this.data.width + 0.2),
	      width: this.data.width
	    };
	    if (this.data.font) {
	      props.font = this.data.font;
	    }
	
	    // TITLE
	    props.value = this.data.label;
	    props.color = this.data.color;
	    this.label.setAttribute('text', props);
	    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.002');
	
	    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
	    function getTextWidth(el, _widthFactor) {
	      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
	        return 0;
	      }
	      var v = el.object3D.children[0].geometry.visibleGlyphs;
	      if (!v) {
	        return 0;
	      }
	      v = v[v.length - 1];
	      if (!v) {
	        return 0;
	      }
	      if (v.line) {
	        props.value = props.value.slice(0, -1);
	        el.setAttribute("text", props);
	        return getTextWidth(el);
	      } else {
	        if (!_widthFactor) {
	          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
	        }
	        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
	        var textRatio = v / that.data.width;
	        if (textRatio > 1) {
	          props.value = props.value.slice(0, -1);
	          el.setAttribute("text", props);
	          return getTextWidth(el, _widthFactor);
	        }
	      }
	      return v;
	    }
	    setTimeout(function () {
	      if (that.data.label.length) {
	        getTextWidth(that.label);
	      }
	      if (that.data.disabled) {
	        var timer = setInterval(function () {
	          if (that.outline.object3D.children[0]) {
	            clearInterval(timer);
	            Utils.updateOpacity(that.outline, 0.4);
	            Utils.updateOpacity(that.circle, 0.4);
	            Utils.updateOpacity(that.label, 0.4);
	          }
	        }, 10);
	      } else {
	        var _timer = setInterval(function () {
	          if (that.outline.object3D.children[0]) {
	            clearInterval(_timer);
	            Utils.updateOpacity(that.outline, 1);
	            Utils.updateOpacity(that.circle, 1);
	            Utils.updateOpacity(that.label, 1);
	          }
	        }, 10);
	      }
	    }, 0);
	  }
	});
	
	AFRAME.registerPrimitive('a-radio', {
	  defaultComponents: {
	    radio: {}
	  },
	  mappings: {
	    checked: 'radio.checked',
	    disabled: 'radio.disabled',
	    name: 'radio.name',
	    value: 'radio.value',
	    label: 'radio.label',
	    'radio-color': 'radio.radioColor',
	    'radio-color-checked': 'radio.radioColorChecked',
	    color: 'radio.color',
	    align: 'radio.align',
	    font: 'radio.font',
	    'letter-spacing': 'radio.letterSpacing',
	    'line-height': 'radio.lineHeight',
	    'opacity': 'radio.opacity',
	    width: 'radio.width'
	  }
	});

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = [{ type: 'audio', id: 'aframeRadioClick', src: AFRAME.ASSETS_PATH + '/sounds/InputClick.mp3' }, { type: 'audio', id: 'aframeRadioClickDisabled', src: AFRAME.ASSETS_PATH + '/sounds/ButtonClickDisabled.mp3' }];

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	'use strict';
	
	var SFX = {
	
	  init: function init(parent) {
	    var el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeRadioClickSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeRadioClick');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	
	    el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeRadioClickDisabledSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeRadioClickDisabled');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	  },
	
	  click: function click(parent) {
	    var el = parent.querySelector('[key=aframeRadioClickSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  },
	
	  clickDisabled: function clickDisabled(parent) {
	    var el = parent.querySelector('[key=aframeRadioClickDisabledSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  }
	};
	
	module.exports = SFX;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	var Assets = __webpack_require__(22);
	var SFX = __webpack_require__(23);
	
	AFRAME.registerComponent('checkbox', {
	  schema: {
	    checked: { type: 'boolean', default: false },
	    disabled: { type: 'boolean', default: false },
	    name: { type: "string", default: "" },
	    value: { type: "string", default: "" },
	    label: { type: "string", default: "" },
	    checkboxColor: { type: "color", default: "#757575" },
	    checkboxColorChecked: { type: "color", default: "#4076fd" },
	    color: { type: "color", default: "#757575" },
	    font: { type: "string", default: "" },
	    letterSpacing: { type: "int", default: 0 },
	    lineHeight: { type: "string", default: "" },
	    opacity: { type: "number", default: 1 },
	    width: { type: "number", default: 1 }
	  },
	  init: function init() {
	    var that = this;
	
	    // Assets
	    Utils.preloadAssets(Assets);
	
	    // SFX
	    SFX.init(this.el);
	
	    // HITBOX
	    this.hitbox = document.createElement('a-plane');
	    this.hitbox.setAttribute('height', 0.2);
	    this.hitbox.setAttribute('opacity', 0);
	    this.el.appendChild(this.hitbox);
	
	    // OUTLINE
	    this.outline = document.createElement('a-rounded');
	    this.outline.setAttribute('width', 0.2);
	    this.outline.setAttribute('height', 0.2);
	    this.outline.setAttribute('radius', 0.02);
	    this.outline.setAttribute('position', '0 -' + 0.2 / 2 + ' 0.01');
	    this.el.appendChild(this.outline);
	
	    // INSIDE
	    this.inside = document.createElement('a-rounded');
	    this.inside.setAttribute('width', 0.156);
	    this.inside.setAttribute('height', 0.156);
	    this.inside.setAttribute('radius', 0.01);
	    this.inside.setAttribute('color', "#EEE");
	    this.inside.setAttribute('position', 0.156 / 8 + ' -' + 0.156 / 2 + ' 0.02');
	    this.el.appendChild(this.inside);
	
	    // CHECKMARK
	    this.checkmark = document.createElement('a-image');
	    this.checkmark.setAttribute('width', 0.16);
	    this.checkmark.setAttribute('height', 0.16);
	    this.checkmark.setAttribute('src', "#aframeCheckboxMark");
	    this.checkmark.setAttribute('position', '0.1 0 0.03');
	    this.el.appendChild(this.checkmark);
	
	    // LABEL
	    this.label = document.createElement('a-entity');
	    this.el.appendChild(this.label);
	
	    // EVENTS
	    this.el.addEventListener('click', function () {
	      if (this.components.checkbox.data.disabled) {
	        return;
	      }
	      this.components.checkbox.data.checked = !this.components.checkbox.data.checked;
	      this.setAttribute('checked', this.components.checkbox.data.checked);
	      that.onClick();
	    });
	    this.el.addEventListener('mousedown', function () {
	      if (this.components.checkbox.data.disabled) {
	        return SFX.clickDisabled(this);
	      }
	      SFX.click(this);
	    });
	
	    Object.defineProperty(this.el, 'value', {
	      get: function get() {
	        return this.getAttribute('value');
	      },
	      set: function set(value) {
	        this.setAttribute('value', value);
	      },
	      enumerable: true,
	      configurable: true
	    });
	  },
	  onClick: function onClick(noemit) {
	    if (this.data.checked) {
	      this.check();
	    } else {
	      this.uncheck();
	    }
	    if (!noemit) {
	      Event.emit(this.el, 'change', this.data.checked);
	    }
	  },
	  check: function check() {
	    this.outline.setAttribute('color', this.data.checkboxColorChecked);
	    this.inside.setAttribute('color', this.data.checkboxColorChecked);
	    this.checkmark.setAttribute('visible', true);
	    if (this.data.disabled) {
	      this.disabled();
	    }
	  },
	  uncheck: function uncheck() {
	    this.outline.setAttribute('color', this.data.checkboxColor);
	    this.inside.setAttribute('color', "#EEE");
	    this.checkmark.setAttribute('visible', false);
	    if (this.data.disabled) {
	      this.disabled();
	    }
	  },
	  disabled: function disabled() {
	    this.outline.setAttribute('color', this.data.checkboxColor);
	    this.inside.setAttribute('color', this.data.checkboxColor);
	  },
	  update: function update() {
	    var that = this;
	    this.onClick(true);
	
	    // HITBOX
	    this.hitbox.setAttribute('width', this.data.width);
	    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.01');
	
	    var props = {
	      color: this.data.color,
	      align: 'left',
	      wrapCount: 10 * (this.data.width + 0.2),
	      width: this.data.width
	    };
	    if (this.data.font) {
	      props.font = this.data.font;
	    }
	
	    // TITLE
	    props.value = this.data.label;
	    props.color = this.data.color;
	    this.label.setAttribute('text', props);
	    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.01');
	
	    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
	    function getTextWidth(el, _widthFactor) {
	      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
	        return 0;
	      }
	      var v = el.object3D.children[0].geometry.visibleGlyphs;
	      if (!v) {
	        return 0;
	      }
	      v = v[v.length - 1];
	      if (!v) {
	        return 0;
	      }
	      if (v.line) {
	        props.value = props.value.slice(0, -1);
	        el.setAttribute("text", props);
	        return getTextWidth(el);
	      } else {
	        if (!_widthFactor) {
	          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
	        }
	        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
	        var textRatio = v / that.data.width;
	        if (textRatio > 1) {
	          props.value = props.value.slice(0, -1);
	          el.setAttribute("text", props);
	          return getTextWidth(el, _widthFactor);
	        }
	      }
	      return v;
	    }
	    setTimeout(function () {
	      if (that.data.label.length) {
	        getTextWidth(that.label);
	      }
	      if (that.data.disabled) {
	        var timer = setInterval(function () {
	          if (that.checkmark.object3D.children[0]) {
	            clearInterval(timer);
	            Utils.updateOpacity(that.checkmark, 0.4);
	            Utils.updateOpacity(that.label, 0.4);
	          }
	        }, 10);
	      } else {
	        var _timer = setInterval(function () {
	          if (that.checkmark.object3D.children[0]) {
	            clearInterval(_timer);
	            Utils.updateOpacity(that.checkmark, 1);
	            Utils.updateOpacity(that.label, 1);
	          }
	        }, 10);
	      }
	    }, 0);
	  }
	});
	
	AFRAME.registerPrimitive('a-checkbox', {
	  defaultComponents: {
	    checkbox: {}
	  },
	  mappings: {
	    checked: 'checkbox.checked',
	    disabled: 'checkbox.disabled',
	    name: 'checkbox.name',
	    value: 'checkbox.value',
	    label: 'checkbox.label',
	    'checkbox-color': 'checkbox.checkboxColor',
	    'checkbox-color-checked': 'checkbox.checkboxColorChecked',
	    color: 'checkbox.color',
	    align: 'checkbox.align',
	    font: 'checkbox.font',
	    'letter-spacing': 'checkbox.letterSpacing',
	    'line-height': 'checkbox.lineHeight',
	    'opacity': 'checkbox.opacity',
	    width: 'checkbox.width'
	  }
	});

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = [{ type: 'img', id: 'aframeCheckboxMark', src: AFRAME.ASSETS_PATH + '/images/CheckmarkIcon.png' }, { type: 'audio', id: 'aframeCheckboxClick', src: AFRAME.ASSETS_PATH + '/sounds/InputClick.mp3' }, { type: 'audio', id: 'aframeCheckboxClickDisabled', src: AFRAME.ASSETS_PATH + '/sounds/ButtonClickDisabled.mp3' }];

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	'use strict';
	
	var SFX = {
	
	  init: function init(parent) {
	    var el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeCheckboxClickSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeCheckboxClick');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	
	    el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeButtonClickDisabledSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeButtonClickDisabled');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	  },
	
	  click: function click(parent) {
	    var el = parent.querySelector('[key=aframeCheckboxClickSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  },
	
	  clickDisabled: function clickDisabled(parent) {
	    var el = parent.querySelector('[key=aframeButtonClickDisabledSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  }
	};
	
	module.exports = SFX;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Utils = __webpack_require__(4);
	var Event = __webpack_require__(10);
	var Assets = __webpack_require__(25);
	var SFX = __webpack_require__(26);
	
	AFRAME.registerComponent('button', {
	  schema: {
	    disabled: { type: 'boolean', default: false },
	    type: { type: "string", default: "raised" },
	    name: { type: "string", default: "" },
	    value: { type: "string", default: "Button" },
	    buttonColor: { type: "color", default: "#4076fd" },
	    color: { type: "color", default: "#FFF" },
	    font: { type: "string", default: "" },
	    letterSpacing: { type: "int", default: 0 },
	    lineHeight: { type: "string", default: "" },
	    opacity: { type: "number", default: 1 },
	    width: { type: "number", default: 1 }
	  },
	  init: function init() {
	    var that = this;
	
	    // Assets
	    Utils.preloadAssets(Assets);
	
	    // SFX
	    SFX.init(this.el);
	
	    this.wrapper = document.createElement('a-entity');
	    this.wrapper.setAttribute('position', '0 0 0.01');
	    this.el.appendChild(this.wrapper);
	
	    this.shadow = document.createElement('a-image');
	    this.shadow.setAttribute('height', 0.36 * 1.25);
	    this.shadow.setAttribute('src', '#aframeButtonShadow');
	    this.wrapper.appendChild(this.shadow);
	
	    // OUTLINE
	    this.outline = document.createElement('a-rounded');
	    this.outline.setAttribute('height', 0.36);
	    this.outline.setAttribute('radius', 0.03);
	    this.outline.setAttribute('position', '0 -' + 0.36 / 2 + ' 0.01');
	    this.wrapper.appendChild(this.outline);
	
	    // LABEL
	    this.label = document.createElement('a-entity');
	    this.outline.appendChild(this.label);
	
	    // EVENTS
	    this.el.addEventListener('click', function () {
	      if (this.components.button && this.components.button.data.disabled) {
	        return;
	      }
	      that.onClick();
	    });
	    this.el.addEventListener('mousedown', function () {
	      if (this.components.button && this.components.button.data.disabled) {
	        return SFX.clickDisabled(this);
	      }
	      that.wrapper.setAttribute('position', '0 0 0.036');
	      SFX.click(this);
	    });
	    this.el.addEventListener('mouseup', function () {
	      if (this.components.button && this.components.button.data.disabled) {
	        return;
	      }
	      that.wrapper.setAttribute('position', '0 0 0');
	    });
	
	    this.el.getWidth = this.getWidth.bind(this);
	    Object.defineProperty(this.el, 'value', {
	      get: function get() {
	        return this.getAttribute('value');
	      },
	      set: function set(value) {
	        this.setAttribute('value', value);
	      },
	      enumerable: true,
	      configurable: true
	    });
	  },
	  getWidth: function getWidth() {
	    return this.__width;
	  },
	  update: function update() {
	    var that = this;
	    this.outline.setAttribute('color', this.data.buttonColor);
	
	    var props = {
	      color: this.data.color,
	      align: 'center',
	      wrapCount: 10 * this.data.width,
	      width: this.data.width
	    };
	    if (this.data.font) {
	      props.font = this.data.font;
	    }
	
	    if (this.data.type === "flat") {
	      props.color = this.data.buttonColor;
	    }
	
	    // TITLE
	    props.value = this.data.value.toUpperCase();
	    this.label.setAttribute('text', props);
	    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.01');
	
	    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
	    function getTextWidth(el, callback, _widthFactor) {
	      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
	        return setTimeout(function () {
	          getTextWidth(el, callback);
	        }, 10);
	      }
	      var v = el.object3D.children[0].geometry.visibleGlyphs;
	      if (!v) {
	        return setTimeout(function () {
	          getTextWidth(el, callback);
	        }, 10);
	      }
	      v = v[v.length - 1];
	      if (!v) {
	        return callback(0);
	      }
	      if (v.line) {
	        props.value = props.value.slice(0, -1);
	        el.setAttribute("text", props);
	        return getTextWidth(el, callback);
	      } else {
	        if (!_widthFactor) {
	          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
	        }
	        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
	        var textRatio = v / that.data.width;
	        if (textRatio > 1) {
	          props.value = props.value.slice(0, -1);
	          el.setAttribute("text", props);
	          return getTextWidth(el, callback, _widthFactor);
	        }
	      }
	      return callback(v);
	    }
	    setTimeout(function () {
	      if (that.data.value.length) {
	        getTextWidth(that.label, function (width) {
	          that.label.setAttribute('position', width / 2 + 0.28 / 2 + ' ' + 0.36 / 2 + ' 0.02'); //
	          width = width + 0.28;
	          that.outline.setAttribute('width', width);
	          that.__width = width;
	          that.shadow.setAttribute('width', width * 1.17);
	          that.shadow.setAttribute('position', width / 2 + ' 0 0');
	          Event.emit(that.el, 'change:width', width);
	        });
	      }
	
	      if (that.data.disabled) {
	        that.shadow.setAttribute('visible', false);
	        var timer = setInterval(function () {
	          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
	            clearInterval(timer);
	            Utils.updateOpacity(that.el, 0.4);
	          }
	        }, 10);
	      } else {
	        var _timer = setInterval(function () {
	          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
	            clearInterval(_timer);
	            Utils.updateOpacity(that.el, 1);
	          }
	        }, 10);
	      }
	
	      if (that.data.type === "flat") {
	        that.shadow.setAttribute('visible', false);
	        var _timer2 = setInterval(function () {
	          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
	            clearInterval(_timer2);
	            Utils.updateOpacity(that.outline, 0);
	            if (that.data.disabled) {
	              Utils.updateOpacity(that.label, 0.4);
	            }
	          }
	        }, 10);
	      }
	    }, 0);
	  }
	});
	
	AFRAME.registerPrimitive('a-button', {
	  defaultComponents: {
	    button: {}
	  },
	  mappings: {
	    disabled: 'button.disabled',
	    type: 'button.type',
	    name: 'button.name',
	    value: 'button.value',
	    'button-color': 'button.buttonColor',
	    color: 'button.color',
	    font: 'button.font',
	    'letter-spacing': 'button.letterSpacing',
	    'line-height': 'button.lineHeight',
	    'opacity': 'button.opacity',
	    'width': 'button.width'
	  }
	});

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = [{ type: 'img', id: 'aframeButtonShadow', src: AFRAME.ASSETS_PATH + '/images/ButtonShadow.png' }, { type: 'audio', id: 'aframeButtonClick', src: AFRAME.ASSETS_PATH + '/sounds/ButtonClick.mp3' }, { type: 'audio', id: 'aframeButtonClickDisabled', src: AFRAME.ASSETS_PATH + '/sounds/ButtonClickDisabled.mp3' }];

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';
	
	var SFX = {
	
	  init: function init(parent) {
	    var el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeButtonClickSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeButtonClick');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	
	    el = document.createElement('a-sound');
	    el.setAttribute('key', 'aframeButtonClickDisabledSound');
	    el.setAttribute('sfx', true);
	    el.setAttribute('src', '#aframeButtonClickDisabled');
	    el.setAttribute('position', '0 2 5');
	    parent.appendChild(el);
	  },
	
	  click: function click(parent) {
	    var el = parent.querySelector('[key=aframeButtonClickSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  },
	
	  clickDisabled: function clickDisabled(parent) {
	    var el = parent.querySelector('[key=aframeButtonClickDisabledSound]');
	    if (!el) {
	      return;
	    }
	    el.components.sound.stopSound();
	    el.components.sound.playSound();
	  }
	};
	
	module.exports = SFX;

/***/ })
/******/ ]);
//# sourceMappingURL=aframe-material.js.map