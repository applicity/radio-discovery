const argv = require('yargs')
  .demandOption(['ip'])
  .demandOption(['vol'])
  .argv;
var MediaRendererClient = require('upnp-mediarenderer-client');


const ip = argv.ip;

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);

client.setVolume(argv.vol, function(err) {
  if(err) throw err;
  console.log('OK');
//  console.log(volume); // the volume range is 0-100
});

