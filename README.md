=RadioWey - Radio Discovery

This repository contains the files used for discovering the radios on the 
hospital network.

The process is run and managed using pm2.

It runs with a node-cron configration which causes a collection to be run 
on a scheduled basis (every 10 mins).

You can start the collection process with the following command.

```
npm run pm2
```

To check the status of the service look as the pm2 list

```
pm2 ls
```

which will give you output like this:

```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 5  │ graphql_server     │ fork     │ 107  │ online    │ 0%       │ 39.1mb   │
│ 4  │ scan               │ fork     │ 724  │ online    │ 0%       │ 71.8mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

This process is regsitered as the "scan" process

You can check the output of the logs for the scan process with 

```
pm2 logs scan
```

You can also see a summary of the processing in the file report.log in this directory

```
tail -6 report.log
```

which should show you something like this:

```
2024-09-28T17:50:00.067Z info: Started discovery -
2024-09-28T17:50:20.068Z info: Stopped the discovery process. -
2024-09-28T17:50:35.893Z info: Sent 61 reports -
2024-09-28T18:00:00.257Z info: Started discovery -
2024-09-28T18:00:20.259Z info: Stopped the discovery process. -
2024-09-28T18:00:43.001Z info: Sent 61 reports -
```

Which shows that we are sending reports to the datastore.

== Other functions

This directory also contains some useful functions for managing radio state.

=== Manual discover

```
node discover.js
```

This runs the discovery process and will dump out the responses from the discovery without looking up details

=== Radio status
```
node get-status.js --ip x.x.x.x
```

Will get the current status from the radio (use the ips from the discover process)

For example: 

```
[root@dcall scan]# node get-status.js --ip 192.168.13.108
{ CurrentTransportState: 'PLAYING',
  CurrentTransportStatus: 'OK',
  CurrentSpeed: '1' }
```

=== Get volume

Get volume - shows the current volume that the radio is set at

```
[root@dcall scan]# node get-volume.js --ip 192.168.13.108
45
```

=== Get detail

Returns the full details of the status of the radio

For example

```
[root@dcall scan]# node get-detail.js --ip 192.168.13.108
{ volume: 45,
  transportInfo:
   { CurrentTransportState: 'PLAYING',
     CurrentTransportStatus: 'OK',
     CurrentSpeed: '1' },
  media:
   { NrTracks: '1',
     MediaDuration: '00:00:00',
     CurrentURI: 'http://stream.radiowey.co.uk:8000/radiowey128',
     CurrentURIMetaData: '<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:song="www.wiimu.com/song/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"> <upnp:class>object.item.audioItem.musicTrack</upnp:class> <item> <res protocolInfo="http-get:*:audio/mpeg:DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;" duration="1000">http://stream.radiowey.co.uk:8000/radiowey128</res><dc:title>Radio Wey</dc:title> <upnp:artist>TuneIn</upnp:artist> <upnp:album></upnp:album> <upnp:albumArtURI>http://cdn-profiles.tunein.com/s107544/images/logoq.png</upnp:albumArtURI> </item> </DIDL-Lite> ',
     NextURI: '',
     NextURIMetaData: '',
     TrackSource: 'TuneIn',
     PlayMedium: 'RADIO-NETWORK',
     RecordMedium: 'NOT_IMPLEMENTED',
     WriteStatus: 'NOT_IMPLEMENTED' },
  ip: '192.168.13.108' }
```


=== Play

Make a radio play the radio wey stream

```
node play.js --ip 192.168.13.108
```


=== Stop

Stop a radio from playing


```
node stop.js --ip x.x.x.x
```

=== Set presets

Load the presets on the radio to be all radiowey

```
node set-presets.js --ip x.x.x.x
```

=== Set volume

Set the volume of the radio

```
node set-volume.js --ip x.x.x.x --vol 50
```

The volume is a number between 0 and 100, with 100 being very loud.

=== List Presets

```
node list-preset.js --ip x.x.x.x
```

Shows an XML dump of the presets currently loaded in the radio


== Important

For any of the above to work the network configuation needs to have a route
correctly set to send data to the hospital network to see the radios.

```
route add 239.255.255.250 gw 192.168.0.4
```
