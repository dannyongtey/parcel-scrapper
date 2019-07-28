'use strict'
const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();
  await client.query(`
  CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY,
    student_id text,
    name text,
    hold boolean,
    ban boolean,
    created_at timestamp,
    updated_at timestamp
    );
  `
  );

  await client.query(`
    ALTER TABLE requests
      ADD COLUMN student_primary uuid REFERENCES students (id);
  `)

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
    ALTER TABLE requests
      DROP COLUMN student_primary CASCADE
  `)

  await client.query(`
  DROP TABLE students;
  `);

  await client.release(true);
  next()
}
