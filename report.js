const upnp = require('node-upnp-utils');
const MediaRendererClient = require('upnp-mediarenderer-client');
const fetch = require('node-fetch');
const PORT = process.env.PORT || 5050;
const winston = require('winston');
const cron = require('node-cron');

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
  // .then(r => {
  //   console.log(r);
  //   return r;
  // })
  .then(data => logger.log('debug', `data returned: ${JSON.stringify(data)}`))
  .catch((err) => {
    logger.error('Failed to report data', err)
  });
}

const getDetails = (ip) => {

  return new Promise((res, rej) => {

    try {
      logger.debug(`creating MediaRenderClient for ${ip}`)
      var client = new MediaRendererClient(`http://${ip}:49152/description.xml`);
      logger.debug(`created MediaRenderClient for ${ip}`)
      client.getVolume(function(err, volume) {
        if(err) return rej(err);
        logger.debug('Got volume')
  
        client.getTransportInfo(function(err2, transportInfo) {
          if(err2) return rej(err2);
  
          client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err3, media) {
            if(err3) return rej(err3);
    
            client.callAction(
              "RenderingControl",
              // "urn:upnp-org:serviceId:RenderingControl",
              "GetControlDeviceInfo",
              { InstanceID: 0 },
              function (err4, result) {
                if (err4) return rej(err4);
                const statusText = result.Status
                const status = JSON.parse(statusText)
                // console.log(status)
                // console.log(result); // => { NrTracks: '1', MediaDuration: ... }
                logger.debug('Got device status', {status})
                return res({volume, transportInfo, media, deviceStatus: status })
              }
            );
  
          });
  
        });
  
  
      });
  
    } catch (error) {
      logger.error('Failed to get details', error)
      res()
    }

  })

}

let reports = [];

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
        logger.log('debug', `ssid ${ssid}`);
        // console.log('ssid', ssid);

        const radio_type = ssid.split('_')[0];

        try {
          // const details = await getDetails(ip);

          // const { volume, transportInfo, media } = details;

          // const state = transportInfo.CurrentTransportState;
          // const status = transportInfo.CurrentTransportStatus;
          // const {CurrentURI: uri} = media;

          reports.push({name, radio_type, ip});

        } catch (e) {
          console.error('Error getting details');
        }
        // reportData({name, radio_type, ip, volume, status, state, uri});
        // console.log({name, ip, volume, state, status, uri});
      }
    }
  } catch (err) {
    logger.error(err);
    // console.error('Foo', err);
  }
});


const reportAllData = async () => {
  // console.log('Sending reports', reports.length);
  logger.info(`Sending reports ${reports.length}`)

  let count = 0;
  for (const report of reports) {
    logger.debug(`Reporting data for ${report.ip}`)
    // console.log('Reporting', report);
    try {
      const details = await getDetails(report.ip);

      if (details) {
        const { volume, transportInfo, media, deviceStatus } = details;
  
        const state = transportInfo.CurrentTransportState;
        const status = transportInfo.CurrentTransportStatus;
        const {CurrentURI: uri} = media;
    
        // reports.push({name, radio_type, ip, volume, status, state, uri});
    
        const res = await reportData({...report, volume, status, state, uri, rssi: deviceStatus.RSSI});
        // console.log('Res', res);
        count += 1;  
      } else {
        logger.info(`Failed to get details for ${report.ip}`)
      }
  
    } catch (error) {
      logger.error(`Failed to report for ${report.ip}`)
    }
  }
  // clear out the reports after we sent them.
  reports = [];
  logger.info(`Sent ${count} reports`);
}

const discoveryProcess = () => {

  // Start the discovery process
  try {
    upnp.startDiscovery();
    logger.info('Started discovery');

    // Stop the discovery process in 20 seconds
    setTimeout(() => {
      upnp.stopDiscovery(async () => {
        logger.info('Stopped the discovery process.');

        await reportAllData();


        // process.exit();
      });
    }, 20000);

  } catch (err) {
    console.error('Caught an error');
  }

};

// const schedule = '* * * * *';
const schedule = '0,10,20,30,40,50 * * * *';

cron.schedule(schedule, () => {
  discoveryProcess();
});

// const test = async () => {

//   try {
//     await getDetails('192.168.10.215')
  
//   } catch (err) {
//     console.log('Caught', err)
//   }
  
// }

// test()

// discoveryProcess();

// {"data":{"addRadioReport":{"name":"WEY998","last_reported":"1640952195","last_ip":"10.10.10.11"}}}
