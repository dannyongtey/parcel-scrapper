const { Router } = require('express');
const Request = require('../persistence/requests')
const Parcel = require('../persistence/parcels')


const router = new Router();

router.get('/', async (req, res) => {
  try {
    const parcels = await Parcel.list()
    res.status(200).json(parcels)
  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

router.post('/request', async (req, res) => {
  try {
    const {body: {name, email, fcm}} = req
    const request = await Request.create({
      name,
      email,
      fcm,
    })
    res.status(200).json(request)
  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

module.exports = router;
