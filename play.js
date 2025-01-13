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
  // 'upnp:albumArtURI': 'http://cdn-profiles.tunein.com/s107544/images/logog.png?t=636426232223100000',
  // 'dc:subtitle': 'AUTO Working with your hospital and community',

  metadata: {
    dc: {
      // subtitle: 'Foo bar',
      'title': 'SAM Radio Wey Automatic',
      'subtitle': 'SAM Working with your hospital and community',
    },
    upnp: {
      'albumArtURI': 'http://cdn-profiles.tunein.com/s107544/images/logog.png?t=636426232223100000',
      class: 'object.item.audioItem.musicTrack',
      mediatype: 'mp3',
    },
    song: {
      isLive: 1,
      canPlay: 1,
      id: 's107544',
      singerid: '0',
      albumid: '0',
    },
    // 'upnp:albumArtURI': 'http://cdn-profiles.tunein.com/s107544/images/logog.png?t=636426232223100000',
    // creator: 'Radio Wey',
    // 'song:isLive': '1',
    // type: 'object.item.audioItem.musicTrack',
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

