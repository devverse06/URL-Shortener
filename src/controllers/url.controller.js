class UrlController {
  constructor(urlService) {
    this.urlService = urlService;
  }

  shorten = async (req, res) => {
    const { originalUrl } = req.body;
    const shortCode = await this.urlService.shorten(originalUrl);

    res.json({
      shortUrl: `http://localhost:3000/${shortCode}`
    });
  };

  redirect = async (req, res) => {
    const originalUrl = await this.urlService.resolve(req.params.code);
    if (!originalUrl) return res.status(404).json({ message: "Not found" });

    res.redirect(originalUrl);
  };
}

module.exports = UrlController;
