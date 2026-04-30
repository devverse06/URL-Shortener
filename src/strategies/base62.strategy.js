const ShortCodeStrategy = require("./shortCode.strategy");
const { nanoid } = require("nanoid");

class Base62Strategy extends ShortCodeStrategy {
  generate() {
    return nanoid(7); // short & URL-safe
  }
}

module.exports = Base62Strategy;
