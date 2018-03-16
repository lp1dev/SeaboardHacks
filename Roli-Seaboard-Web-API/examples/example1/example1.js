import Seaboard from './lib/Seaboard'
import { MIDIController } from './lib/MIDI'

MIDIController
  .getInputsByManufacturer('ROLI Ltd.')
  .then((MIDIInputs) => {
    console.log(MIDIInputs)
    if (!MIDIInputs.length) {
      console.error(`No ROLI device found.<br/>
      Please connect a Seaboard device using USB`)
      return
    }
    MIDIInputs.forEach((MIDIInput) => {
      const seaboard = new Seaboard(MIDIInput)
      seaboard.connect()
        .then(() => {
          seaboard.subscribeToMessages(displayParsedMIDIMessage)
        })
    })
  })
  .catch(error => console.error(error))

const displayParsedMIDIMessage = (message) => {
  document.body.innerHTML += `<pre>${JSON.stringify(message)}</pre>`
}
