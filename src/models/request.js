import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  webhookUrl: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Request", RequestSchema);
