/**
 * MIDI.js
 * A set of audio helpers to handle MIDI messages and play digital sounds.
 */

const defaultSynthConf = {
  gain: 0,
  fadeTime: 0.2, // The fade in and out duration
  type: 'sine' // "sine", "square", "sawtooth" or "triangle"
}

/**
 * Synthetizer
 * The default Synthetizer class, interprets MIDI parsed messages
 * through handleMessage and plays sounds accordingly using its
 * oscillators.
 */
class Synthetizer {
  constructor (name, configuration = defaultSynthConf) {
    this.name = name
    this.configuration = configuration
    this.configuration.gain = this.configuration.gain || 0
    this.oscillators = {}
    this.audioContext = MIDIController.audioContext
    this.gainNodes = {}
    this.notes = {}
    this.type = 'classic'
  }
  handleMessage (message) {
    switch (message.type) {
      case 'Note ON':
        this.message = message
        if (!this.oscillators[message.channel]) {
          this.initOscillator(message.note, message.channel)
        }
        this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(message.note)
        this.notes[message.channel] = message.note
        break
      case 'NOTE OFF':
        this.gainNodes[message.channel].gain.linearRampToValueAtTime(0, this.audioContext.currentTime + this.configuration.fadeTime)
        break
      case 'Channel Pressure (After-touch)':
        console.log('gain', message.pressure / (128 + this.configuration.gain))
        this.gainNodes[message.channel].gain.linearRampToValueAtTime(message.pressure / (128 + this.configuration.gain),
        this.audioContext.currentTime + 0.1)
        break
      case 'Pitch Bend Change':
        const noteModulation = this.notes[message.channel] + message.pitchBend
        if (!isNaN(noteModulation)) {
          this.oscillators[message.channel].frequency.exponentialRampToValueAtTime(MIDIController.noteToFrequency(noteModulation), this.audioContext.currentTime + 0.1)
        }
        break
    }
  }
  initOscillator (note, channel) {
    const frequency = MIDIController.noteToFrequency(note)
    let gainNode = this.gainNodes[channel]
    let oscillator = this.oscillators[channel]
    if (!gainNode) {
      gainNode = this.audioContext.createGain()
      this.gainNodes[channel] = gainNode
      gainNode.gain.value = 0
      gainNode.connect(this.audioContext.destination)
    }
    if (!oscillator) {
      oscillator = this.audioContext.createOscillator()
      if (oscillator.type !== this.configuration.type) {
        oscillator.type = this.configuration.type
      }
      this.oscillators[channel] = oscillator
      oscillator.connect(gainNode)
    }
    oscillator.frequency.value = frequency
    oscillator.start()
  }
}

/**
 * CustomSynthetizer
 * The custom Synthetizer class, creates a new PeriodicWave instance and uses
 * it on each oscillator.
 * Ref: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave
 */
class CustomSynthetizer extends Synthetizer {
  constructor (name, configuration = defaultSynthConf, sin, cosin, disableNormalization = false) {
    super(name, configuration)
    if (MIDIController.compatibleBrowser) {
      this.periodicWave = this.audioContext.createPeriodicWave(sin, cosin, {disableNormalization: disableNormalization})
    }
    this.sin = sin
    this.cosin = cosin
    this.custom = true
    this.amplitude = Math.max(...this.sin) || (Math.min(...this.sin) * -1)
    this.type = 'custom'
  }
  initOscillator (note, channel) {
    const frequency = MIDIController.noteToFrequency(note)
    let gainNode = this.gainNodes[channel]
    let oscillator = this.oscillators[channel]
    if (!gainNode) {
      gainNode = this.audioContext.createGain()
      this.gainNodes[channel] = gainNode
      gainNode.gain.value = 0
      gainNode.connect(this.audioContext.destination)
    }
    if (!oscillator) {
      oscillator = this.audioContext.createOscillator()
      oscillator.setPeriodicWave(this.periodicWave)
      this.oscillators[channel] = oscillator
      oscillator.connect(gainNode)
    }
    oscillator.frequency.value = frequency
    oscillator.start()
  }
}

/**
 * FunctionSynthetizer
 * Another custom Synthetizer class, uses a function to
 * creates its new PeriodicWave (with {numSamples} samples)
 * Ref: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave
 */
