/**
 * @description Foo - A Cerbero Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

// ENV
require("dotenv").config();

module.exports = async function({ cerbero }) {
  function main(request, reply, opts) {
    /* ... */
    // if you want deny the request
    // cerbero.deny()
  }
  cerbero.decorate("foo", main);
};
