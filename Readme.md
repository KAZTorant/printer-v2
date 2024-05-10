if you use usb as an adapter :

On Linux, you'll need libudev to build libusb.
On Ubuntu/Debian: sudo apt-get install build-essential libudev-dev.
On Windows, Use Zadig to install the WinUSB driver for your USB device.
Otherwise you will get LIBUSB_ERROR_NOT_SUPPORTED when attempting to open devices.

