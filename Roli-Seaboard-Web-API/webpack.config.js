const path = require('path')

const configuration = {
  context: path.join(__dirname, '/js'),
  entry: ['./MIDI.js', './Seaboard.js'],
  mode: 'development',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'SeaboardAPI.js'
  }
}

module.exports = configuration
