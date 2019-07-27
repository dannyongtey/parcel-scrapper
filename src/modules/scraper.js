const osmosis = require('osmosis')

// Important params
const scrapeKeywords = ['parcel']
const contentDetectDelimiter = 'QTY'
const flow = {
  BIL: 'BIL',
  NAME: 'NAME',
  PARCEL: 'PARCEL',
  QTY: 'QTY'
}

function isLoggedIn(cookie) {
  if (!cookie) return Promise.resolve(false)
  const testURL = 'https://online.mmu.edu.my/bulletin.php'
  let debugLog = ''
  osmosis.config('headers', { cookie })
  return new Promise((resolve, reject) => {
    let arrayItems = []
    osmosis
      .get(testURL)
      .find('.bulletinContentAll')
      .log(result => debugLog += result)
      .set({
        title: 'p',
        content: 'div'
      })
      .data(data => {
        arrayItems.push(data)
      })
      .done(() => {
        resolve(!!arrayItems)
      })
  }).then((status) => {
    return status
  })


}

function loginOsmosis() {
  const loginURL = 'https://online.mmu.edu.my'

  const { STUDENT_ID, STUDENT_PASSWORD } = process.env
  return new Promise((resolve, reject) => {
    return new Promise((res, rej) => {
      osmosis
        .get(loginURL)
        .then(function (context, data, next) {
          res({ context, cookie: context.request.headers.cookie })
        })
    }).then(({ context, cookie }) => {
      isLoggedIn(cookie).then(hasLoggedIn => {
        if (hasLoggedIn) {
          resolve({ context, cookie })
        } else {
          osmosis
            .get(loginURL)
            .login(STUDENT_ID, STUDENT_PASSWORD)
            .then(function (context, data, next) {
              resolve({ context, cookie: context.request.headers.cookie })
            })
            .log(console.log)
            .error(console.log)
            .debug(console.log)
        }
      })
    })
  })
}

function scrapeParcel({ cookie }) {
  const url = 'https://online.mmu.edu.my/bulletin.php'
  parcelRelatedPosts = []
  return new Promise((resolve, reject) => {
    try {
      osmosis.config('headers', { cookie })
      osmosis
        .get(url)
        .find('.bulletinContentAll')
        .set({
          title: 'p',
          content: 'div tbody'
        })
        .data(data => {
          scrapeKeywords.some((keyword) => data.title.toLowerCase().includes(keyword)) ?
            parcelRelatedPosts.push({
              title: data.title.replace(/\r?\n|\r|\t/g, ' '),
              content: data.content && data.content.replace(/\r?\n|\r|\t/g, ' ').replace(/\s{2}/g, ' ').replace(/\s\s+/g, '  ')
            }) :
            null
        })
        .then(function () {
          resolve(parcelRelatedPosts)
        })
        .log(console.log)
        .error(console.log)
        .debug(console.log)
    } catch (err) {
      reject(err)
    }

  })
}

function processContent({ content, ignoreBill = false }) {
  if (!content) return []
  const contentArr = content.split(' ')
  const parcelArr = contentArr.splice(contentArr.indexOf(contentDetectDelimiter) + 1, contentArr.length)
  if (!parcelArr[0]) {
    parcelArr.shift()
  }
  const resultsArr = []
  let expected = flow.BIL
  let currentBIL = 1
  let parcelObj = {
    bil: '',
    name: '',
    parcel: '',
    qty: '',
  }
  console.log(parcelArr)
  parcelArr.forEach(item => {
    if (item === '') {
      switch (expected) {
        case flow.BIL:
          expected = flow.NAME
          break
        case flow.NAME:
          expected = flow.PARCEL
          break
        case flow.PARCEL:
          expected = flow.QTY
          break
        case flow.QTY:
          expected = flow.BIL
          break
      }
    } else {
      switch (expected) {
        case flow.BIL:
          if (!ignoreBill) {
            if (!isNaN(item) && currentBIL == item) {
              parcelObj.bil = parseInt(item)
              currentBIL++
            }
          }
          break
        case flow.NAME:
          console.log(item)
          parcelObj.name += `${item} `
          break
        case flow.PARCEL:
          parcelObj.parcel += `${item} `
          break
        case flow.QTY:
          if (!isNaN(item)) {
            parcelObj.qty = parseInt(item)
          }
          resultsArr.push(parcelObj)
          parcelObj = {
            name: '',
            parcel: '',
          }
          break
      }
    }
  })
  console.log(resultsArr)
  return resultsArr

}

module.exports = {
  loginOsmosis,
  scrapeParcel,
  processContent
}
