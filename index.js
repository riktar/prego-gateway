/**
 * @description A Microservices Nodejs Gateway
 * @author Riccardo Tartaglia
 */
"use strict";

// ENV
require("dotenv").config();

const AutoLoad = require("fastify-autoload");
const path = require("path");

const logger =
  process.env.DEBUG === "TRUE"
    ? { prettyPrint: true }
    : { file: "./logs/cerbero.log" };

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger
});

fastify.register(require("fastify-cors"), {});
fastify.register(require("./cerbero"), {});
fastify.register(AutoLoad, {
  dir: path.join(__dirname + "/", "plugins")
});

// Run the server
const start = async () => {
  try {
    await fastify.ready();
    await fastify.cerbero.start(
      process.env.PORT ? process.env.PORT : 80,
      process.env.HOST ? process.env.HOST : '0.0.0.0',
    );
  } catch (err) {
    fastify.log.error(err);
    //process.exit(1);
  }
};

// start
start();
