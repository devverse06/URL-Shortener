const Url = require("../models/url.model");

class UrlRepository {
  async create(data) {
    return Url.create(data);
  }

  async findByCode(code) {
    return Url.findOne({ shortCode: code });
  }

  async incrementClicks(code) {
    return Url.updateOne(
      { shortCode: code },
      { $inc: { clickCount: 1 } }
    );
  }
}

module.exports = new UrlRepository();