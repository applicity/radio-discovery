var Client = require("upnp-device-client");
const fs = require("fs");
const argv = require("yargs")
  .option("ip", { describe: "The ip address of the radio" })
  .option("tibo", { describe: "Settings for Tibo radio" })
  .boolean("tibo")
  .default("tibo", false)
  .demandOption(["ip"]).argv;

const ip = argv.ip;

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

const xml = fs.readFileSync(`./saved/${argv.tibo ? "tibo" : "radiowey3"}`);

// Call GetMediaInfo on the AVTransport service
const params = {
  //xml,
  QueueContext: xml,
  //    '<?xml version="1.0"?>\r\n<KeyList>\r\n<ListName>KeyMappingQueue</ListName>\r\n<MaxNumber>10</MaxNumber>\r\n<Key0></Key0>\r\n<Key1>\r\n<Name>Radio Wey</Name>\r\n<Url>http://stream.radiowey.co.uk:8000/radiowey128</Url>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key1>\r\n<Key2>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key2>\r\n<Key3>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key3>\r\n<Key4>\r\n<Name>Radio Wey</Name>\r\n<PicUrl>http://cdn-profiles.tunein.com/s107544/images/logog.png</PicUrl>\r\n</Key4>\r\n<Key5></Key5>\r\n<Key6></Key6>\r\n<Key7></Key7>\r\n<Key8></Key8>\r\n<Key9></Key9>\r\n<Key10></Key10>\r\n</KeyList>\r\n',
};

client.callAction(
  "urn:wiimu-com:serviceId:PlayQueue",
  "SetKeyMapping",
  params,
  function (err, result) {
    if (err) throw err;
    console.log(result); // => { NrTracks: '1', MediaDuration: ... }
  }
);
