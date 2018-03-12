import MIDIController from '@/utils/MIDI'

class Seaboard {
  constructor (MIDIPort) {
    this.MIDIPort = MIDIPort
    this.channels = {}
  }
  connect () {
    return new Promise((resolve, reject) => {
      this.MIDIPort
        .open()
        .then(MIDIPort => {
          MIDIPort.onmidimessage = message => this.onMessage(message)
        })
        .catch(error => reject(error))
    })
  }
  onMessage (message) {
    const parsedMessage = MIDIController.parseMessage(message.data)
    if (parsedMessage.type === 'Note ON') {
      this.channels[parsedMessage.channel] = this.channels[parsedMessage.channel] || {posY: 0}
      this.channels[parsedMessage.channel]['note'] = parsedMessage.note
    } else if (parsedMessage.type === 'Note OFF') {
      this.channels[parsedMessage.channel] = {posY: 0}
    } else if (parsedMessage.pressure) {
      this.channels[parsedMessage.channel]['pressure'] = parsedMessage.pressure
    } else if (parsedMessage.controlChange) {
      this.channels[parsedMessage.channel] = this.channels[parsedMessage.channel] || {posY: 0}
      if (this.channels[parsedMessage.channel]['note'] !== undefined) {
        this.channels[parsedMessage.channel]['posY'] = parsedMessage.controlChange
      }
    } else if (parsedMessage.pitchBend) {
      this.channels[parsedMessage.channel]['pitchBend'] = parsedMessage.pitchBend
    }
    if (typeof this.afterChannelUpdate === 'function') {
      this.afterChannelUpdate(this.channels)
    }
  }
  getCoordinates () {
    const coordinates = []
    for (const index in this.channels) {
      const channel = this.channels[index]
      const channelCoordinates = {}
      if (channel.note !== undefined) {
        if (channel.pitchBend) {
          channelCoordinates.x = channel.note + (channel.pitchBend === -1 ? 0 : channel.pitchBend * 23 / 30)
        } else {
          channelCoordinates.x = channel.note
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
