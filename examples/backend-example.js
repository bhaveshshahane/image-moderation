/**
 * Secure Backend Example - Express Server
 * This keeps your API key and model name hidden from the client
 * 
 * Install: npm install express multer
 * Run: node examples/backend-example.js
 */

const express = require("express");
const multer = require("multer");
const moderateImage = require("../index.js");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const API_KEY = process.env.OPENROUTER_API_KEY;
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Serve static files (demo.html)
app.use(express.static(__dirname));

/**
 * POST /api/moderate
 * 
 * Client sends:
 * {
 *   "image": "base64_string",
 *   "mimeType": "image/jpeg"
 * }
 * 
 * Server returns:
 * {
 *   "status": "SAFE" | "UNSAFE",
 *   "reason": "...",
 *   "safe": true | false
 * }
 */
app.post("/api/moderate", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        error: "Server not configured properly"
      });
    }

    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    // Convert base64 to temporary file path for the package
    // Or modify the package to accept base64 directly
    // For now, we'll create a temporary buffer approach
    
    // Create a temporary path or modify the request
    // Save base64 as temporary file
    const fs = require("fs");
    const path = require("path");
    const tmpDir = path.join(__dirname, "..", "tmp");
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpFile = path.join(tmpDir, `${Date.now()}.jpg`);
    const buffer = Buffer.from(image, "base64");
    fs.writeFileSync(tmpFile, buffer);

    // Moderate using the package
    // Model name is hidden here - only on server
    const result = await moderateImage(API_KEY, tmpFile);

    // Clean up temp file
    fs.unlinkSync(tmpFile);

    // Send response without exposing model details
    res.json({
      status: result.status,
      reason: result.reason,
      safe: result.safe
    });

  } catch (error) {
    console.error("Moderation error:", error.message);
    res.status(400).json({
      error: "Image moderation failed. Please try again."
    });
  }
});

/**
 * POST /api/moderate/file
 * For file uploads using multipart/form-data
 */
app.post("/api/moderate/file", upload.single("image"), async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        error: "Server not configured properly"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Image file is required"
      });
    }

    // Save buffer to temporary file
    const fs = require("fs");
    const path = require("path");
    const tmpDir = path.join(__dirname, "..", "tmp");
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpFile = path.join(tmpDir, `${Date.now()}.jpg`);
    fs.writeFileSync(tmpFile, req.file.buffer);

    // Moderate
    const result = await moderateImage(API_KEY, tmpFile);

    // Clean up
    fs.unlinkSync(tmpFile);

    res.json({
      status: result.status,
      reason: result.reason,
      safe: result.safe
    });

  } catch (error) {
    console.error("File moderation error:", error.message);
    res.status(400).json({
      error: "Image moderation failed. Please try again."
    });
  }
});

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Image moderation service is running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Secure Moderation Server running on http://localhost:${PORT}`);
  console.log(`📝 API Key configured: ${API_KEY ? "✅ Yes" : "❌ No"}`);
  console.log(`\n✨ Open demo.html and set backend URL to http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/moderate (JSON with base64 image)`);
  console.log(`  POST /api/moderate/file (multipart file upload)`);
  console.log(`  GET  /api/health (health check)`);
});
