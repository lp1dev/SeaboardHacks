import { Synthetizer } from './MIDI'

const synthetizers = [
  new Synthetizer('Synthetizer 1 (Classic Sine)'),
  new Synthetizer('Synthetizer 2 (Classic Square)', {fadeTime: 0.2, type: 'square'}),
  new Synthetizer('Synthetizer 3 (Classic Sawtooth)', {fadeTime: 0.2, type: 'sawtooth'}),
  new Synthetizer('Synthetizer 4 (Classic Triangle)', {fadeTime: 0.2, type: 'triangle'})
]

export default synthetizers
