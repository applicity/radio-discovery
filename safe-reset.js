const Client = require('upnp-device-client');
const MediaRendererClient = require('upnp-mediarenderer-client');
const argv = require('yargs')
  .demandOption(['ip'])
  .argv;

const ip = argv.ip;

// Instanciate a client with a device description URL (discovered by SSDP)
let mrClient = new MediaRendererClient(`http://${ip}:49152/description.xml`);

// Instanciate a client with a device description URL (discovered by SSDP)
var client = new Client(`http://${ip}:49152/description.xml`);

// Get the device description
// client.getDeviceDescription(function(err, description) {
//   if(err) throw err;
//   console.log(description);
// });


const getVolume = (params) => {
  const { mrClient } = params;
  return new Promise((res, rej) => {
    mrClient.getVolume(function(err, volume) {
      if(err) throw err;
      console.log('volume', volume); // the volume range is 0-100
      res({volume, ...params});
    });
  });
};


const setPresets = (params) => {
  const {client} = params;
  return new Promise((res, rej) => {
    const presets = { QueueContext: '<?xml version="1.0"?>\r\n<KeyList>\r\n<ListName>KeyMappingQueue</ListName>\r\n<MaxNumber>10</MaxNumber>\r\n<Key0></Key0>\r\n<Key1>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key1>\r\n<Key2>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key2>\r\n<Key3>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key3>\r\n<Key4>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key4>\r\n<Key5></Key5>\r\n<Key6></Key6>\r\n<Key7></Key7>\r\n<Key8></Key8>\r\n<Key9></Key9>\r\n<Key10></Key10>\r\n</KeyList>\r\n' };

    client.callAction('urn:wiimu-com:serviceId:PlayQueue', 'SetKeyMapping', presets, function(err, result) {
      if(err) throw err;
      console.log('setPresets', result);
      res({ setPresetResult: result, ...params });
    });

  });
};

const setVolume = (params) => {
  const { mrClient } = params;
  const { volume } = params;

  return new Promise((res, rej) => {
    mrClient.setVolume(volume, function(err) {
      if(err) return rej(err);
      res(params);
    });
  });
};

const muteVolume = (params) => {
  const { mrClient } = params;

  return new Promise((res, rej) => {
    mrClient.setVolume(0, function(err) {
      if(err) return rej(err);
      res(params);
    });
  });
};

const pause = (timeout) => {
  return (params) => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(params);
      }, timeout);
    });
  }
}

getVolume({client, mrClient})
.then(muteVolume)
.then(setPresets)
.then(pause(1500))
.then(setVolume);
