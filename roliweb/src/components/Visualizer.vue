<template>
  <svg v-if="seaboard"
      width="1150"
      height="256"
      viewPort="0 0 1150 256"
      >
      <rect 
      width="100%" 
      height="100%" 
      fill="black" 
      rx="10" 
      ry="10"
      stroke-width="1"
      stroke="white"
      />
      <line v-for="n in 24"
        :key="n+'-keyline'" 
        :x1="n * (1150 / 23)" y1="20"
        :x2="n * (1150 / 23)" y2="220"
        stroke="rgba(255, 255, 255, 0.3)"
        stroke-width="1"/>
      <line 
        v-for="id in [1,3,6,8,10,13,15,18,20,22]" 
        :key="id+'-black-keyline'"
        :x1="id * (1150 / 23)" y1="20"
        :x2="id * (1150 / 23)" y2="120"
        stroke="rgba(255, 255, 255, 0.7)"
        stroke-width="2"/>
      <circle 
        v-for="(coordinates, index) in seaboard.getCoordinates()"
        :key="index"
        :cx="coordinates.x * 50"
        :cy="coordinates.y * 2"
        stroke-width="1"
        stroke="white"
        :fill="`rgb(0, 20, ${coordinates.size})`"
        :r="coordinates.size"/>
    </svg>
</template>

<script>
export default {
  name: 'Visualizer',
  props: { 'seaboard': {required: true} },
  created () {
    console.log('Visualizer :: seaboard', this.seaboard)
    this.seaboard.subscribeToMessages(channels => {
      this.$forceUpdate()
    })
  }
}
</script>

<style>

</style>
