# 🖼️ Image Moderation Package

An npm package for AI-powered image moderation using OpenRouter API. Detect nudity, violence, hate speech, and inappropriate content in images.

## Features

✅ **AI-Powered Detection** - Uses Claude/Llama vision models via OpenRouter  
✅ **Easy to Use** - Simple API with minimal setup  
✅ **Flexible Input** - Moderate images from file paths or URLs  
✅ **Free Models** - Uses OpenRouter's free vision models  
✅ **Environment Configuration** - Load settings from `.env` file  
✅ **Production Ready** - Error handling and validation included  

## Installation

```bash
npm install image-moderation
```

## Setup

### 1. Get OpenRouter API Key

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Create .env File

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
OPENROUTER_API_KEY=your-api-key-here
HTTP_REFERER=https://your-domain.com
X_TITLE=Image Moderator
```

## Usage

### ⚠️ Security: Backend is Recommended

**NEVER expose your API key or model name to the client!**

#### ✅ Secure (Backend)
API key and model are kept on server, hidden from users.

#### ❌ Not Secure (Client-side)
API key visible in browser, model name exposed to users.

### Secure Backend Implementation (Recommended)

```javascript
const express = require("express");
const moderateImage = require("image-moderation");
require("dotenv").config();

const app = express();
const API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/api/moderate", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    // API key and model name are hidden from client
    const result = await moderateImage(API_KEY, imageUrl);

    res.json({
      status: result.status,
      reason: result.reason,
      safe: result.safe
      // ✅ Model name NOT exposed to client
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000);
```

**See `examples/backend-example.js` for complete Express server with file upload & multipart support.**

### Basic Usage (Node.js)
  "https://example.com/image.jpg"
);
```

### In Backend/Express

```javascript
const express = require("express");
const moderateImage = require("image-moderation");
require("dotenv").config();

const app = express();

app.post("/api/moderate", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    const result = await moderateImage(apiKey, imageUrl);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000);
```

## API Reference

### `moderateImage(apiKey, imagePath)`

Analyzes an image for inappropriate content.

**Parameters:**
- `apiKey` (string, required) - OpenRouter API key
- `imagePath` (string, required) - File path or URL to image

**Returns:**
```javascript
Promise<{
  status: "SAFE" | "UNSAFE",
  reason: string,
  safe: boolean
}>
```

**Throws:**
- Error if API key is missing
- Error if image is not found
- Error if API call fails

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | - | **Required** - Your OpenRouter API key |

| `HTTP_REFERER` | https://localhost | HTTP referer for tracking |
| `X_TITLE` | Image Moderator | Title for API tracking |



## Examples

### Example 1: Batch Moderate Images

```javascript
const moderateImage = require("image-moderation");
const fs = require("fs");
const apiKey = process.env.OPENROUTER_API_KEY;

async function moderateBatch(imageDir) {
  const files = fs.readdirSync(imageDir);

  for (const file of files) {
    const result = await moderateImage(apiKey, `${imageDir}/${file}`);
    console.log(`${file}: ${result.status}`);
  }
}
```

### Example 2: Web Upload Handler

```javascript
const express = require("express");
const multer = require("multer");
const moderateImage = require("image-moderation");

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("image"), async (req, res) => {
  const result = await moderateImage(
    process.env.OPENROUTER_API_KEY,
    req.file.path
  );

  if (result.safe) {
    // Process image
    res.json({ success: true });
  } else {
    // Reject image
    res.json({ success: false, reason: result.reason });
  }
});
```

## Demo

Open `examples/demo.html` in your browser to see a web-based demo with a visual interface.

## Running Examples

```bash
node examples/usage.js
```

## Error Handling

```javascript
try {
  const result = await moderateImage(apiKey, imagePath);
} catch (error) {
  console.error("Moderation failed:", error.message);
  // Handle error appropriately
}
```

## Common Errors

| Error | Solution |
|-------|----------|
| API key is required | Set `OPENROUTER_API_KEY` in .env |
| Image file not found | Check image path exists |
| Image load failed | Verify image URL is accessible |
| API Error: 401 | Check API key is valid |

## License

ISC

## Support

For issues and support, visit: https://github.com/bhaveshshahane/image-moderation

## Contributing

Feel free to submit issues and enhancement requests!