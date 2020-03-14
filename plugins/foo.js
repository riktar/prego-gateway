/**
 * @description Foo - A Prego Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

module.exports = async function({ prego }) {
  async function main(request, reply, opts) {
    /* ... */
    // if you want deny the request
    // prego.deny()
  }
  prego.decorate("foo", main);
};
