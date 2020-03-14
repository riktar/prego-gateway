/**
 * @description Foo - A Prego Plugin
 * @author Riccardo Tartaglia
 */
"use strict";
const axios = require("axios");

module.exports = async function({ prego }) {
  async function joinTarget(targets) {
    let response = {};
    for (let key in targets) {
      const target = targets[key];
      let toAggr = {};
      let { data } = await axios({ method: target.method, url: target.url });
      if (target.mapping) {
        toAggr[target.mapping] = { ...data };
      } else {
        toAggr = { ...data };
      }
      response = { ...response, ...toAggr };
    }
    return response;
  }

  async function main(request, opts) {
    return await joinTarget(opts.targets);
  }

  prego.decorate("aggregate", main);
};
