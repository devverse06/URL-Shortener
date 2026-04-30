const ShortCodeStrategy = require("./shortCode.strategy");
const crypto = require("crypto");

class MD5Strategy extends ShortCodeStrategy {
  generate() {
    // Generate MD5 hash from current timestamp + random value
    const hash = crypto
      .createHash("md5")
      .update(Date.now().toString() + Math.random().toString())
      .digest("hex");
    
    // Return first 7 characters for short code
    return hash.substring(0, 7);
  }
}

module.exports = MD5Strategy;
