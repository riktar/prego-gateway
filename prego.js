/**
 * @description Prego - Fast and Pluggable API Gateway
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
  /**
   * Accepts all content type
   */
  fastify.addContentTypeParser("*", function(req, done) {
    done();
  });

  class Prego {
    /**
     * Constructor
     */
    constructor() {
      this.proxy = [];
      this.rules = this.parseRules();
      this.setNotFoundHook();
    }

    getProxy(base) {
      if (this.proxy[base]) {
        return this.proxy[base];
      } else {
        // create a proxy instance
        const { proxy } = FastProxy({
          base: base,
          undici: true,
          rejectUnauthorized: false,
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
      const rules = fastify.prego.rules;
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

    errorManager(e) {
      let toSend = [];
      switch (e.message) {
        case "NOT_FOUND":
          toSend = [
            `<h1 style="text-align: center">Resource Not Found</h1><p style="text-align: center">Prego API Gateway</p>`,
            404
          ];
          break;
        case "BAD_GATEWAY":
          toSend = [
            `<h1 style="text-align: center">Bad Gateway</h1><p style="text-align: center">Prego API Gateway</p>`,
            502
          ];
          break;
        case "FORBIDDEN":
          toSend = [
            `<h1 style="text-align: center">Forbidden</h1><p style="text-align: center">Prego API Gateway</p>`,
            403
          ];
          break;
        default:
          toSend = [
            `<h1 style="text-align: center">Bad Gateway</h1><p style="text-align: center">${e.message}</p><p style="text-align: center">Prego API Gateway</p>`,
            502
          ];
          break;
      }
      return { error: toSend };
    }

    /**
     * Apply all the handlers of the route found
     * @param route
     * @param request
     * @returns {Promise<{}>}
     */
    async applyHandlers(route, request) {
      const { handlers = [] } = route;
      let toResponse = {};
      if (handlers.length > 0) {
        for (let key in handlers) {
          let { plugin = null, opts = null } = handlers[key];
          if (plugin) {
            let data = await fastify[plugin](request, opts);
            if (data) {
              toResponse = { ...toResponse, ...data };
            }
          }
        }
      }
      return toResponse;
    }

    /**
     * When a route of fastify not found, attempt to proxy
     */
    setNotFoundHook() {
      fastify.setNotFoundHandler(async (request, reply) => {
        try {
          // find a valid route by the Request
          const [route, pureUrl] = this.match(request);
          // apply all the handlers and elaborate a possiby Response
          let toResponse = await this.applyHandlers(route, request);
          // pass the body in the Request
          if (request.method !== "HEAD" && request.method !== "GET") {
            request.req.body = request.body;
          }
          // Proxy if Route has a target
          if (route.target) {
            this.getProxy(route.target)(request.req, reply.res, `${pureUrl}`);
            return;
          }
          // else return the elaborate response
          reply.send(toResponse);
        } catch (e) {
          let { error } = this.errorManager(e);
          reply.type("text/html");
          reply.send(...error);
          return;
        }
      });
    }
  }

  // decorate fastify
  fastify.decorate("prego", new Prego());
});
