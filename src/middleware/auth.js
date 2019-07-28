const { OAuth2Client } = require('google-auth-library')
const Student = require('../persistence/students')

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

        const studentID = payload['hd'].split('@')[0]
        let studentResult = await Student.find(studentID)
        if (!studentResult) {
          studentResult = await Student.create({
            name: payload['name'],
            student_id: studentID,
          })
        }
        req.data.student = studentResult
        if (payload['hd'] !== 'student.mmu.edu.my') {
          res.status(401).json({ error: 'Unauthorized. Please use MMU student email to login.' })
          return
        } else {
          next()
        }
      } catch {
        res.status(401).json({ error: 'Unauthorized. Please ensure you are logged in using official MMU Account.' })
        return
      }
    } else {
      next()
    }
  }
}
