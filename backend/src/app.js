const express = require("express");
const cors = require("cors");
require("dotenv").config();

const retentionRoutes = require("../src/routes/retentionRoutes");
const { testConnection, initializeTables } = require("../config/database");
const InitializationService = require("../src/services/initializationService");

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

app.use("/api/retention", retentionRoutes);

async function startServer() {
  try {
    await testConnection();

    await initializeTables();

    await InitializationService.importAllData();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
