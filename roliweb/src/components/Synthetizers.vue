<template>
  <div>
    <h2>Select your synthetizer</h2>
    <div>
      <select v-model="selected" @input="onSelection($event.target.value)">
       <option disabled value="">Choose</option>
       <option v-for="synth in synthetizers" :key="synth.name" selected> {{ synth.name }}</option>
      </select>
    </div>
    Octave : {{ seaboard.firstKey / seaboard.numKeys }}<br/>
    <synth-graph v-if="synthetizer" :synth="synthetizer"/>
    <!-- <pre>{{ JSON.stringify(message) }}</pre> -->
  </div>
</template>

<script>
import SynthGraph from '@/components/SynthGraph'
import synthetizers from '@/utils/Synthetizers'

export default {
  name: 'Synthetizers',
  components: { SynthGraph },
  props: {'seaboard': {required: true}},
  data () {
    return {
      message: '',
      synthetizers: synthetizers,
      selected: '',
      synthetizer: null
    }
  },
  created () {
    this.seaboard.subscribeToMessages(message => {
      if (this.synthetizer) {
        this.synthetizer.handleMessage(message)
      }
      this.message = message
    })
  },
  methods: {
    onSelection (name) {
      console.log('Synthetizers :: selected', name)
      synthetizers.forEach(synthetizer => {
        if (synthetizer.name === name) {
          this.synthetizer = synthetizer
          console.log(synthetizer)
        }
      })
    }
  }
}
</script>

<style>

</style>
