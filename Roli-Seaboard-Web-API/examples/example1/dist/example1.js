/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../../js/MIDI.js":
/*!**************************************************!*\
  !*** /home/lp1/Projects/seaboard-api/js/MIDI.js ***!
  \**************************************************/
/*! exports provided: MIDIController, Synthetizer, CustomSynthetizer, FunctionSynthetizer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MIDIController\", function() { return MIDIController; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Synthetizer\", function() { return Synthetizer; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"CustomSynthetizer\", function() { return CustomSynthetizer; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FunctionSynthetizer\", function() { return FunctionSynthetizer; });\n/**\n * MIDI.js\n * A set of audio helpers to handle MIDI messages and play digital sounds.\n */\n\nconst defaultSynthConf = {\n  fadeTime: 0.2, // The fade in and out duration\n  type: 'sine' // \"sine\", \"square\", \"sawtooth\" or \"triangle\"\n}\n\n/**\n * Synthetizer\n * The default Synthetizer class, interprets MIDI parsed messages\n * through handleMessage and plays sounds accordingly using its\n * oscillators.\n */\nclass Synthetizer {\n  constructor (name, configuration = defaultSynthConf) {\n    this.name = name\n    this.configuration = configuration\n    this.oscillators = {}\n    this.audioContext = MIDIController.audioContext\n    this.gainNodes = {}\n    this.notes = {}\n  }\n  handleMessage (message) {\n    switch (message.type) {\n      case 'Note ON':\n        this.message = message\n        if (!this.oscillators[message.channel]) {\n          this.initOscillator(message.note, message.channel)\n        }\n        this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(message.note)\n        this.notes[message.channel] = message.note\n        break\n      case 'NOTE OFF':\n        this.gainNodes[message.channel].gain.setTargetAtTime(0, this.audioContext.currentTime, this.configuration.fadeTime)\n        break\n      case 'Channel Pressure (After-touch)':\n        this.gainNodes[message.channel].gain.setTargetAtTime(message.pressure / 100, this.audioContext.currentTime, this.configuration.fadeTime)\n        break\n      case 'Pitch Bend Change':\n        const noteModulation = this.notes[message.channel] + message.pitchBend\n        if (!isNaN(noteModulation)) {\n          this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(noteModulation)\n        }\n        break\n    }\n  }\n  initOscillator (note, channel) {\n    const frequency = MIDIController.noteToFrequency(note)\n    let gainNode = this.gainNodes[channel]\n    let oscillator = this.oscillators[channel]\n    if (!gainNode) {\n      gainNode = this.audioContext.createGain()\n      this.gainNodes[channel] = gainNode\n      gainNode.gain.value = 0\n      gainNode.connect(this.audioContext.destination)\n    }\n    if (!oscillator) {\n      oscillator = this.audioContext.createOscillator()\n      if (oscillator.type !== this.configuration.type) {\n        oscillator.type = this.configuration.type\n      }\n      this.oscillators[channel] = oscillator\n      oscillator.connect(gainNode)\n    }\n    oscillator.frequency.value = frequency\n    oscillator.start()\n  }\n}\n\n/**\n * CustomSynthetizer\n * The custom Synthetizer class, creates a new PeriodicWave instance and uses\n * it on each oscillator.\n * Ref: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave\n */\nclass CustomSynthetizer extends Synthetizer {\n  constructor (name, configuration = defaultSynthConf, sin, cosin, disableNormalization = false) {\n    super(name, configuration)\n    this.periodicWave = this.audioContext.createPeriodicWave(sin, cosin, {disableNormalization: disableNormalization})\n    this.sin = sin\n    this.cosin = cosin\n    this.custom = true\n  }\n  initOscillator (note, channel) {\n    const frequency = MIDIController.noteToFrequency(note)\n    let gainNode = this.gainNodes[channel]\n    let oscillator = this.oscillators[channel]\n    if (!gainNode) {\n      gainNode = this.audioContext.createGain()\n      this.gainNodes[channel] = gainNode\n      gainNode.gain.value = 0\n      gainNode.connect(this.audioContext.destination)\n    }\n    if (!oscillator) {\n      oscillator = this.audioContext.createOscillator()\n      oscillator.setPeriodicWave(this.periodicWave)\n      this.oscillators[channel] = oscillator\n      oscillator.connect(gainNode)\n    }\n    oscillator.frequency.value = frequency\n    oscillator.start()\n  }\n}\n\n/**\n * FunctionSynthetizer\n * Another custom Synthetizer class, uses a function to\n * creates its new PeriodicWave (with {numSamples} samples)\n * Ref: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave\n */\nclass FunctionSynthetizer extends CustomSynthetizer {\n  constructor (name, configuration = defaultSynthConf, funct, disableNormalization = false, numSamples = 12) {\n    const sin = []\n    const cos = new Int8Array(numSamples)\n    sin[0] = 0\n    for (let i = 1; i < numSamples; i++) {\n      sin.push(funct(i))\n    }\n    super(name, configuration, sin, cos, disableNormalization)\n  }\n}\n\n/**\n * MIDIControllerClass\n * MIDI Devices handler and messages parser\n */\nclass MIDIControllerClass {\n  constructor () {\n    this.onMidiMessage = null\n    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()\n    if (typeof navigator['requestMIDIAccess'] === 'function') {\n      console.log('MIDIController :: Compatible browser found')\n      this.compatibleBrowser = true\n    } else {\n      console.error('No requestMIDIAccess available on your browser. Please use the latest Chrome version.')\n      this.compatibleBrowser = false\n    }\n  }\n  requestMIDIAccess (clearCache = false) {\n    return new Promise((resolve, reject) => {\n      if (this.compatibleBrowser) {\n        if (this.MIDIAccess && !clearCache) {\n          resolve(this.MIDIAccess)\n        } else {\n          navigator\n            .requestMIDIAccess()\n            .then((MIDIAccess) => {\n              this.MIDIAccess = MIDIAccess\n              this.MIDIAccess.onstatechanged = (change) => console.warn('MIDIController :: onstatechanged', change)              \n              resolve(MIDIAccess)\n            })\n            .catch(error => reject(error))\n        }\n      } else {\n        reject(new Error('Incompatible browser'))\n      }\n    })\n  }\n  getInputsByManufacturer (manufacturer) {\n    return new Promise((resolve, reject) => {\n      this\n      .requestMIDIAccess()\n      .then(MIDIAccess => {\n        const inputs = []\n        MIDIAccess.inputs.forEach(MIDIInput => {\n          if (MIDIInput.manufacturer === manufacturer) {\n            inputs.push(MIDIInput)\n          }\n        })\n        resolve(inputs)\n      })\n      .catch(error => reject(error))\n    })\n  }\n  connect (MIDIPort) {\n    return new Promise((resolve, reject) => {\n      MIDIPort\n        .open()\n        .then((MIDIPort) => {\n          console.log('MIDIController :: Connection established', MIDIPort)\n          resolve(MIDIPort)\n        })\n        .catch(error => reject(error))\n    })\n  }\n  noteToFrequency (note) {\n    const a = 440\n    return (a / 32) * Math.pow(2, (note - 9) / 12)\n  }\n  parseMessage (message) {\n    const parsed = {}\n    parsed.channelVoiceMessage = message[0]\n    parsed.channel = parseInt(message[0].toString(2).slice(4), 2)\n    parsed.data1 = parseInt(message[1].toString(2), 2)\n    if (message.length > 2) {\n      parsed.data2 = parseInt(message[2].toString(2), 2)\n    }\n    switch (parsed.channelVoiceMessage.toString(2).slice(0, 4)) {\n      case '1000':\n        parsed.type = 'Note OFF'\n        parsed.note = parsed.data1\n        break\n      case '1001':\n        parsed.type = 'Note ON'\n        parsed.note = parsed.data1\n        break\n      case '1010':\n        parsed.type = 'Polyphonic key pressure'\n        break\n      case '1011':\n        parsed.type = 'Control change'\n        parsed.controlChange = parsed.data2\n        break\n      case '1100':\n        parsed.type = 'Program change'\n        break\n      case '1101':\n        parsed.type = 'Channel Pressure (After-touch)'\n        parsed.pressure = parsed.data1\n        break\n      case '1110':\n        parsed.type = 'Pitch Bend Change'\n        parsed.pitchBend = parsed.data2 - 64\n        parsed.pitchBend = parsed.pitchBend !== -1 ? parsed.pitchBend : 0\n        break\n    }\n    return parsed\n  }\n}\n\nconst MIDIController = new MIDIControllerClass()\n\n\n\n//# sourceURL=webpack:////home/lp1/Projects/seaboard-api/js/MIDI.js?");

/***/ }),

