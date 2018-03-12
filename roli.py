#!/bin/env python
import usb.core
import usb.util

# find our device
#dev = usb.core.find(idVendor=0x2af4, idProduct=0x0700)

# was it found?
#if dev is None:
#    raise ValueError('Device not found')
#else:
#    print('Roli Seaboard found')

AUDIO_DEVICE_CLASS=1
READ_SIZE=512

device = usb.core.find(idVendor=0x2af4)
if device:
    for index, configuration in enumerate(device):
        print("Configuration %i" %index, configuration)
        for interface in configuration[(0,0)]:
            print(interface)
#    device.set_configuration(1)
#    print(device.read(0x1, READ_SIZE))
else:
    raise Exception('Roli device not found')
