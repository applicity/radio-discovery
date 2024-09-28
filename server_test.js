const upnp = require('node-upnp-utils');
const MediaRendererClient = require('upnp-mediarenderer-client');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 5050;

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    winston.format.errors({ stack: true }), // log the full stack
    timestamp(), // get the time stamp part of the full log message
    printf(({ level, message, timestamp, stack }) => { // formating the log outcome to show/store
      return `${timestamp} ${level}: ${message} - ${stack || ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'report.log' })
  ]
});

const reportData = (variables) => {
  // console.log('Report data', variables);
  const query = `mutation AddRadioReport($report: RadioReportInput) {
    addRadioReport(report: $report) {
      name, last_reported, last_ip
    }
  }`;
  fetch(`http://localhost:${PORT}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { report: variables },
    })
  })
  .then(r => r.json())
  .then(r => {
    console.log(r);
    return r;
  })
  .then(data => logger.log('debug', `data returned: ${JSON.stringify(data)}`));
}

const getDetails = (ip) => {

  var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);

  return new Promise((res, rej) => {

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

const reports = [];

// Set an event listener for 'added' event
upnp.on('added', async (device) => {
  try {

  // Some devices don't have the complete description
  if (device && device.description && device.description.device) {

    logger.log('debug', `Considering ${device.address} - ${device.description.device.manufacturer}`)
    // console.log(device['address'], device.description.device.manufacturer);

    if(['wiimu'].includes(device.description.device.manufacturer)) {
      const name = device['description']['device']['friendlyName'];
      const ip = device.address;
      // console.log('Device description', device.description);

      const ssid = device.description.device.ssidName;
      console.log('ssid', ssid);

      const radio_type = ssid.split('_')[0];

      try {
        const details = await getDetails(ip);

        const { volume, transportInfo, media } = details;

        const state = transportInfo.CurrentTransportState;
        const status = transportInfo.CurrentTransportStatus;
        const {CurrentURI: uri} = media;

        reports.push({name, radio_type, ip, volume, status, state, uri});

      } catch (e) {
        console.error('Error getting details');
      }
      // reportData({name, radio_type, ip, volume, status, state, uri});
      // console.log({name, ip, volume, state, status, uri});
    }
  }
} catch (err) {
  console.error('Foo', err);
}
});


const testData = { name: 'Test data', radio_type: 'test', ip: '99.99.99.99', volume: 50, status: 'Testing', state: 'Test', uri: 'www.example.com'};

let i = 0;
for (let i = 0; i < 1000; i++) {
  reports.push(testData);
}



const reportAllData = async () => {
  console.log('Sending reports', reports.length);

  let count = 0;
  reports.forEach(async (report) => {
    const res = await reportData(report);
    console.log('Res', res);
    count += 1;
  })
  console.log('Send', count, 'reports')
}


// // Start the discovery process
// upnp.startDiscovery();
// logger.info('Started discovery');

// // Stop the discovery process in 15 seconds
// setTimeout(() => {
//   upnp.stopDiscovery(async () => {
//     logger.info('Stopped the discovery process.');

//     await reportAllData();


//     process.exit();
//   });
// }, 20000);



const test = async () => {
  await reportAllData();
}
test();
// {"data":{"addRadioReport":{"name":"WEY998","last_reported":"1640952195","last_ip":"10.10.10.11"}}}
