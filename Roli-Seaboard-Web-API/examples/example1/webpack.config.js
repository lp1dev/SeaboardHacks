const path = require('path')

const configuration = {
    context: path.join(__dirname, '/lib'),
    entry: ['./MIDI.js', './Seaboard.js', '../example1.js'],
    mode: 'development',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'example1.js'
    }
}

module.exports = configuration
