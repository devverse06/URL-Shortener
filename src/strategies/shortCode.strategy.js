// LLD point: Behavior contract, not implementation

class ShortCodeStrategy {
  generate() {
    throw new Error("generate() must be implemented");
  }
}

module.exports = ShortCodeStrategy;