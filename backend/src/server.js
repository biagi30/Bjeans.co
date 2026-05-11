require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { connectDatabase } = require("./config/database");
const apiRoutes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`Backend server listening on port ${port}`);
      console.log("MongoDB connected");
    });
  } catch (error) {
    console.error("Failed to start backend server:", error.message);
    process.exit(1);
  }
}

startServer();
