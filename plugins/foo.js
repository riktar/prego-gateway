/**
 * @description Foo - A Cerbero Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

module.exports = async function({ cerbero }) {
  async function main(request, reply, opts) {
    /* ... */
    // if you want deny the request
    // cerbero.deny()
  }
  cerbero.decorate("foo", main);
};
