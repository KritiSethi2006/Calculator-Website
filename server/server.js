const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const History = require("./models/history");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/calculatorDB";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB connected on ${MONGODB_URI}`);
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    mongoReadyState: mongoose.connection.readyState
  });
});

app.post("/history", async (req, res) => {
  try {
    const { expression, result, mode = "standard" } = req.body;

    if (!expression || !result) {
      return res.status(400).json({
        message: "Both expression and result are required."
      });
    }

    const newEntry = await History.create({ expression, result, mode });
    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to save calculation history."
    });
  }
});

app.get("/history", async (_, res) => {
  try {
    const data = await History.find().sort({ createdAt: -1 }).limit(25);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch calculation history."
    });
  }
});

app.delete("/history/:id", async (req, res) => {
  try {
    const deletedEntry = await History.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({
        message: "History item not found."
      });
    }

    return res.json({
      message: "History item deleted."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete history item."
    });
  }
});

app.delete("/history", async (_, res) => {
  try {
    await History.deleteMany({});
    return res.json({ message: "History cleared." });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to clear history."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
