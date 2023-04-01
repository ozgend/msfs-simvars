const { Protocol, SimConnectDataType, SimConnectPeriod, SimObjectType, SimConnectConstants, open: openConnection } = require('node-simconnect');

const AIRCRAFT_DATA_REQUEST = 0;
const AIRCRAFT_DATA_DEFINITION = 0;

const _simVarMap = [
  { alias: 'atcId', key: 'ATC ID', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
  { alias: 'category', key: 'CATEGORY', unit: null, dataType: SimConnectDataType.STRING32, tag: SimConnectConstants.UNUSED },
  { alias: 'title', key: 'TITLE', unit: null, dataType: SimConnectDataType.STRING128, tag: SimConnectConstants.UNUSED },
  { alias: 'lat', key: 'PLANE LATITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'lon', key: 'PLANE LONGITUDE', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'heading_true', key: 'PLANE HEADING DEGREES TRUE', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'heading_mag', key: 'PLANE HEADING DEGREES MAGNETIC', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'pitch', key: 'PLANE PITCH DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'bank', key: 'PLANE BANK DEGREES', unit: 'degrees', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'alt_sea', key: 'PLANE ALTITUDE', unit: 'feet', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'alt_ground', key: 'PLANE ALTITUDE ABOVE GROUND', unit: 'feet', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'speed', key: 'GROUND VELOCITY', unit: 'knots', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'speed_ground', key: 'SURFACE RELATIVE GROUND SPEED', unit: 'knots', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'airspeed', key: 'AIRSPEED INDICATED', unit: 'knots', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'airspeed_true', key: 'AIRSPEED TRUE', unit: 'knots', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'vertical', key: 'VERTICAL SPEED', unit: 'feet per second', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_1_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:1', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_2_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:2', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_3_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:3', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_4_throttle', key: 'GENERAL ENG THROTTLE LEVER POSITION:4', unit: 'percent', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_1_rpm_n1', key: 'ENG N1 RPM:1', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_2_rpm_n1', key: 'ENG N1 RPM:2', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_3_rpm_n1', key: 'ENG N1 RPM:3', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_4_rpm_n1', key: 'ENG N1 RPM:4', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_1_rpm_n2', key: 'ENG N2 RPM:1', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_2_rpm_n2', key: 'ENG N2 RPM:2', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_3_rpm_n2', key: 'ENG N2 RPM:3', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  { alias: 'eng_4_rpm_n2', key: 'ENG N2 RPM:4', unit: 'rpm 1 over 16k', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  // { alias: 'gps_alt', key: 'GPS POSITION ALT', unit: 'meters', dataType: SimConnectDataType.INT32, tag: SimConnectConstants.UNUSED },
  // { alias: 'gps_lat', key: 'GPS POSITION LAT', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
  // { alias: 'gps_lon', key: 'GPS POSITION LON', unit: 'degrees', dataType: SimConnectDataType.FLOAT64, tag: SimConnectConstants.UNUSED },
];

module.exports = class SimDataService {
  constructor(context, { host, port, appName, updateFreqSecs }) {
    this._context = context;
    this._host = host ?? '127.0.0.1';
    this._port = port ?? 500;
    this._appName = appName;
    this._updateFreqSecs = updateFreqSecs ?? 1;
  }

  connect() {
    this._context.logger.info('init sim.connect');

    return openConnection(this._appName, Protocol.KittyHawk, { host: this._host, port: this._port })
      .then(({ recvOpen, handle: simConnection }) => {
        this._simConnection = simConnection;
        this._context.logger.info('connected to sim');
        this._context.logger.info(JSON.stringify(recvOpen, null, 2));
      })
      .catch(err => {
        this._context.logger.error('connection failed:', err);
      });
  }

  requestAircraftData() {
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'ATC ID', null, SimConnectDataType.STRING32, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'CATEGORY', null, SimConnectDataType.STRING32, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'TITLE', null, SimConnectDataType.STRING128, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE LATITUDE', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE LONGITUDE', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE HEADING DEGREES TRUE', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE HEADING DEGREES MAGNETIC', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE PITCH DEGREES', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE BANK DEGREES', 'degrees', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE ALTITUDE', 'feet', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'PLANE ALTITUDE ABOVE GROUND', 'feet', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'GROUND VELOCITY', 'knots', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'SURFACE RELATIVE GROUND SPEED', 'knots', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'VERTICAL SPEED', 'feet per second', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'GPS POSITION ALT', 'meters', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'GPS POSITION LAT', 'degree', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);
    // this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, 'GPS POSITION LON', 'degree', SimConnectDataType.FLOAT64, 0, SimConnectConstants.UNUSED);

    _simVarMap.forEach(v => {
      this._simConnection.addToDataDefinition(AIRCRAFT_DATA_DEFINITION, v.key, v.unit, v.dataType,  0, v.tag);
    });

    this._simConnection.requestDataOnSimObject(AIRCRAFT_DATA_REQUEST, AIRCRAFT_DATA_DEFINITION, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SECOND, 0, this._updateFreqSecs, 0, 0);

    this._simConnection.on('simObjectData', recvSimObject => {
      let data = {};

      // try {
      // data = {
      //   atcId: recvSimObject.data.readString32(),
      //   type: recvSimObject.data.readString32(),
      //   title: recvSimObject.data.readString128(),
      //   // lat: recvSimObject.data.readFloat64(),
      //   // lon: recvSimObject.data.readFloat64(),
      // };
      // }        
      // catch (err) { }

      _simVarMap.forEach(v => {
        const enumIndex = Object.values(SimConnectDataType).indexOf(v.dataType);
        const enumName = Object.keys(SimConnectDataType)[enumIndex];
        const valueReader = `read${enumName[0]}${enumName.slice(1).toLowerCase()}`;
        try {
          data[v.alias] = recvSimObject.data[valueReader]();
        }
        catch (err) { }
      });

      this._context.eventBus.send('ON_SIM_AIRCRAFT_DATA', data);

    });
  }
}


