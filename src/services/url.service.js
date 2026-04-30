const urlRepository = require("../repositories/url.repository");
const { redisClient } = require("../config/redis");

class UrlService {
  constructor(shortCodeStrategy) {
    this.shortCodeStrategy = shortCodeStrategy;
  }

  async shorten(originalUrl) {
    const shortCode = this.shortCodeStrategy.generate();

    const url = await urlRepository.create({
      originalUrl,
      shortCode
    });

    await redisClient.set(shortCode, originalUrl);

    return shortCode;
  }

  async resolve(shortCode) {
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) {
      await urlRepository.incrementClicks(shortCode);
      return cachedUrl;
    }

    const url = await urlRepository.findByCode(shortCode);
    if (!url) return null;

    await redisClient.set(shortCode, url.originalUrl);
    await urlRepository.incrementClicks(shortCode);
    return url.originalUrl;
  }
}

module.exports = UrlService;
