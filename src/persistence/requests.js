const sql = require('sql-template-strings');
const uuid = require('uuid/v4');
const db = require('./db');

module.exports = {
  async listNotNotified() {
    const { rows } = await db.query(sql`
    SELECT * from requests
    WHERE notified=false
    `)
    return rows
  },
  async create({ name, email, fcm }) {
    try {
      const { rows } = await db.query(sql`
      INSERT INTO requests (id, name, email, fcm, created_at, updated_at)
        VALUES (${uuid()}, ${name}, ${email}, ${fcm}, ${new Date()}, ${new Date()})
        RETURNING id;
      `);

      const [user] = rows;
      return user;
    } catch (error) {
      if (error.constraint === 'users_email_key') {
        return null;
      }
      throw error;
    }
  },
  async find({ bil, name, parcel, qty, date }) {
    const { rows } = await db.query(sql`
    SELECT * FROM parcels
    WHERE bil=${bil} AND
    name=${name} AND
    parcel=${parcel} AND
    qty=${qty} AND
    date=${date}
    LIMIT 1
    ;
    `);
    return rows[0];
  }
};
