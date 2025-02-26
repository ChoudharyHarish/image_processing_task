# Image Processing System

This project is an image processing system that handles CSV uploads, validates data, processes images using a queue system, and triggers a webhook upon completion.

## Prerequisites

Ensure you have the following installed:
- Node.js (v16 or later)
- MongoDB
- Redis
- `brew` (for macOS users to manage Redis)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/image-processing.git
   cd image-processing
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up the `.env` file:
   ```sh
   cp .env.example .env
   ```
   Fill in the required environment variables in the `.env` file:
   ```env
   MONGO_URI=mongodb://localhost:27017/image-processing
   REDIS_URL=redis://localhost:6379
   PORT=5000
   ```

## Running the Project Locally

### Start MongoDB
Ensure MongoDB is running:
```sh
mongod --dbpath=/data/db
```

### Start Redis
Start Redis using Homebrew (for macOS):
```sh
brew services start redis
```
To stop Redis:
```sh
brew services stop redis
```

### Start the Server
```sh
npm start
```
The server will be running at `http://localhost:5000`.

## Testing the Project

### 1. Upload CSV File
Use Postman or `cURL` to upload a CSV file:
```sh
curl -X POST http://localhost:5000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/file.csv"
```

Expected response:
```json
{
  "message": "Request created successfully",
  "requestId": "1698765432109"
}
```

### 2. Check Processing Status
```sh
curl -X GET http://localhost:5000/status/1698765432109
```

### 3. Webhook Testing
The webhook will automatically trigger when all images are processed. To test manually, set up a local webhook endpoint:
```sh
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{"requestId": "1698765432109", "status": "completed"}'
```

Expected console log:
```sh
Webhook received: { requestId: '1698765432109', status: 'completed' }
```

## Additional Commands
- **View Logs**: `npm run logs`
- **Stop Server**: `Ctrl + C`

## Troubleshooting
- If Redis is not running: `brew services restart redis`
- If MongoDB connection fails: Verify `MONGO_URI` in `.env` and restart MongoDB.

## License
This project is licensed under the MIT License.
