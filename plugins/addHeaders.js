/**
 * @description Foo - A Prego Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

module.exports = async function({ prego }) {
  async function main(request, opts) {
    for (let key in opts) {
      request.req.headers[key] = opts[key];
    }
  }
  prego.decorate("addHeaders", main);
};
