var Client = require("upnp-device-client");

const argv = require("yargs").demandOption(["ip"]).argv;

const ip = argv.ip;

// var ip = '192.168.10.79';

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new Client(`http://${ip}:49152/description.xml`);

// Get the device description
client.getDeviceDescription(function (err, description) {
  if (err) throw err;
  console.log(description);
});

// // Get the device's AVTransport service description
// client.getServiceDescription('AVTransport', function(err, description) {
//   if(err) throw err;
//   console.log(description);
// });

// Call GetMediaInfo on the AVTransport service
client.callAction(
  "urn:wiimu-com:serviceId:PlayQueue",
  "GetKeyMapping",
  false,
  function (err, result) {
    if (err) throw err;
    console.log(result); // => { NrTracks: '1', MediaDuration: ... }
  }
);
