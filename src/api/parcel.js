const { Router } = require('express');
const Parcel = require('../persistence/parcels');


const router = new Router();
const { loginOsmosis, scrapeParcel, processContent, getDateFrom } = require('../modules/scraper')

router.get('/', async (req, res) => {
  try {
    const parcelLists = []
    const lastRecordedDate = new Date(await Parcel.latestDateInRecord())
    loginOsmosis().then(({ cookie }) => {
      scrapeParcel({ cookie }).then(results => {
        results.forEach(result => {
          const filteredResults = processContent({ content: result.content })
          parcelLists.push(...filteredResults)
          filteredResults.forEach(filteredResult => {
            const date = new Date(getDateFrom({ title: result.title }))
            if (date > lastRecordedDate) {
              Parcel.createWithinDate({
                bil: filteredResult.bil,
                name: filteredResult.name,
                parcel: filteredResult.parcel,
                qty: filteredResult.qty,
                date,
              })
            }

          })

        })
        res.status(200).json(parcelLists);

      })
    })

  } catch (error) {
    console.error(error)
    res.status(500).json();
  }
});

module.exports = router;
