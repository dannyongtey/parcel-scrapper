const mailer = require('nodemailer')

const {SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD, SMTP_PORT, NODE_ENV} = process.env
const transporter = mailer.createTransport({
  host: SMTP_SERVER,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  }
})

async function sendMailTo({to, subject, text, html}){
  const info = await transporter.sendMail({
    from: `Danny <${SMTP_USERNAME}>`,
    to,
    subject,
    text,
    html
  })
  return info
}

module.exports = {
  async sendMailTo({to, subject, text, html}){
    const info = await transporter.sendMail({
      from: `${SMTP_USERNAME}`,
      to: NODE_ENV === 'development'? 'dannyongtey@gmail.com' : to,
      subject,
      text,
      html
    })
    return info
  },

  async sendReceivedEmailTo({email, name, parcel, qty}){
    sendMailTo({
      to: email,
      subject: 'ParcelTrack V2: Your Parcel has Arrived!',
      text: `Parcel for ${name} has arrived in STAD MMU. Details: ${parcel} x ${qty}`,
      html: `
      <p>Hello there!</p>
      <p>You have previously submitted a request for notification when your parcel has arrived.</p>
      <p>Our system detects that a parcel with the given name ${name} has arrived at STAD MMU. Details are below:</p>
      <ol>
        <li>Parcel Type: ${parcel}</li>
        <li>Quantity: ${qty}</li>
      </ol>
      <p>If you did not request for a notification, chances are someone entered the wrong email.
      If you suspect that this is an abuse, kindly contact the admin at dannyongtey@gmail.com.
      We shall permanently ban the user from using the platform.
      </p>

      <p>Regards,</p>
      <p>ParcelTrack Bot :)</p>
      `
    })
  }
}
