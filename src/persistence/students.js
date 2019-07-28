const sql = require('sql-template-strings');
const uuid = require('uuid/v4');
const db = require('./db');

module.exports = {
  async create({ name, student_id }) {
    try {
      const { rows } = await db.query(sql`
      INSERT INTO students (id, name, student_id, ban, hold, created_at, updated_at)
        VALUES (${uuid()}, ${name}, ${student_id}, ${false}, ${false}, ${new Date()}, ${new Date()})
        RETURNING id;
      `);

      const [user] = rows;
      console.log(user)
      return user;
    } catch (error) {
      if (error.constraint === 'users_email_key') {
        return null;
      }

      throw error;
    }
  },
  async find(student_id) {
    const { rows } = await db.query(sql`
    SELECT * FROM students WHERE student_id=${student_id} LIMIT 1;
    `);
    return rows[0];
  },

  async hold(student_id) {
    const rows = await db.query(sql`
      UPDATE students
      SET hold=true
      WHERE id=${student_id}
      `);
    return rows
  },

  async unhold(student_id) {
    const rows = await db.query(sql`
      UPDATE students
      SET hold=false
      WHERE id=${student_id}
      `);
    return rows
  },

  async ban(student_id) {
    const rows = await db.query(sql`
      UPDATE students
      SET ban=true
      WHERE student_id=${student_id}
      `);
    return rows
  },

  async unban(student_id) {
    const rows = await db.query(sql`
      UPDATE students
      SET ban=false
      WHERE student_id=${student_id}
      `);
    return rows
  }

};
