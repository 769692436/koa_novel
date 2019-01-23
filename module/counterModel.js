const {db} = require('../database/connect');
const CounterSchema = require('../Schema/counterSchema');
const ObjCounter = db.model('counters', CounterSchema);

module.exports = ObjCounter;
