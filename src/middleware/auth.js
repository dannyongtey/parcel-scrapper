const { OAuth2Client } = require('google-auth-library')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = {
  async authMiddleware(req, res, next) {
    if (req.method !== 'OPTIONS') {
      if(!req.header('authorization')){
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
