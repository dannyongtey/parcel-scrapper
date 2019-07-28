const schedule = require('node-schedule')
const {checkParcel} = require('./parcel')

const checkTime = process.env.NODE_ENV === 'development' ? '*/30 * * * * *' : '*/1 * * 1-5'

module.exports = {
  runSchedule() {
    console.log('Scheduler is running.')
    schedule.scheduleJob(checkTime, function (time) {
      console.log('Function is going to run at', time)
      checkParcel()
    });
  }
}
