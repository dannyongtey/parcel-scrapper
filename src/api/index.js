const express = require('express');

const {Router} = express;
const router = new Router();

const user = require('./user');
const session = require('./session');
const parcel = require('./parcel')

router.use('/api/users', user);
router.use('/api/sessions', session);
router.use('/api/parcels', parcel)

module.exports = router;
