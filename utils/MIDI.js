const defaultSynthConf = {
  fadeTime: 0.2, // The time for each sound to fade in and out
  type: 'sine' // "sine", "square", "sawtooth", "triangle" and "custom"
}

class Synthetizer {
  constructor (name, configuration = defaultSynthConf) {
    this.name = name
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.configuration = configuration
    this.oscillators = {}
    this.gainNodes = {}
    this.notes = {}
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
        this.gainNodes[message.channel].gain.setTargetAtTime(0, this.audioContext.currentTime, this.configuration.fadeTime)
        break
      case 'Channel Pressure (After-touch)':
        this.gainNodes[message.channel].gain.setTargetAtTime(message.pressure / 100, this.audioContext.currentTime, this.configuration.fadeTime)
        break
      case 'Pitch Bend Change':
        const noteModulation = this.notes[message.channel] + message.pitchBend
        if (!isNaN(noteModulation)) {
          this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(noteModulation)
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
      oscillator.type = this.configuration.type
      this.oscillators[channel] = oscillator
      oscillator.connect(gainNode)
    }
    oscillator.frequency.value = frequency
    oscillator.start()
  }
}

class MIDIControllerClass {
  constructor () {
    this.onMidiMessage = null
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
  getInputsByManufacturer (manufacturer) {
    return new Promise((resolve, reject) => {
      this
      .requestMIDIAccess()
      .then(MIDIAccess => {
        const inputs = []
        MIDIAccess.inputs.forEach(MIDIPort => {
          if (MIDIPort.manufacturer === manufacturer) {
            inputs.push(MIDIPort)
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
export { Synthetizer }
