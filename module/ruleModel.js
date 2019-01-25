const {db} = require('../database/connect');
const RuleSchema = require('../Schema/ruleSchema');
const ObjRule = db.model('rules', RuleSchema);

module.exports = ObjRule;
