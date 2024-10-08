const argv = require('yargs')
  .demandOption(['ip'])
  .argv;
var MediaRendererClient = require('upnp-mediarenderer-client');


const ip = argv.ip;

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);

client.getVolume(function(err, volume) {
  if(err) throw err;
  console.log(volume); // the volume range is 0-100
});

