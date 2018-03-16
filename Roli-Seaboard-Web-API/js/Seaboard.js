import { MIDIController } from './MIDI'

class Seaboard {
  constructor (MIDIPort) {
    this.MIDIPort = MIDIPort
    this.channels = {}
    this.numKeys = 24
    this.firstKey = 0
    this.messagesSubscriptions = []
  }
  connect () {
    return new Promise((resolve, reject) => {
      this.MIDIPort
        .open()
        .then(MIDIPort => {
          MIDIPort.onmidimessage = message => this.onMessage(message)
          resolve(MIDIPort)
        })
        .catch(error => reject(error))
    })
  }
  onMessage (message) {
    const parsedMessage = MIDIController.parseMessage(message.data)
    this.channels[parsedMessage.channel] = this.channels[parsedMessage.channel] || {posY: 0}
    switch (parsedMessage.type) {
      case 'Note ON':
        this.updateKeysRange(parsedMessage.note)
        this.channels[parsedMessage.channel]['note'] = parsedMessage.note
        break
      case 'Note OFF':
        this.channels[parsedMessage.channel] = {posY: 0}
        break
      case 'Channel Pressure (After-touch)':
        this.channels[parsedMessage.channel]['pressure'] = parsedMessage.pressure
        break
      case 'Control change':
        if (this.channels[parsedMessage.channel]['note'] !== undefined) {
          this.channels[parsedMessage.channel]['posY'] = parsedMessage.controlChange
        }
        break
      case 'Pitch Bend Change':
        this.channels[parsedMessage.channel]['pitchBend'] = parsedMessage.pitchBend
        break
    }
    if (this.messagesSubscriptions.length) {
      this.messagesSubscriptions.forEach(callback => {
        if (typeof callback === 'function') {
          callback(parsedMessage)
        }
      })
    }
  }
  subscribeToMessages (callback) {
    const id = this.messagesSubscriptions.length
    this.messagesSubscriptions.push(callback)
    return id
  }
  unsubscribeToMessages (id) {
    this.messagesSubscriptions.splice(id, 1)
  }
  updateKeysRange (note) {
    if (note > (this.firstKey + this.numKeys)) {
      while (note > this.firstKey + this.numKeys) {
        this.firstKey += this.numKeys / 2
      }
    } else if (note < this.firstKey) {
      while (note < this.firstKey) {
        this.firstKey -= this.numKeys / 2
      }
    }
  }
  getCoordinates () {
    const coordinates = []
    for (const index in this.channels) {
      const channel = this.channels[index]
      const channelCoordinates = {}
      if (channel.note !== undefined) {
        if (channel.pitchBend) {
          channelCoordinates.x = (channel.note + channel.pitchBend * 23 / 30) - this.firstKey
        } else {
          channelCoordinates.x = channel.note - this.firstKey
        }
        channelCoordinates.y = 125 - channel.posY
        channelCoordinates.size = channel.pressure
        coordinates.push(channelCoordinates)
      }
    }
    return coordinates
  }
}

export default Seaboard
