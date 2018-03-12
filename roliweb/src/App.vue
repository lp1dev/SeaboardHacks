<template>
  <div id="app">
    <h1>Seaboard Hacks - Vizualiser</h1><br/>
    <div v-if="seaboardInputs.length && !seaboard">
      <select v-model="chosenInput">
        <option
        v-for="(seaboardInput, index) in seaboardInputs"
        :selected="!index ? 'selected' : ''"
        :key="index">
          {{seaboardInput.name}}
        </option>
      </select>
      <button @click="connect">Connect</button>
    </div>
    <div v-if="!seaboardInputs.length">
      No Seaboard found, please check the connection and hit <button @click="loadSeaboardInputs">Reload</button>
    </div><br/>

    <!-- The notes go from 0 to 23 and the y position from 0 to 128. I chose a 23 * 50 (1150) and 128 * 2 (256) ratio -->
    <!-- The pitchbend goes from -30 to 30, there is max 23 notes. That's why the 23/30 ratio is used on the pitchbend -->
    <vizualiser v-if="seaboard" :seaboard="seaboard"/>
    <!-- <pre v-if="seaboard">{{seaboard.channels}}</pre>     -->
  </div>
</template>

<script>
import MIDIController from "@/utils/MIDI";
import Seaboard from "@/utils/Seaboard";
import Vizualiser from '@/components/Visualizer.vue'

export default {
  name: "App",
  components: { Vizualiser },
  data() {
    return {
      seaboardInputs: [],
      chosenInput: null,
      seaboard: null
    };
  },
  created() {
    this.loadSeaboardInputs();
  },
  methods: {
    loadSeaboardInputs() {
      MIDIController.getInputsByManufacturer("ROLI Ltd.").then(inputs => {
        console.log("ROLI Inputs", inputs);
        this.seaboardInputs = inputs;
      });
    },
    connect() {
      const MIDIPort = this.seaboardInputs.filter(
        input => input.name === this.chosenInput
      );
      this.seaboard = new Seaboard(MIDIPort[0]);
      this.seaboard
        .connect()
        .then(MIDIPort => console.log(MIDIPort))
        .catch(error => console.error(error));
    }
  }
};
</script>

<style>
body {
  background-color:rgb(17, 17, 17);
  color: #e2e2e2;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#message {
  height: 20vh;
}
</style>
