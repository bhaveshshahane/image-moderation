/**
 * Node.js Example - How to use the image-moderation package
 * 
 * Run with: node examples/usage.js
 */

const moderateImage = require("../index.js");
require("dotenv").config();

async function main() {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY not found in .env file. Please set it up."
      );
    }

    // Example 1: Moderate an image from a file path
    console.log("📸 Moderating image from file...\n");
    const result1 = await moderateImage(
      apiKey,
      "./examples/sample-image.jpg" // Replace with your image path
    );

    console.log("Result:");
    console.log(`  Status: ${result1.status}`);
    console.log(`  Safe: ${result1.safe}`);
    console.log(`  Reason: ${result1.reason}\n`);

    // Example 2: Moderate an image from URL
    console.log("🌐 Moderating image from URL...\n");
    const result2 = await moderateImage(
      apiKey,
      "https://example.com/image.jpg" // Replace with actual image URL
    );

    console.log("Result:");
    console.log(`  Status: ${result2.status}`);
    console.log(`  Safe: ${result2.safe}`);
    console.log(`  Reason: ${result2.reason}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Uncomment to run:
// main();

console.log("✅ Example created!");
console.log("\n📝 To use this package:\n");
console.log("1. Install dependencies: npm install");
console.log("2. Create a .env file with your OpenRouter API key");
console.log("3. Import and use:");
console.log("   const moderateImage = require('image-moderation');");
console.log("   const result = await moderateImage(apiKey, imagePath);");
