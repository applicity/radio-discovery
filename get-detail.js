const argv = require('yargs')
  .demandOption(['ip'])
  .argv;
var MediaRendererClient = require('upnp-mediarenderer-client');


const ip = argv.ip;


const getDetails = (ip) => {

  return new Promise((res, rej) => {

    var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);
    client.getVolume(function(err, volume) {
      if(err) return rej(err);

      client.getTransportInfo(function(err2, transportInfo) {
        if(err2) return rej(err2);

        client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err3, media) {
          if(err3) return rej(err3);
          return res({volume, transportInfo, media })
        });

      });


    });

  })

}

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);


const main =  async () => {
  const details = await getDetails(ip);
  details.ip = ip;
  console.log(details);
};

main();

