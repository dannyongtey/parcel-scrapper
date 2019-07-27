const { Router } = require('express');



const router = new Router();

router.get('/', async (req, res) => {
  try {


  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

module.exports = router;
