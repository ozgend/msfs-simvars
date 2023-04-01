const { Protocol, SimConnectDataType, SimConnectPeriod, SimObjectType, SimConnectConstants, open: openConnection } = require('node-simconnect');

const boolParser = (val) => {
  return !(val === 0);
}

const secondsToTimestamp = (val) => {
  const hr = Math.floor(val / 3600).toString().padStart(2, '0');
  const mm = Math.floor((val % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(val % 60).toString().padStart(2, '0');
  return `${hr}h ${mm}m ${ss}s`;
};

const percentFloatParser = (val) => {
  return Math.round(val * 100);
}


const UNIT_SYMBOL = {
  'percent': '%',
  'degrees': '*',
  'feet': 'ft',
  'meter': 'm',
  'knots': 'kts',
  'gforce': 'g',
  'gallon': 'gal',
  'pound': 'lbs',
  'kilogram': 'kg',
}

// ref
// https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Simulation_Variables.htm
// https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Simulation_Variable_Units.htm


const SIM_VARS = {
  aircraft: {
    name: 'aircraft',
    eventId: 100,
    vars: [
      { alias: 'sim_time', key: 'SIMULATION TIME', unit: 'seconds', dataType: SimConnectDataType.INT64, tag: SimConnectConstants.UNUSED, valueParser: secondsToTimestamp },
      { alias: 'category', key: 'CATEGORY', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'title', key: 'TITLE', unit: null, dataType: SimConnectDataType.STRING128, tag: SimConnectConstants.UNUSED },
      { alias: 'model', key: 'ATC MODEL', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'type', key: 'ATC TYPE', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'rwy_min_t', key: 'ATC SUGGESTED MIN RWY TAKEOFF', unit: 'meter', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'rwy_min_l', key: 'ATC SUGGESTED MIN RWY LANDING', unit: 'meter', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'flight', key: 'ATC FLIGHT NUMBER', unit: null, dataType: SimConnectDataType.STRING8, tag: SimConnectConstants.UNUSED },
      { alias: 'reg', key: 'ATC ID', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'callsign', key: 'ATC AIRLINE', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
    ]
  },

  avionic: {
    name: 'avionic',
    eventId: 200,
    vars: [
      { alias: 'lat', key: 'PLANE LATITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'lon', key: 'PLANE LONGITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'alt', key: 'PLANE ALTITUDE', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'lat_gps', key: 'GPS POSITION LAT', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'lon_gps', key: 'GPS POSITION LON', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'alt_gps', key: 'GPS POSITION ALT', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'hdg_true', key: 'PLANE HEADING DEGREES TRUE', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'hdg_mag', key: 'PLANE HEADING DEGREES MAGNETIC', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'pitch', key: 'PLANE PITCH DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'bank', key: 'PLANE BANK DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed_gnd', key: 'GROUND VELOCITY', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed_rel', key: 'SURFACE RELATIVE GROUND SPEED', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed_air', key: 'AIRSPEED INDICATED', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed_true', key: 'AIRSPEED TRUE', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'vertical', key: 'VERTICAL SPEED', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'gforce', key: 'G FORCE', unit: 'gforce', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      // { alias: 'alt_ground', key: 'PLANE ALTITUDE ABOVE GROUND', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
    ]
  },

  engine: {
    name: 'engine',
    eventId: 300,
    vars: [
      { alias: 'eng_1_thr', key: 'GENERAL ENG THROTTLE LEVER POSITION:1', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_thr', key: 'GENERAL ENG THROTTLE LEVER POSITION:2', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_thr', key: 'GENERAL ENG THROTTLE LEVER POSITION:3', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_thr', key: 'GENERAL ENG THROTTLE LEVER POSITION:4', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_1_n1', key: 'ENG N1 RPM:1', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_n1', key: 'ENG N1 RPM:2', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_n1', key: 'ENG N1 RPM:3', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_n1', key: 'ENG N1 RPM:4', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_1_n2', key: 'ENG N2 RPM:1', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_n2', key: 'ENG N2 RPM:2', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_n2', key: 'ENG N2 RPM:3', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_n2', key: 'ENG N2 RPM:4', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'fuel', key: 'FUEL TOTAL QUANTITY WEIGHT', unit: 'kilogram', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
    ]
  },

  control: {
    name: 'control',
    eventId: 400,
    vars: [
      { alias: 'brake_skid', key: 'ANTISKID BRAKES ACTIVE', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_auto', key: 'AUTOBRAKES ACTIVE', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_auto_sw', key: 'AUTO BRAKE SWITCH CB', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_pos', key: 'BRAKE INDICATOR', unit: 'position', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_park', key: 'BRAKE PARKING POSITION', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'brake_park_ind', key: 'BRAKE PARKING INDICATOR', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'spoiler_arm', key: 'SPOILERS ARMED', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'spoiler', key: 'SPOILERS HANDLE POSITION', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'flap', key: 'FLAPS HANDLE PERCENT', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'lights', key: 'LIGHT ON STATES', unit: 'mask', dataType: SimConnectDataType.INT64, tag: SimConnectConstants.UNUSED },
      { alias: 'gear_lev', key: 'GEAR HANDLE POSITION', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'gear_ext', key: 'GEAR TOTAL PCT EXTENDED', unit: 'percent', dataType: SimConnectDataType.FLOAT32, tag: SimConnectConstants.UNUSED, valueParser: percentFloatParser },
    ]
  },

  autopilot: {
    name: 'autopilot',
    eventId: 500,
    vars: [
      { alias: 'ap_dis', key: 'AUTOPILOT DISENGAGED', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'ap_on', key: 'AUTOPILOT MASTER', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'fd_on', key: 'AUTOPILOT FLIGHT DIRECTOR ACTIVE', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
    ]
  },

};

module.exports = class SimDataService {
  constructor(context, { host, port, appName, updateFreqSecs }) {
    this.eventNames = Object.keys(SIM_VARS).map(v => `on_sim_data_${v}`);
    this._context = context;
    this._host = host ?? '127.0.0.1';
    this._port = port ?? 500;
    this._appName = appName;
    this._updateFreqSecs = updateFreqSecs ?? 1;
    this._connected = false;
  }

  connect() {
    this._context.logger.info('init sim.connect');

    return openConnection(this._appName, Protocol.KittyHawk, { host: this._host, port: this._port })
      .then(({ recvOpen, handle: simConnection }) => {
        this._connected = true;
        this._simConnection = simConnection;
        this._context.logger.info('connected to sim');
        this._context.logger.info(JSON.stringify(recvOpen, null, 2));

      })
      .catch(err => {
        this._context.logger.error('connection failed:', err);
      });
  }

  requestAircraftData() {
    if (!this._connected) {
      this._context.logger.error('not connected');
      return;
    }

    Object.keys(SIM_VARS).forEach(key => {
      SIM_VARS[key].vars.forEach(v => {
        this._simConnection.addToDataDefinition(SIM_VARS[key].eventId, v.key, v.unit, v.dataType, 0, v.tag);
      });
      this._simConnection.requestDataOnSimObject(SIM_VARS[key].eventId, SIM_VARS[key].eventId, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SECOND, 0, this._updateFreqSecs, 0, 0);
    });


    this._simConnection.on('simObjectData', recvSimObject => {
      const simVars = Object.values(SIM_VARS).find(s => s.eventId === recvSimObject.defineID);

      const data = {
        timestamp: { value: new Date().toISOString().replace('T', ' ').split('Z')[0] },
        setName: { value: simVars.name }
      };

      simVars.vars.forEach(v => {
        const enumIndex = Object.values(SimConnectDataType).indexOf(v.dataType);
        const enumName = Object.keys(SimConnectDataType)[enumIndex];
        const valueReader = `read${enumName[0]}${enumName.slice(1).toLowerCase()}`;
        try {
          const value = recvSimObject.data[valueReader]();
          data[v.alias] = { value: v.valueParser ? v.valueParser(value) : value, unit: v.unit ? UNIT_SYMBOL[v.unit] : '' };
        }
        catch (err) { }
      });

      this._context.eventBus.send(`on_sim_data_${simVars.name.toLocaleLowerCase()}`, data);

    });
  }
}


