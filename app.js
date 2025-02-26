import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import worker from "./src/workers/imageWorker.js";
import { connectDb } from "./src/connection/db.js";
import uploadRouter from "./src/router/upload.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/upload", uploadRouter);

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
});

const port = process.env.PORT;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () => console.log("Server running successfully"));
  } catch (error) {
    console.log(error);
  }
};

start();
