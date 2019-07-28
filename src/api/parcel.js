const { Router } = require('express');
const Request = require('../persistence/requests')
const Parcel = require('../persistence/parcels')
const Student = require('../persistence/students')


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
    const { body: { name, email, fcm } } = req
    const { student } = req.data
    if (!name) {
      return res.status(422).json({
        error: "Name should not be empty."
      });
    }
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(email.toLowerCase())) {
      return res.status(422).json({
        error: "Please enter a valid email."
      })
    }
    const requestOfSameDay = await Request.requestsOfSameDay({ student_id: student.id })

    if (requestOfSameDay.length >= 10) {
      Student.hold(student.id)
    }

    const request = await Request.create({
      name,
      email,
      fcm,
      student_primary: student.id,
    })


    res.status(200).json(request)
  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

module.exports = router;