/***/ "../../../js/Seaboard.js":
/*!******************************************************!*\
  !*** /home/lp1/Projects/seaboard-api/js/Seaboard.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MIDI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MIDI */ \"../../../js/MIDI.js\");\n\n\nclass Seaboard {\n  constructor (MIDIPort) {\n    this.MIDIPort = MIDIPort\n    this.channels = {}\n    this.numKeys = 24\n    this.firstKey = 0\n    this.messagesSubscriptions = []\n  }\n  connect () {\n    return new Promise((resolve, reject) => {\n      this.MIDIPort\n        .open()\n        .then(MIDIPort => {\n          MIDIPort.onmidimessage = message => this.onMessage(message)\n          resolve(MIDIPort)\n        })\n        .catch(error => reject(error))\n    })\n  }\n  onMessage (message) {\n    console.log('onMessage')\n    const parsedMessage = _MIDI__WEBPACK_IMPORTED_MODULE_0__[\"MIDIController\"].parseMessage(message.data)\n    this.channels[parsedMessage.channel] = this.channels[parsedMessage.channel] || {posY: 0}\n    switch (parsedMessage.type) {\n      case 'Note ON':\n        this.updateKeysRange(parsedMessage.note)\n        this.channels[parsedMessage.channel]['note'] = parsedMessage.note\n        break\n      case 'Note OFF':\n        this.channels[parsedMessage.channel] = {posY: 0}\n        break\n      case 'Channel Pressure (After-touch)':\n        this.channels[parsedMessage.channel]['pressure'] = parsedMessage.pressure\n        break\n      case 'Control change':\n        if (this.channels[parsedMessage.channel]['note'] !== undefined) {\n          this.channels[parsedMessage.channel]['posY'] = parsedMessage.controlChange\n        }\n        break\n      case 'Pitch Bend Change':\n        this.channels[parsedMessage.channel]['pitchBend'] = parsedMessage.pitchBend\n        break\n    }\n    if (this.messagesSubscriptions.length) {\n      this.messagesSubscriptions.forEach(callback => {\n        if (typeof callback === 'function') {\n          callback(parsedMessage)\n        }\n      })\n    }\n  }\n  subscribeToMessages (callback) {\n    const id = this.messagesSubscriptions.length\n    this.messagesSubscriptions.push(callback)\n    return id\n  }\n  unsubscribeToMessages (id) {\n    this.messagesSubscriptions.splice(id, 1)\n  }\n  updateKeysRange (note) {\n    if (note > (this.firstKey + this.numKeys)) {\n      while (note > this.firstKey + this.numKeys) {\n        this.firstKey += this.numKeys / 2\n      }\n    } else if (note < this.firstKey) {\n      while (note < this.firstKey) {\n        this.firstKey -= this.numKeys / 2\n      }\n    }\n  }\n  getCoordinates () {\n    const coordinates = []\n    for (const index in this.channels) {\n      const channel = this.channels[index]\n      const channelCoordinates = {}\n      if (channel.note !== undefined) {\n        if (channel.pitchBend) {\n          channelCoordinates.x = (channel.note + channel.pitchBend * 23 / 30) - this.firstKey\n        } else {\n          channelCoordinates.x = channel.note - this.firstKey\n        }\n        channelCoordinates.y = 125 - channel.posY\n        channelCoordinates.size = channel.pressure\n        coordinates.push(channelCoordinates)\n      }\n    }\n    return coordinates\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Seaboard);\n\n\n//# sourceURL=webpack:////home/lp1/Projects/seaboard-api/js/Seaboard.js?");

