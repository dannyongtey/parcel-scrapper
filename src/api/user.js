const {Router} = require('express');
const Student = require('../persistence/students');

const router = new Router();

router.get('/ban', async (req, res) => {
  try {
    const {student_id, token} = req.query
    if (token === process.env.ADMIN_TOKEN){
      result = await Student.ban(student_id)
      return res.status(200).json(result)
    } else {
      throw Error()
    }
  } catch (err){
    res.status(500).json({
      error: 'Unknown error'
    })
  }
});

router.get('/unban', async (req, res) => {
  try {
    const {student_id, token} = req.query
    if (token === process.env.ADMIN_TOKEN){
      result = await Student.unban(student_id)
      res.status(200).json(result)
    } else {
      throw Error()
    }
  } catch (err){
    res.status(500).json({
      error: 'Unknown error'
    })
  }
});

router.get('/hold', async (req, res) => {
  try {
    const {student_id, token} = req.query
    if (token === process.env.ADMIN_TOKEN){
      result = await Student.hold(student_id)
      res.status(200).json(result)
    } else {
      throw Error()
    }
  } catch (err){
    res.status(500).json({
      error: 'Unknown error'
    })
  }
});

router.get('/unhold', async (req, res) => {
  try {
    const {student_id, token} = req.query
    if (token === process.env.ADMIN_TOKEN){
      result = await Student.unhold(student_id)
      res.status(200).json(result)
    } else {
      throw Error()
    }
  } catch (err){
    res.status(500).json({
      error: 'Unknown error'
    })
  }
});

module.exports = router;
