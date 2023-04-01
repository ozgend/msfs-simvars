const { Protocol, SimConnectDataType, SimConnectPeriod, SimObjectType, SimConnectConstants, open: openConnection } = require('node-simconnect');

const boolParser = (val) => {
  return !(val === 0);
}

// https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Simulation_Variables.htm

const SIM_VARS = {
  aircraft: {
    eventId: 100,
    vars: [
      { alias: 'atcId', key: 'ATC ID', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'category', key: 'CATEGORY', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
      { alias: 'title', key: 'TITLE', unit: null, dataType: SimConnectDataType.STRING128, tag: SimConnectConstants.UNUSED },
    ]
  },

  avionics: {
    eventId: 200,
    vars: [
      { alias: 'lat', key: 'PLANE LATITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'lon', key: 'PLANE LONGITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      { alias: 'heading_true', key: 'PLANE HEADING DEGREES TRUE', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'heading_mag', key: 'PLANE HEADING DEGREES MAGNETIC', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'pitch', key: 'PLANE PITCH DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'bank', key: 'PLANE BANK DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'alt_sea', key: 'PLANE ALTITUDE', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'alt_ground', key: 'PLANE ALTITUDE ABOVE GROUND', unit: 'feet', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed', key: 'GROUND VELOCITY', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'speed_ground', key: 'SURFACE RELATIVE GROUND SPEED', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'airspeed', key: 'AIRSPEED INDICATED', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'airspeed_true', key: 'AIRSPEED TRUE', unit: 'knots', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'gforce', key: 'G FORCE', unit: 'gforce', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      // { alias: 'vertical', key: 'VERTICAL SPEED', unit: 'feet per second', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      // { alias: 'gps_alt', key: 'GPS POSITION ALT', unit: 'meters', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      // { alias: 'gps_lat', key: 'GPS POSITION LAT', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
      // { alias: 'gps_lon', key: 'GPS POSITION LON', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
    ]
  },

  engine: {
    eventId: 300,
    vars: [
      { alias: 'eng_1_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:1', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:2', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:3', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:4', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_1_rpm_n1', key: 'ENG N1 RPM:1', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_rpm_n1', key: 'ENG N1 RPM:2', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_rpm_n1', key: 'ENG N1 RPM:3', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_rpm_n1', key: 'ENG N1 RPM:4', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_1_rpm_n2', key: 'ENG N2 RPM:1', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_2_rpm_n2', key: 'ENG N2 RPM:2', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_3_rpm_n2', key: 'ENG N2 RPM:3', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'eng_4_rpm_n2', key: 'ENG N2 RPM:4', unit: 'percentage', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
    ]
  },

  controls: {
    eventId: 400,
    vars: [
      { alias: 'brake_anti_skid', key: 'ANTISKID BRAKES ACTIVE', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'breake_auto', key: 'AUTOBRAKES ACTIVE', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_auto_sw', key: 'AUTO BRAKE SWITCH CB', unit: 'number', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_pos', key: 'BRAKE INDICATOR', unit: 'position', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'brake_park_pos', key: 'BRAKE PARKING POSITION', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'brake_park_ind', key: 'BRAKE PARKING INDICATOR', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'spoiler_armed', key: 'SPOILERS ARMED', unit: null, dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED, valueParser: boolParser },
      { alias: 'spoiler', key: 'SPOILERS HANDLE POSITION', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
      { alias: 'flap', key: 'FLAPS HANDLE PERCENT', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
    ]
  },

  autopilot: {
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

    let data = {};
    let counter = 0;

    this._simConnection.on('simObjectData', recvSimObject => {

      counter += recvSimObject.defineID

      const simVars = Object.values(SIM_VARS).find(s => s.eventId === recvSimObject.defineID);

      simVars.vars.forEach(v => {
        const enumIndex = Object.values(SimConnectDataType).indexOf(v.dataType);
        const enumName = Object.keys(SimConnectDataType)[enumIndex];
        const valueReader = `read${enumName[0]}${enumName.slice(1).toLowerCase()}`;
        try {
          const value = recvSimObject.data[valueReader]();
          data[v.alias] = v.valueParser ? v.valueParser(value) : value;
        }
        catch (err) { }
      });

      if (counter === Object.values(SIM_VARS).map(v => v.eventId).reduce((i, s) => { return i + s; })) {
        counter = 0;
        data.timestamp = new Date().toISOString().replace('T', ' ').split('Z')[0];
        this._context.eventBus.send('ON_SIM_AIRCRAFT_DATA', data);
      }

    });
  }
}


