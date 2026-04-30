const express = require("express");

require("dotenv").config();

const urlRoutes = require("./routes/url.routes");
const connectMongo = require("./config/mongo");
const connectRedis = require("./config/redis");

const app = express();

app.use(express.json());

// connect DBs
connectMongo();
connectRedis();

// routes
app.use("/", urlRoutes);

module.exports = app;