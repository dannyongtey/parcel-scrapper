'use strict'
const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();
  await client.query(`
  CREATE TABLE IF NOT EXISTS requests (
    id uuid PRIMARY KEY,
    name text,
    email text,
    fcm text,
    created_at timestamp,
    updated_at timestamp
    );
  `
  );

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();
  await client.query(`
  DROP TABLE requests;
  `);

  await client.release(true);
  next()
}
