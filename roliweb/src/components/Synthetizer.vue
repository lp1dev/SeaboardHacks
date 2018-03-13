<template>
  <div>
    Synthetizer 1
  </div>
</template>

<script>
import { MIDIController } from '@/utils/MIDI'

export default {
  name: 'Synthetizer',
  props: {'seaboard': {required: true}},
  data () {
    return {
      oscillators: {},
      gainNodes: {}
    }
  },
  created () {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.seaboard.subscribeToMessages(message => {
      // console.log('Synthetizer :: message', message)
      if (message.type === 'Note ON') {
        if (!this.oscillators[message.channel]) {
          this.initOscillator(message.note, message.channel)
        }
        this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(message.note)
      } else if (message.type === 'Note OFF') {
        this.gainNodes[message.channel].gain.setTargetAtTime(0, this.audioContext.currentTime, 0.2)
      } else if (message.type === 'Channel Pressure (After-touch)') {
        this.gainNodes[message.channel].gain.setTargetAtTime(message.pressure / 100, this.audioContext.currentTime, 0.2)
      } else if (message.type === 'Pitch Bend Change') {
        const noteModulation =  this.seaboard.channels[message.channel].note  + message.pitchBend
        if (!isNaN(noteModulation)) {
          this.oscillators[message.channel].frequency.value = MIDIController.noteToFrequency(noteModulation)
        }
      }
    })
  },
  methods: {
    initOscillator (note, channel) {
      const frequency = MIDIController.noteToFrequency(note)
      let gainNode = this.gainNodes[channel]
      let oscillator = this.oscillators[channel]
      if (!gainNode) {
        gainNode = this.audioContext.createGain()
        console.log('Synthetizer :: gainNode instanciated on channel', channel, gainNode)        
        this.gainNodes[channel] = gainNode
        gainNode.gain.value = 0
        gainNode.connect(this.audioContext.destination)
      }
      if (!oscillator) {
        console.log('Synthetizer :: Oscillator instanciated on channel', channel)
        oscillator = this.audioContext.createOscillator()
        this.oscillators[channel] = oscillator
        oscillator.connect(gainNode)
      }
      oscillator.frequency.value = frequency
      oscillator.start()
    }
  }
}
</script>

<style>

</style>
