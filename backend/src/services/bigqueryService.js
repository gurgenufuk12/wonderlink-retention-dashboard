const { BigQuery } = require("@google-cloud/bigquery");
const path = require("path");

const bigquery = new BigQuery({
  keyFilename: path.join(
    __dirname,
    "../../config/wonderlink-6afca-7b1dd61d5eeb.json"
  ),
  projectId: "wonderlink-6afca",
});

async function queryUsers() {
  const query = `
    WITH UserFirstOpen AS (
      SELECT 
        user_pseudo_id,
        event_date,
        platform,
        geo.country,
        (SELECT value.int_value 
         FROM UNNEST(user_properties) 
         WHERE key = 'first_open_time') as install_timestamp,
        ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp ASC) as rn
      FROM \`wonderlink-6afca.analytics_354479876.events_*\`
      WHERE event_name = 'first_open'
    )
    SELECT 
      user_pseudo_id,
      event_date as install_date,
      install_timestamp,
      platform,
      country
    FROM UserFirstOpen
    WHERE rn = 1
  `;

  try {
    const [rows] = await bigquery.query({ query });
    return rows;
  } catch (err) {
    console.error("BigQuery Error:", err);
    throw err;
  }
}

async function querySessions() {
  const query = `
      WITH ValidUsers AS (
        SELECT DISTINCT user_pseudo_id 
        FROM \`wonderlink-6afca.analytics_354479876.events_*\`
        WHERE event_name = 'first_open'
      ),
      SessionEvents AS (
        SELECT 
          s.user_pseudo_id,
          s.event_date,
          s.event_timestamp,
          (SELECT CAST(value.int_value AS STRING)
           FROM UNNEST(s.event_params) 
           WHERE key = 'ga_session_id') as session_id
        FROM \`wonderlink-6afca.analytics_354479876.events_*\` s
        INNER JOIN ValidUsers v 
        ON s.user_pseudo_id = v.user_pseudo_id
        WHERE s.event_name = 'session_start'
      )
      SELECT 
        user_pseudo_id,
        event_date as session_date,
        event_timestamp as session_timestamp,
        session_id
      FROM SessionEvents
      WHERE session_id IS NOT NULL
    `;

  try {
    const [rows] = await bigquery.query({ query });
    console.log(`Found ${rows.length} valid sessions with existing users`);
    return rows;
  } catch (err) {
    console.error("BigQuery Error:", err);
    throw err;
  }
}

module.exports = {
  queryUsers,
  querySessions,
};
