const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Image Moderation Module using OpenRouter API
 * @param {string} apiKey - OpenRouter API key
 * @param {string} imagePath - File path or URL of the image
 * @returns {Promise<{status: string, reason: string, safe: boolean}>}
 */
async function moderateImage(apiKey, imagePath) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  if (!imagePath) {
    throw new Error("Image path or URL is required");
  }

  const model = "meta-llama/llama-3.2-11b-vision-instruct";
  const API_URL = "https://openrouter.ai/api/v1/chat/completions";

  try {
    let base64 = "";

    // --- Get Image ---
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // Load from URL
      base64 = await imageFromURL(imagePath);
    } else {
      // Load from file path
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }
      const imageBuffer = fs.readFileSync(imagePath);
      base64 = imageBuffer.toString("base64");
    }

    // --- API Call ---
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.HTTP_REFERER || "https://localhost",
        "X-Title": process.env.X_TITLE || "Image Moderator"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Return ONLY JSON: {"status":"SAFE or UNSAFE","reason":"short explanation"}. Detect nudity, violence, hate speech, and inappropriate content.'
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 100,
        temperature: 0
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }

    let text = data.choices[0].message.content;

    // Clean response
    text = text.replace(/```json|```/g, "").trim();

    const output = JSON.parse(text);

    return {
      status: output.status,
      reason: output.reason,
      safe: output.status === "SAFE"
    };
  } catch (error) {
    throw new Error(`Moderation failed: ${error.message}`);
  }
}

/**
 * Load image from URL and convert to base64
 * @param {string} url - Image URL
 * @returns {Promise<string>} Base64 encoded image
 */
async function imageFromURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (error) {
    throw new Error(`Failed to load image from URL: ${error.message}`);
  }
}

module.exports = moderateImage;
