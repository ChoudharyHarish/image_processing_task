import { Queue } from "bullmq";
import fs from "fs";
import csvParser from "csv-parser";

import Request from "../models/request.js";
import Product from "../models/product.js";
import { redisConfig } from "../connection/redis.js";

import validateCsv from "../services/validateCsv.js";

const imageQueue = new Queue("imageQueue", { connection: redisConfig });

const handleRequest = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Please upload a file" });

  const { webhookUrl } = req.body;

  const results = [];
  const stream = fs
    .createReadStream(req.file.path)
    .pipe(csvParser())
    .on("headers", async (headers) => {
      try {
        await validateCsv(headers);
      } catch (err) {
        stream.destroy();
        return res
          .status(400)
          .json({ message: `Validation failed : Missing ${err.message}` });
      }
    })
    .on("data", async (data) => {
      if (!data.SerialNumber || !data.ProductName || !data.InputImageUrls) {
        console.log(`Invalid row skipped: ${JSON.stringify(data)}`);
        return;
      }
      results.push(data);
    })
    .on("end", async () => {
      const requestId = new Date().getTime().toString();
      const request = await Request.create({
        requestId,
        status: "pending",
        webhookUrl,
      });

      try {
        await Promise.all(
          results.map(async (row) => {
            const { SerialNumber, ProductName, InputImageUrls } = row;
            const inputUrls = InputImageUrls.split(",").map((url) =>
              url.trim()
            );

            const product = await Product.create({
              requestId,
              serialNumber: SerialNumber,
              productName: ProductName,
              inputImageUrls: inputUrls,
              status: "pending",
            });

            await Promise.all(
              inputUrls.map((url) =>
                imageQueue.add("processImage", { productId: product._id, url })
              )
            );

            request.products.push(product._id);
          })
        );

        request.status = "processing";
        await request.save();
        res.json({ message: "Request created successfully", requestId });
      } catch (err) {
        console.error("Error during processing:", err.message);
        return res.status(500).json({ message: "Internal server error" });
      } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error(`Failed to delete file: ${err.message}`);
        });
      }
    });
};

const getStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await Request.findOne({ requestId: id }).populate(
      "products"
    );
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    const statusDetails = {
      requestId: request.requestId,
      status: request.status,
      createdAt: request.createdAt,
      products: request.products.map((product) => ({
        productName: product.productName,
        status: product.status,
      })),
    };

    res.json(statusDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

export { handleRequest, getStatus };
