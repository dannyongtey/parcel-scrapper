const {Router} = require('express');

const router = new Router();
const {loginOsmosis, scrapeParcel, processContent} = require('../modules/scraper')

router.get('/', async (req, res) => {
  try {
    loginOsmosis().then(({cookie}) => {
      scrapeParcel({cookie}).then(result => {
        console.log(result)
      })
    })

    return res.status(200).json(result);
  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

module.exports = router;
