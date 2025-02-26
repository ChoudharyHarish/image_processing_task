import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export default async function processImage(imageUrl) {
  const image = await axios({ url: imageUrl, responseType: "arraybuffer" });
  const buffer = Buffer.from(image.data, "binary");
  const outputFilename = `${uuidv4()}.jpeg`;
  const outputPath = path.join("uploads", outputFilename);
  await sharp(buffer).jpeg({ quality: 50 }).toFile(outputPath);
  const outputUrl = `http://localhost:${process.env.PORT}/uploads/${outputFilename}`;
  return outputUrl;
}
