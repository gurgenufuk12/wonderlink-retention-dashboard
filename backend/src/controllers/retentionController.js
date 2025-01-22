const { pool } = require("../../config/database");

function buildFilter({ installDate, country, platform }) {
  const conditions = [];
  if (installDate) conditions.push(`u.install_date = '${installDate}'`);
  if (country) conditions.push(`u.country = '${country}'`);
  if (platform) conditions.push(`u.platform = '${platform}'`);
  return conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
}
const getUniqueCountries = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT country 
      FROM user_table 
      WHERE country IS NOT NULL 
      ORDER BY country;
    `;

    const result = await pool.query(query);
    res.json(result.rows.map((row) => row.country));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUniquePlatforms = async (req, res) => {
  try {
    const query = `
        SELECT DISTINCT platform 
        FROM user_table 
        WHERE platform IS NOT NULL 
        ORDER BY platform;
      `;

    const result = await pool.query(query);
    res.json(result.rows.map((row) => row.platform));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getAllMetrics = async (req, res) => {
  try {
    const d1Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d1_retained
      FROM user_table u
      JOIN session_table s ON s.user_pseudo_id = u.user_pseudo_id
      WHERE (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 24 AND 48;
    `;

    const d7Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d7_retained
      FROM user_table u
      JOIN session_table s ON s.user_pseudo_id = u.user_pseudo_id
      WHERE (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 168 AND 192;
    `;

    const d30Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d30_retained
      FROM user_table u
      JOIN session_table s ON s.user_pseudo_id = u.user_pseudo_id
      WHERE (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 720 AND 744;
    `;

    const [totalRes, d1Res, d7Res, d30Res] = await Promise.all([
      pool.query(
        "SELECT COUNT(DISTINCT user_pseudo_id)::int AS total_installs FROM user_table"
      ),
      pool.query(d1Query),
      pool.query(d7Query),
      pool.query(d30Query),
    ]);

    const totalInstalls = totalRes.rows[0].total_installs;
    const d1Retained = d1Res.rows[0].d1_retained;
    const d7Retained = d7Res.rows[0].d7_retained;
    const d30Retained = d30Res.rows[0].d30_retained;

    res.json({
      totalInstalls,
      d1: {
        retained: d1Retained,
        retention: totalInstalls ? (d1Retained / totalInstalls).toFixed(4) : 0,
      },
      d7: {
        retained: d7Retained,
        retention: totalInstalls ? (d7Retained / totalInstalls).toFixed(4) : 0,
      },
      d30: {
        retained: d30Retained,
        retention: totalInstalls ? (d30Retained / totalInstalls).toFixed(4) : 0,
      },
    });
  } catch (err) {
    console.error("Error calculating metrics:", err);
    res.status(500).json({ error: err.message });
  }
};
const getFilteredMetrics = async (req, res) => {
  try {
    const { installDate, country, platform } = req.query;
    const filterClause = buildFilter({ installDate, country, platform });

    const totalQuery = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS total_installs
      FROM user_table u
      ${filterClause};
    `;

    const d1Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d1_retained
      FROM user_table u
      JOIN session_table s ON u.user_pseudo_id = s.user_pseudo_id
      ${filterClause ? filterClause.replace("WHERE", "WHERE") : ""}
      AND (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 24 AND 48;
    `;

    const d7Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d7_retained
      FROM user_table u
      JOIN session_table s ON u.user_pseudo_id = s.user_pseudo_id
      ${filterClause ? filterClause.replace("WHERE", "WHERE") : ""}
      AND (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 168 AND 192;
    `;

    const d30Query = `
      SELECT COUNT(DISTINCT u.user_pseudo_id)::int AS d30_retained
      FROM user_table u
      JOIN session_table s ON u.user_pseudo_id = s.user_pseudo_id
      ${filterClause ? filterClause.replace("WHERE", "WHERE") : ""}
      AND (
        (s.session_timestamp::bigint / 1000000.0) 
        - (u.install_timestamp::bigint / 1000.0)
      ) / 3600 BETWEEN 720 AND 744;
    `;

    const [totalRes, d1Res, d7Res, d30Res] = await Promise.all([
      pool.query(totalQuery),
      pool.query(d1Query),
      pool.query(d7Query),
      pool.query(d30Query),
    ]);

    const totalInstalls = totalRes.rows[0]?.total_installs || 0;
    const d1Retained = d1Res.rows[0]?.d1_retained || 0;
    const d7Retained = d7Res.rows[0]?.d7_retained || 0;
    const d30Retained = d30Res.rows[0]?.d30_retained || 0;

    res.json({
      totalInstalls,
      d1: {
        retained: d1Retained,
        retention: totalInstalls ? (d1Retained / totalInstalls).toFixed(4) : 0,
      },
      d7: {
        retained: d7Retained,
        retention: totalInstalls ? (d7Retained / totalInstalls).toFixed(4) : 0,
      },
      d30: {
        retained: d30Retained,
        retention: totalInstalls ? (d30Retained / totalInstalls).toFixed(4) : 0,
      },
    });
  } catch (err) {
    console.error("Error fetching filtered metrics:", err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getUniqueCountries,
  getUniquePlatforms,
  getAllMetrics,
  getFilteredMetrics,
};
