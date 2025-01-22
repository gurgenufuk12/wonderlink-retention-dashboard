const { queryUsers, querySessions } = require("./bigqueryService");
const UserModel = require("../models/userModel");
const SessionModel = require("../models/sessionModel");
const { query } = require("../../config/database");

class InitializationService {
  static async checkIfDataTableExists() {
    const result = await query("SELECT COUNT(*) FROM user_table");
    return result.rows[0].count > 0;
  }
  static async checkIfDataSessionExists() {
    const result = await query("SELECT COUNT(*) FROM session_table");
    return result.rows[0].count > 0;
  }

  static async importAllData() {
    try {
      console.log("Starting initial data import...");

      const hasTableData = await this.checkIfDataTableExists();
      const hasData = await this.checkIfDataSessionExists();

      if (hasTableData && hasData) {
        console.log("Data already exists in database, skipping import");
        return;
      }

      console.log("Importing users from BigQuery...");
      const users = await queryUsers();
      const userPseudoIds = new Set();
      for (const user of users) {
        await UserModel.create(user);
        userPseudoIds.add(user.user_pseudo_id);
      }
      console.log(`Imported ${users.length} users`);

      console.log("Importing sessions from BigQuery...");
      const allSessions = await querySessions();

      const validSessions = allSessions.filter((session) =>
        userPseudoIds.has(session.user_pseudo_id)
      );
      console.log(
        `Found ${allSessions.length} sessions, ${validSessions.length} are valid`
      );

      for (const session of validSessions) {
        await SessionModel.create(session);
      }
      console.log(`Imported ${validSessions.length} sessions`);

      console.log("Data import completed successfully");
    } catch (err) {
      console.error("Initial data import failed:", err);
      throw err;
    }
  }
}

module.exports = InitializationService;
