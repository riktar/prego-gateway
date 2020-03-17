# Deploy a plugin

## What is a plugin?

Plugins in Prego are Javascript functions which allow a validation or a computation of a request, before carrying out a route.

_**Basically a plugin is a JavaScript module.**_

For deploy a new plugin you must create a new _`.js`_ file in the **`plugins`** directory

## Example

### Deploy the plugin "foo"

Create the file `foo.js` in the `plugins` folder and copy this in it

```javascript
/**
 * @description Foo - A Prego Plugin
 * @author Riccardo Tartaglia
 */
"use strict";

module.exports = async function({ prego }) {
  async function main(request, reply, opts) {
    
    /* your code */
    
    // if you want deny the request
    // prego.deny()
  }
  
  // use prego decorate for naming the plugins
  prego.decorate("foo", main);
};
```

Now in your endpoint set an handler that use this plugin

```yaml
listener:
  host: "mysite.com"
route:
  - prefix: "/service1"
    regex: "/(.*)"
    target: "http://127.0.0.1:3000"
    handlers:
      - plugin: 'foo'
        opts:
          params1: 'bar'
```

**and you are done!**

