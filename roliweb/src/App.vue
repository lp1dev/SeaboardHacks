<template>
  <div id="app">
    <h1>Seaboard Hacks</h1><br/>
    <div v-if="seaboardInputs.length && !seaboard">
      <h3>Choose your Seaboard the list</h3>
      <select v-model="selected">
        <option disabled value="">Choose</option>
        <option
        v-for="(seaboardInput, index) in seaboardInputs"
        :key="index">
          {{seaboardInput.name}}
        </option>
      </select>
      <button v-if="selected" @click="connect">Connect</button>
    </div>
    <div v-if="!seaboardInputs.length">
      No Seaboard found, please check the connection and hit <button @click="loadSeaboardInputs">Reload</button>
    </div><br/>
    <div id="hacks" v-if="seaboard">
      <h2>Visualizer</h2>
      <vizualiser :seaboard="seaboard"/>
      <h2>Synthetizers</h2>
      <synthetizers :seaboard="seaboard"/>
    </div>
  </div>
</template>

<script>
import { MIDIController } from "@/utils/MIDI"
import Seaboard from "@/utils/Seaboard"
import Vizualiser from '@/components/Visualizer'
import Synthetizers from '@/components/Synthetizers'

export default {
  name: "App",
  components: { Vizualiser, Synthetizers },
  data() {
    return {
      seaboardInputs: [],
      selected: null,
      seaboard: null
    };
  },
  created() {
    this.loadSeaboardInputs();
  },
  methods: {
    loadSeaboardInputs() {
      MIDIController.getInputsByManufacturer("ROLI Ltd.").then(inputs => {
        this.seaboardInputs = inputs;
      });
    },
    connect() {
      const MIDIPort = this.seaboardInputs
        .filter(input => input.name === this.selected)
      this.seaboard = new Seaboard(MIDIPort[0])
      this.seaboard
        .connect()
        .then(MIDIPort => console.log(MIDIPort))
        .catch(error => console.error(error))
    }
  }
};
</script>

<style>
body {
  background-color:rgb(17, 17, 17);
  color: #e2e2e2;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
