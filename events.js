var Client = require('upnp-device-client');

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new Client('http://192.168.10.66:49152/description.xml');

// Get the device description
client.getDeviceDescription(function(err, description) {
  if(err) throw err;
  console.log(description);
});

// Get the device's AVTransport service description
client.getServiceDescription('AVTransport', function(err, description) {
  if(err) throw err;
  console.log(description);
});

// Call GetMediaInfo on the AVTransport service
client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
  if(err) throw err;
  console.log(result); // => { NrTracks: '1', MediaDuration: ... }
});

client.subscribe('AVTransport', function(e) {
  // Will receive events like { InstanceID: 0, TransportState: 'PLAYING' } when playing media
  console.log(e);
});

