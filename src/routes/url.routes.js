const express = require("express");
const UrlService = require("../services/url.service");
const Base62Strategy = require("../strategies/base62.strategy");
const MD5Strategy = require("../strategies/md5.strategy");
const UrlController = require("../controllers/url.controller");

const router = express.Router();

// Strategy Pattern: Swap strategies by changing one line
// const service = new UrlService(new Base62Strategy());
const service = new UrlService(new MD5Strategy());
const controller = new UrlController(service);

router.post("/shorten", controller.shorten);
router.get("/:code", controller.redirect);

module.exports = router;