<template>
  <div>
    <h2>Select your synthetizer</h2>
    <div>
      <select v-model="selected" @input="onSelection($event.target.value)">
       <option disabled value="">Choose</option>
       <option v-for="synth in synthetizers" :key="synth.name" selected> {{ synth.name }}</option>
      </select>
    </div>
    Octave : {{ seaboard.firstKey / seaboard.numKeys }}
    <pre>{{ JSON.stringify(message) }}</pre>
  </div>
</template>

<script>
import synthetizers from '@/utils/Synthetizers.js'

export default {
  name: 'Synthetizers',
  props: {'seaboard': {required: true}},
  data () {
    return {
      message: '',
      synthetizers: synthetizers,
      selected: ''
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
        }
      })
    }
  }
}
</script>

<style>

</style>
