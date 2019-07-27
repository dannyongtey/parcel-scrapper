const sql = require('sql-template-strings');
const uuid = require('uuid/v4');
const db = require('./db');

module.exports = {
  async latestDateInRecord() {
    const { rows } = await db.query(sql`
    SELECT MAX(date) from parcels
    `)
    if (!rows[0].max) {
      return '1 Jan 1999'
    } else {
      return rows[0].max
    }
  },
  async list() {
    const { rows } = await db.query(sql`
    SELECT * from parcels
    `)
    return rows
  },
  async create({ bil, name, parcel, qty, date }) {
    try {

      const { rows } = await db.query(sql`
      INSERT INTO parcels (id, bil, name, parcel, qty, date)
        VALUES (${uuid()}, ${bil}, ${name}, ${parcel}, ${qty}, ${date})
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