class FunctionSynthetizer extends CustomSynthetizer {
  constructor (name, configuration = defaultSynthConf, funct, disableNormalization = false, numSamples = 12) {
    const sin = []
    const cos = new Int8Array(numSamples)
    sin[0] = 0
    for (let i = 1; i < numSamples; i++) {
      sin.push(funct(i))
    }
    super(name, configuration, sin, cos, disableNormalization)
    this.function = funct
    this.type = 'function'
  }
}

/**
 * MIDIControllerClass
 * MIDI Devices handler and messages parser
 */
class MIDIControllerClass {
  constructor () {
    this.onMidiMessage = null
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    if (typeof navigator['requestMIDIAccess'] === 'function') {
      console.log('MIDIController :: Compatible browser found')
      this.compatibleBrowser = true
    } else {
      console.error('No requestMIDIAccess available on your browser. Please use the latest Chrome version.')
      this.compatibleBrowser = false
    }
  }
  requestMIDIAccess (clearCache = false) {
    return new Promise((resolve, reject) => {
      if (this.compatibleBrowser) {
        if (this.MIDIAccess && !clearCache) {
          resolve(this.MIDIAccess)
        } else {
          navigator
            .requestMIDIAccess()
            .then((MIDIAccess) => {
              this.MIDIAccess = MIDIAccess
              this.MIDIAccess.onstatechanged = (change) => console.warn('MIDIController :: onstatechanged', change)              
              resolve(MIDIAccess)
            })
            .catch(error => reject(error))
        }
      } else {
        reject(new Error('Incompatible browser'))
      }
    })
  }
  getInputs () {
    return new Promise((resolve, reject) => {
      this
      .requestMIDIAccess()
      .then(MIDIAccess => {
        const inputs = []
        MIDIAccess.inputs.forEach(MIDIInput => inputs.push(MIDIInput))
        resolve(inputs)
      })
      .catch(error => reject(error))
    })
  }
  getInputsByManufacturer (manufacturer) {
    return new Promise((resolve, reject) => {
      this
      .requestMIDIAccess()
      .then(MIDIAccess => {
        const inputs = []
        MIDIAccess.inputs.forEach(MIDIInput => {
          if (MIDIInput.manufacturer === manufacturer) {
            inputs.push(MIDIInput)
          }
        })
        resolve(inputs)
      })
      .catch(error => reject(error))
    })
  }
  connect (MIDIPort) {
    return new Promise((resolve, reject) => {
      MIDIPort
        .open()
        .then((MIDIPort) => {
          console.log('MIDIController :: Connection established', MIDIPort)
          resolve(MIDIPort)
        })
        .catch(error => reject(error))
    })
  }
  noteToFrequency (note) {
    const a = 440
    return (a / 32) * Math.pow(2, (note - 9) / 12)
  }
  parseMessage (message) {
    const parsed = {}
    parsed.channelVoiceMessage = message[0]
    parsed.channel = parseInt(message[0].toString(2).slice(4), 2)
    parsed.data1 = parseInt(message[1].toString(2), 2)
    if (message.length > 2) {
      parsed.data2 = parseInt(message[2].toString(2), 2)
    }
    switch (parsed.channelVoiceMessage.toString(2).slice(0, 4)) {
      case '1000':
        parsed.type = 'Note OFF'
        parsed.note = parsed.data1
        break
      case '1001':
        parsed.type = 'Note ON'
        parsed.note = parsed.data1
        break
      case '1010':
        parsed.type = 'Polyphonic key pressure'
        break
      case '1011':
        parsed.type = 'Control change'
        parsed.controlChange = parsed.data2
        break
      case '1100':
        parsed.type = 'Program change'
        break
      case '1101':
        parsed.type = 'Channel Pressure (After-touch)'
        parsed.pressure = parsed.data1
        break
      case '1110':
        parsed.type = 'Pitch Bend Change'
        parsed.pitchBend = parsed.data2 - 64
        parsed.pitchBend = parsed.pitchBend !== -1 ? parsed.pitchBend : 0
        break
    }
    return parsed
  }
}

export const MIDIController = new MIDIControllerClass()
export { Synthetizer, CustomSynthetizer, FunctionSynthetizer }
