const { loginOsmosis, scrapeParcel, processContent, getDateFrom } = require('../modules/scraper')
const Parcel = require('../persistence/parcels');
const Request = require('../persistence/requests')
const { sendReceivedEmailTo } = require('../modules/email')
const FCM = require('fcm-node')
const privateKey = require('./private-key.json')

const fcm = new FCM(privateKey)
module.exports = {
  async checkParcel() {
    const parcelLists = []
    const requestList = await Request.listNotNotified()
    const lastRecordedDate = new Date(await Parcel.latestDateInRecord())
    loginOsmosis().then(({ cookie }) => {
      scrapeParcel({ cookie }).then(results => {
        results.forEach(result => {
          const filteredResults = processContent({ content: result.content })
          parcelLists.push(...filteredResults)
          filteredResults.forEach(filteredResult => {
            const date = new Date(getDateFrom({ title: result.title }))
            if (date > lastRecordedDate) {
              requestList.forEach(request => {
                const parcelName = filteredResult.name.toLowerCase().replace(/\s/g, '')
                const requestID = request.id
                const searchName = request.name.toLowerCase().replace(/\s/g, '')
                if (parcelName.includes(searchName)) {
                  if (request.fcm) {
                    const message = {
                      to: request.fcm,
                      notification: {
                        sound: "default",
                        title: "Parcel Received! - Parcel Track V2",
                        body: `Hi there! A parcel named ${filteredResult.name} type ${filteredResult.parcel} quantity ${filteredResult.qty} has been received.`
                      }
                    }

                    fcm.send(message, function(err, res){
                      console.log('error: ', err, 'response: ',res)
                    })
                  }

                  sendReceivedEmailTo({
                    email: request.email,
                    name: filteredResult.name,
                    parcel: filteredResult.parcel,
                    qty: filteredResult.qty,
                  })
                  Request.updateNotified({ id: requestID })
                }
              })
              Parcel.create({
                bil: filteredResult.bil,
                name: filteredResult.name,
                parcel: filteredResult.parcel,
                qty: filteredResult.qty,
                date,
              })
            }
          })
        })
      })
    })
  }
}

