const argv = require('yargs')
  .demandOption(['ip'])
  .argv;
var MediaRendererClient = require('upnp-mediarenderer-client');


const ip = argv.ip;

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);

// Unpause
client.stop();

