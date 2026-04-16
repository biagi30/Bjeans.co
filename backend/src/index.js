require("dotenv").config();

const cors = require("cors");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BJeans.co backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
