import express from "express";
import multer from "multer";

import { handleRequest, getStatus } from "../controller/upload.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), handleRequest);

router.get("/status/:id", getStatus);

export default router;
