const APP_NAME = 'RVL msfs-vars';
const PORT = 3000;

const express = require('express');
const ws = require('ws');

const Log = require('./log');
const EventBus = require('./event-bus');
const SimDataService = require('./sim-data-service');

const context = {
  logger: new Log(APP_NAME).logger,
  eventBus: new EventBus()
};

const app = express();
const wsServer = new ws.Server({ noServer: true });


const simDataService = new SimDataService(context, { host: '127.0.0.1', port: 500, appName: APP_NAME, updateFreqSecs: 1 });

console.log(simDataService.eventNames);

simDataService.connect()
  .then(() => {
    simDataService.requestAircraftData();
  });

simDataService.eventNames.forEach(setName => {
  context.eventBus.addListener(setName, (data) => {
    // console.log(`received event ${setName}`);
    wsServer.clients.forEach(socket => {
      socket.send(JSON.stringify(data));
    });
  })
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(200);
});

wsServer.on('connection', socket => {
  console.log('connected');

  socket.on('close', () => {
    console.log('disconnected');
  });
});

const server = app.listen(PORT, () => {
  console.log(`running ${APP_NAME} @ http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});