/**
 * @description A Microservices Nodejs Gateway
 * @author Riccardo Tartaglia
 */
"use strict";

// ENV
require("dotenv").config();

// Require the framework and instantiate it
const fastify = require("fastify")({logger: true});

//CORS
fastify.register(require("fastify-cors"), {});
fastify.register(require("./plugins/cerbero"), {});


// Run the server
const start = async () => {
  try {
    await fastify.ready()
    await fastify.cerbero.start(80, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err);
    //process.exit(1);
  }
};

// start
start();
