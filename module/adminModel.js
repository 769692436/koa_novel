const { db } = require('../database/connect');

const AdminSchema = require('../Schema/adminSchema');

const ObjAdmin = db.model('admins', AdminSchema);

module.exports = ObjAdmin;
