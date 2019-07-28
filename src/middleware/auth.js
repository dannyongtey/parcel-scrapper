const { OAuth2Client } = require('google-auth-library')
const Student = require('../persistence/students')
const Request = require('../persistence/requests')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = {
  async authMiddleware(req, res, next) {
    if (req.method !== 'OPTIONS') {

      if (!req.header('authorization')) {
        return res.status(401).json({
          error: 'Unauthorized'
        })
      }
      const authHeader = JSON.parse(req.header('authorization').split('Bearer ')[1])
      const { tokenId } = authHeader
      try {
        const ticket = await client.verifyIdToken({
          idToken: tokenId,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        req.data = {}
        req.data.googleAuth = payload

        const studentID = payload['email'].split('@')[0]
        let studentResult = await Student.find(studentID)
        if (!studentResult) {
          studentResult = await Student.create({
            name: payload['name'],
            student_id: studentID,
          })
        }
        const requestOfSameDay = await Request.requestsOfSameDay({ student_id: studentResult.id })
        if (requestOfSameDay.length < 10) {
          await Student.unhold(studentResult.id)
        }

        studentResult = await Student.find(studentID)

        req.data.student = studentResult
        if (studentResult.ban) {
          return res.status(403).json({
            error: `
          Your account has been banned permanently due to abuse.
          Please contact the admin to have your account unbanned.
          `})
        } else if (studentResult.hold) {
          return res.status(403).json({
            error: `
          Your account has been placed on hold due to suspicious activity.
          Don't worry, an admin will review your account in a moment.
          Check back later.
          `})
        }
        if (payload['hd'] !== 'student.mmu.edu.my') {
          res.status(401).json({ error: 'Unauthorized. Please use MMU student email to login.' })
          return
        } else {
          next()
        }
      } catch(error) {
        console.log(error)
        res.status(401).json({ error: 'Unauthorized. Please ensure you are logged in using official MMU Account.' })
        return
      }
    } else {
      next()
    }
  }
}
