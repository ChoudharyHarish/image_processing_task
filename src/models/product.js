import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  serialNumber: Number,
  productName: String,
  requestId: String,
  inputImageUrls: [String],
  outputImageUrls: [String],
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
});

export default mongoose.model("Product", productSchema);
