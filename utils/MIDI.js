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
