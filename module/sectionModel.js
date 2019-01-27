const {db} = require('../database/connect');
const SectionSchema = require('../Schema/sectionSchema');
const ObjSection = db.model('sections', SectionSchema);

module.exports = ObjSection;
