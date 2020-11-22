const dgram = require('dgram');

const search = new Buffer([
    'M-SEARCH * HTTP/1.1',
    'HOST: 239.255.255.250:1900',
    'MAN: "ssdp:discover"',
    'MX: 3',
    'ST: upnp:rootdevice'
].join('\r\n'));

const socket = dgram.createSocket('udp4');
socket.on('listening', () => {
    socket.addMembership('239.255.255.250');
    socket.send(search, 0, search.length, 1900, '239.255.255.250');
});
socket.on('message', (message) => {
    console.log(message.toString());
});
// socket.bind(1900, '192.168.10.92');
socket.bind(1900);
