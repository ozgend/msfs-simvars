const APP_NAME = 'RVL msfs-vars';

const Log = require('./log');
const EventBus = require('./event-bus');
const SimDataService = require('./sim-data-service');

const _context = {
  logger: new Log(APP_NAME).logger,
  eventBus: new EventBus()
};


const onAircraftData = (data) => {
  console.clear();
  console.table(data);
};

_context.eventBus.listen('ON_SIM_AIRCRAFT_DATA').addHandler('ON_SIM_AIRCRAFT_DATA', 'e_a0', onAircraftData);

const _simDataService = new SimDataService(_context, { host: '127.0.0.1', port: 500, appName: APP_NAME, updateFreqSecs: 1 })

_simDataService.connect()
  .then(() => {
    _simDataService.requestAircraftData();
  });

