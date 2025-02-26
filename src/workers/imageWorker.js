import { Worker } from "bullmq";
import Product from "../models/product.js";
import Request from "../models/request.js";
import processImage from "../services/imageProcessor.js";
import axios from "axios";
import { redisConfig } from "../connection/redis.js";

const worker = new Worker(
  "imageQueue",
  async (job) => {
    try {
      console.log(
        ` Processing job: ${job.id}, Product ID: ${job.data.productId}`
      );
      const { productId, url } = job.data;
      const product = await Product.findById(productId);
      const outputUrl = await processImage(url);

      product.outputImageUrls.push(outputUrl);
      if (product.outputImageUrls.length === product.inputImageUrls.length) {
        product.status = "completed";
      }
      await product.save();

      const allCompleted = await Product.countDocuments({
        requestId: product.requestId,
        status: "completed",
      });
      const totalProducts = await Product.countDocuments({
        requestId: product.requestId,
      });

      if (allCompleted === totalProducts) {
        const request = await Request.findOne({ requestId: product.requestId });
        request.status = "completed";
        await request.save();

        if (request.webhookUrl) {
          const response = await axios.post(request.webhookUrl, {
            requestId: request.requestId,
            status: "completed",
          });
          console.log(response.data);
        }
        console.log(`✅ Request ${product.requestId} completed.`);
      }

      job.updateProgress(100);
      return outputUrl;
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig,
  }
);

console.log("Worker started!");

export default worker;
