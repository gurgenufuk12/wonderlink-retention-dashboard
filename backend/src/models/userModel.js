const { query } = require("../../config/database");

class UserModel {
  static async create(userData) {
    const {
      user_pseudo_id,
      install_date,
      install_timestamp,
      platform,
      country,
    } = userData;

    const sql = `
      INSERT INTO user_table (
        user_pseudo_id,
        install_date,
        install_timestamp,
        platform,
        country
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_pseudo_id) DO NOTHING
      RETURNING *
    `;

    const values = [
      user_pseudo_id,
      install_date,
      install_timestamp,
      platform,
      country,
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }
}

module.exports = UserModel;
