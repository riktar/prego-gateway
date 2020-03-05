/**
 * @description Cerbero - Simple HTTP Gateway
 * @author Riccardo Tartaglia
 */
"use strict";

const fp = require("fastify-plugin");
const YAML = require("yaml");
const path = require("path");
const fs = require("fs");
const { pathToRegexp } = require("path-to-regexp");
const FastProxy = require("fast-proxy");

module.exports = fp(async function(fastify, opts) {
  class Cerbero {
    /**
     * Constructor
     */
    constructor() {
      this.proxy = [];
      this.rules = this.parseRules();
    }

    getProxy(base) {
      if (this.proxy[base]) {
        return this.proxy[base];
      } else {
        // create a proxy instance
        const { proxy } = FastProxy({
          base: base,
          undici: true,
          rejectUnauthorized: false
        });
        this.proxy[base] = proxy;
        return proxy;
      }
    }

    /**
     * Deny a request throwing an error
     * @param code
     */
    deny(code = "BAD_GATEWAY") {
      throw new Error(code);
    }

    /**
     * Continue a request validation
     * @param data
     */
    continue(data = "OK") {
      /*...*/
    }

    /**
     * Decorate fastify instance
     * @param name
     * @param fn
     */
    decorate(name, fn) {
      fastify.decorate(name, fn);
    }

    /**
     * Start a new server
     * @param port
     * @param host
     * @returns {Promise<void>}
     */
    async start(port, host) {
      await fastify.listen(port, host);
    }

    /**
     * Parse thee yml files in array
     * @returns {[]}
     */
    parseRules() {
      const allFiles = [];
      const allRules = [];
      const dir = `${__dirname}/rules`;

      const files = fs.readdirSync(dir).map(f => path.join(dir, f));
      allFiles.push(...files);
      allFiles.forEach(file => {
        const ext = file.split(".");
        if (ext[ext.length - 1] === "yml" || ext[ext.length - 1] === "yaml") {
          const fileStream = fs.readFileSync(file, "utf8");
          const oYaml = YAML.parse(fileStream);
          allRules.push(oYaml);
        }
      });
      return allRules;
    }

    /**
     * Try to match a proxy rule
     * @param request
     * @returns {boolean[]}
     */
    match(request) {
      const { headers } = request;
      const rules = fastify.cerbero.rules;
      const [host, port = 80] = headers.host.split(":");
      const rule = rules.find(rule => rule.listener.host === host);
      if (!rule) throw new Error("NOT_FOUND");

      // check if the url match
      let pureUrl = false;
      let checkPath = false;
      let route = false;
      for (let key in rule.route) {
        route = rule.route[key];
        const regex = route.regex ? route.regex : "/(.*)";
        const prefix = route.prefix ? route.prefix : "";
        const regexp = pathToRegexp(regex);
        if (prefix.length > 0) {
          pureUrl = request.req.url.replace(prefix, "");
          if (pureUrl.length === request.req.url.length) continue;
        } else {
          pureUrl = request.req.url;
        }
        checkPath = regexp.exec(pureUrl);
        if (checkPath) {
          break;
        }
      }
      if (!route) throw new Error("NOT_FOUND");
      if (!checkPath) throw new Error("NOT_FOUND");

      return [route, pureUrl];
    }

    /**
     * Invoke a plugin
     * @param plugin
     * @param request
     * @param opts
     */
    invoke(plugin, request, reply, opts) {
      return fastify[plugin](request, reply, opts);
    }

    errorManager(e, reply) {
      reply.type("text/html");
      let toSend = [];
      switch (e.message) {
        case "NOT_FOUND":
          toSend = [
            `<h1 style="text-align: center">Resource Not Found</h1><p style="text-align: center">Cerbero v0.0.1</p>`,
            404
          ];
          break;
        case "BAD_GATEWAY":
          toSend = [
            `<h1 style="text-align: center">Bad Gateway</h1><p style="text-align: center">Cerbero v0.0.1</p>`,
            502
          ];
          break;
        case "FORBIDDEN":
          toSend = [
            `<h1 style="text-align: center">Bad Gateway</h1><p style="text-align: center">Cerbero v0.0.1</p>`,
            403
          ];
          break;
      }
      reply.send(...toSend);
    }
  }

  /**
   * Accepts all content type
   */
  fastify.addContentTypeParser("*", function(req, done) {
    done();
  });

  /**
   * When a route of fastify not found, attempt to proxy
   */
  fastify.setNotFoundHandler((request, reply) => {
    const { cerbero } = fastify;
    try {
      const [route, pureUrl] = cerbero.match(request);
      const { handlers = [] } = route;

      // call preHandler
      if (handlers.length > 0) {
        for (let key in handlers) {
          let { plugin = null, opts = null } = handlers[key];
          if (plugin) {
            cerbero.invoke(plugin, request, reply, opts);
          }
        }
      }

      // pass the body in the request
      if (request.method !== "HEAD" && request.method !== "GET") {
        request.req.body = request.body;
      }
      // proxy the request
      cerbero.getProxy(route.target)(request.req, reply.res, `${pureUrl}`);
    } catch (e) {
      cerbero.errorManager(e, reply);
    }
  });

  // decorate fastify
  fastify.decorate("cerbero", new Cerbero());
});