/***/ }),

/***/ "../example1.js":
/*!**********************!*\
  !*** ../example1.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _lib_Seaboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/Seaboard */ \"../../../js/Seaboard.js\");\n/* harmony import */ var _lib_MIDI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/MIDI */ \"../../../js/MIDI.js\");\n\n\n\n_lib_MIDI__WEBPACK_IMPORTED_MODULE_1__[\"MIDIController\"]\n  .getInputsByManufacturer('ROLI Ltd.')\n  .then((MIDIInputs) => {\n    console.log(MIDIInputs)\n    if (!MIDIInputs.length) {\n      console.error(`No ROLI device found.<br/>\n      Please connect a Seaboard device using USB`)\n      return\n    }\n    MIDIInputs.forEach((MIDIInput) => {\n      const seaboard = new _lib_Seaboard__WEBPACK_IMPORTED_MODULE_0__[\"default\"](MIDIInput)\n      seaboard.connect()\n        .then(() => {\n          seaboard.subscribeToMessages(displayParsedMIDIMessage)\n        })\n    })\n  })\n  .catch(error => console.error(error))\n\nconst displayParsedMIDIMessage = (message) => {\n  document.body.innerHTML += `<pre>${JSON.stringify(message)}</pre>`\n}\n\n\n//# sourceURL=webpack:///../example1.js?");

/***/ }),

/***/ 0:
/*!****************************************************!*\
  !*** multi ./MIDI.js ./Seaboard.js ../example1.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./MIDI.js */\"../../../js/MIDI.js\");\n__webpack_require__(/*! ./Seaboard.js */\"../../../js/Seaboard.js\");\nmodule.exports = __webpack_require__(/*! ../example1.js */\"../example1.js\");\n\n\n//# sourceURL=webpack:///multi_./MIDI.js_./Seaboard.js_../example1.js?");

/***/ })

/******/ });