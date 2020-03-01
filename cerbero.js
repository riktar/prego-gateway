/**
 * @description Ruler Class
 * @author Riccardo Tartaglia
 */
"use strict";

// ENV
require("dotenv").config();

const fp = require("fastify-plugin");
const YAML = require('yaml')
const path = require('path');
const fs = require('fs');
const {pathToRegexp, match, parse, compile} = require("path-to-regexp");


module.exports = fp(async function (fastify, opts) {
  class Cerbero {

    constructor() {
      this.rules = this.parseRules()
    }

    async start(port, host) {
      await fastify.listen(port, host);
    }

    parseRules() {
      const allFiles = []
      const allRules = []
      const dir = `${__dirname}/${process.env.RULES_FOLDER}`

      const files = fs.readdirSync(dir).map(f => path.join(dir, f))
      allFiles.push(...files)
      allFiles.forEach(file => {
        const ext = file.split('.')
        if (ext[ext.length - 1] === 'yml' || ext[ext.length - 1] === 'yaml') {
          const fileStream = fs.readFileSync(file, 'utf8')
          const oYaml = YAML.parse(fileStream)
          allRules.push(oYaml)
        }
      })
      return allRules
    }

    match(request) {
      const {headers} = request
      const rules = fastify.cerbero.rules;
      const [host, port = 80] = headers.host.split(':')
      return rules.find(rule => rule.listener.host === host)
    }
  }

  fastify.decorate('cerbero', new Cerbero())

  fastify.setNotFoundHandler((request, reply) => {
    try {
      // check if found a rule for this host
      const rule = fastify.cerbero.match(request)
      if (!rule) throw new Error()

      // check if the url match
      const regex = rule.route.regex ? rule.route.regex : '/(.*)'
      const regexp = pathToRegexp(regex)
      const checkPath = regexp.exec(request.req.url);
      if (!checkPath) throw new Error()

      const {proxy} = require('fast-proxy')({
        base: rule.route.target
      })

      proxy(request.req, reply.res, request.req.url, {})
    } catch (e) {
      console.log(e.message)
      reply.type('text/html')
      reply.send(`<h1 style="text-align: center">Resource Not Found</h1><p style="text-align: center">Cerbero v0.0.1</p>`, 404)
    }
  })
});
