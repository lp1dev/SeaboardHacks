### 1 - MIDI or MIDI + other USB data

Investigating with Wireshark on Linux + USB Passthrough on a Windows VM.
There is a transit of what seems to be "regular" MIDI inputs.

After searching a bit, it seems to be full MIDI \o/ :
      https://support.roli.com/article/controlling-your-instrument-with-the-seaboard/

### 2 - Understanding the midi input

I'm using Google Chrome's MIDI API to make a web hack for the roli,
Upon connection opening (MIDIPort.open()), I successfully get MIDI messages.

I get "Note ON" and "Note OFF" messages. Which allows me to implement the first touch detection.

