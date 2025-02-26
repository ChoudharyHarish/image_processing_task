export default async function validateCSV(row) {
  const requiredFields = ["SerialNumber", "ProductName", "InputImageUrls"];
  const missing = requiredFields.filter((field) => !row.includes(field));
  if (missing.length > 0) {
    throw new Error(`${missing.join(", ")}`);
  }
}
