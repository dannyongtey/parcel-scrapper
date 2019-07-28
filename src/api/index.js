const express = require('express');
const {authMiddleware} = require('../middleware/auth')

const {Router} = express;
const router = new Router();

const user = require('./user');
const session = require('./session');
const parcel = require('./parcel')

router.use('/api/users', user);
router.use('/api/sessions', session);

router.use('/api/parcels', authMiddleware, parcel)

module.exports = router;
