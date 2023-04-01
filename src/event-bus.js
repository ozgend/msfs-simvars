const EventEmitter = require('events');


module.exports = class EventBus {
  constructor() {
    this._eventEmitter = new EventEmitter();
    this._handlerMap = {};
  }

  listen(name) {
    this._handlerMap[name] = this._handlerMap[name] ?? [];

    this._eventEmitter.on(name, (eventData) => {
      this._handlerMap[name].forEach(h => {
        console.debug(`on [${name}] handler [${h.uid}]`);
        h.handler(eventData);
      });
    });

    return this;
  }

  send(name, data) {
    this._eventEmitter.emit(name, data);
  }

  addHandler(name, uid, handler) {
    this._handlerMap[name] = this._handlerMap[name] ?? [];

    if (this._handlerMap[name].find(h => h.uid === uid)) {
      return;
    }

    this._handlerMap[name].push({ uid, handler });
  }

  removeHandler(name, uid) {
    this._handlerMap[name] = this._handlerMap[name].filter(h => h.uid === uid);
  }

}