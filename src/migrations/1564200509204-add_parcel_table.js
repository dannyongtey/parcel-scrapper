'use strict'
const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();
  await client.query(`
  CREATE TABLE IF NOT EXISTS parcels (
    id uuid PRIMARY KEY,
    bil integer,
    name text,
    parcel text,
    qty integer,
    date timestamp
    );
  `
  );

  await client.query(`
  CREATE INDEX parcel_name on parcels (name);
  `);

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();
  await client.query(`
  DROP TABLE parcels;
  `);

  await client.release(true);
  next()
}
