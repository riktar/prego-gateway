/**
 * @description Foo - A Cerbero Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

// ENV
require("dotenv").config();

const fp = require("fastify-plugin");
module.exports = fp(async function(fastify, opts) {
  function main(request, opts) {
    console.log("you call me!", opts);
  }
  fastify.decorate("foo", main);
});
