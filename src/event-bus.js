const EventEmitter = require('events');


module.exports = class EventBus {
  constructor() {
    this._eventEmitter = new EventEmitter();
    this._handlerMap = {};
  }

  addListener(name, listener) {
    this._eventEmitter.on(name, (eventData) => {
      listener(eventData);
    });

    return this;
  }

  send(name, data) {
    this._eventEmitter.emit(name, data);
  }

}