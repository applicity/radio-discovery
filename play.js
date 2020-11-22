const argv = require('yargs')
  .demandOption(['ip'])
  .argv;
var MediaRendererClient = require('upnp-mediarenderer-client');


const ip = argv.ip;

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);

// Load a stream with subtitles and play it immediately
var options = {
  autoplay: true,
  contentType: 'audio/mpeg',

  metadata: {
    title: 'Radio Wey Automatic',
    subtitle: 'Working with your hospital and community',
    creator: 'Radio Wey',
    type: 'object.item.audioItem.musicTrack',
    protocolInfo: 'http-get:*:audio/mpeg:DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;',
    // type: 'audio', // can be 'video', 'audio' or 'image'
    // subtitlesUrl: 'http://url.to.some/subtitles.srt'
  }
};

client.load('http://stream.radiowey.co.uk:8000/radiowey128', options, function(err, result) {
  if(err) throw err;
  console.log('playing ...');
});

// Unpause
// client.play();

