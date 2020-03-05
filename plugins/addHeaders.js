/**
 * @description Foo - A Cerbero Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

module.exports = async function({ cerbero }) {
  function main(request, reply, opts) {
    for (let key in opts) {
      request.req.headers[key] = opts[key];
    }
  }
  cerbero.decorate("addHeaders", main);
};
