const { query } = require("../../config/database");

class SessionModel {
  static async create(sessionData) {
    const { session_id, user_pseudo_id, session_date, session_timestamp } =
      sessionData;

    const sql = `
      INSERT INTO session_table (
        session_id,
        user_pseudo_id,
        session_date,
        session_timestamp
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_id) DO NOTHING
      RETURNING *
    `;

    const values = [
      session_id,
      user_pseudo_id,
      session_date,
      session_timestamp,
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }
}

module.exports = SessionModel;
