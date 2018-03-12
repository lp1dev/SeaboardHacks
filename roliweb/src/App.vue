<template>
  <div id="app">
    Seaboard Hacks<br/>
    <div v-if="seaboardInputs.length">
      <select v-model="chosenInput">
        <option
        v-for="(seaboardInput, index) in seaboardInputs" 
        :key="index">
          {{seaboardInput.name}}
        </option>
      </select>
      <button @click="connect">Connect</button>      
    </div>
    <div v-else>
      No Seaboard found, please check the connection and hit <button @click="loadSeaboardInputs">Reload</button>
    </div>

    <!-- The notes go from 0 to 23 and the y position from 0 to 128. I chose a 23 * 50 (1150) and 128 * 2 (256) ratio -->
    <!-- The pitchbend goes from -30 to 30, there is max 23 notes. That's why the 23/30 ratio is used on the pitchbend -->
    <svg v-if="seaboard"
      width="1150"
      height="256"
      viewPort="0 0 1150 256"
      >
      <rect width="100%" height="100%" fill="blue"></rect>
        <circle 
        v-for="(coordinates, index) in seaboard.getCoordinates()"
        :key="index"
        :cx="coordinates.x * 50"
        :cy="coordinates.y * 2"
        :stroke="`rgb(${coordinates.size}, 50, 50)`" 
        :fill="`rgb(${coordinates.size}, 50, 50)`"
        :r="coordinates.size"/>
    </svg>
    <pre v-if="seaboard">{{seaboard.channels}}</pre>    
  </div>
</template>

<script>
import MIDIController from '@/utils/MIDI'
import Seaboard from '@/utils/Seaboard'

export default {
  name: 'App',
  data () {
    return {
      seaboardInputs: [],
      chosenInput: null,
      seaboard: null
    }
  },
  created () {
    this.loadSeaboardInputs()
  },
  methods: {
    loadSeaboardInputs () {
      MIDIController
      .getInputsByManufacturer('ROLI Ltd.')
      .then((inputs) => {
        console.log('ROLI Inputs', inputs)
        this.seaboardInputs = inputs
      })
    },
    connect () {
      const MIDIPort = this.seaboardInputs.filter(input => input.name === this.chosenInput)
      this.seaboard = new Seaboard(MIDIPort[0])
      this.seaboard
      .connect()
      .then(MIDIPort => console.log(MIDIPort))
      .catch(error => console.error(error))
      this.seaboard.afterChannelUpdate = (channels) => {
        console.log(channels)
        this.channels = channels
        this.$forceUpdate()
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#message {
  height: 20vh;
}
</style>
