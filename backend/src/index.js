const express = require("express");
const cors = require("cors");
require("dotenv").config();

const studentsRouter = require("./routes/students");

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check - hit this in your browser first to confirm the
// server is running at all, before worrying about the database.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/students", studentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MyPortal backend running on http://localhost:${PORT}`);
});
