# Using an handler

## What is an handler?

Handlers in Prego are Javascript functions which allow a validation or a computation of a request, before carrying out a route.

_**Basically an handler is a Prego plugin. \(see Plugins section for more info\)**_

Prego for now has 1 native plugin that you can use:

* **addHeaders**

## Examples

### addHeaders

`addHeaders` adding headers to the original request

```yaml
listener:
  host: "mysite.com"
route:
  - prefix: "/service1"
    regex: "/(.*)"
    target: "http://127.0.0.1:3000"
    handlers:
      - plugin: 'addHeaders'
        opts:
          x-my-header: 'ok'
```

{% hint style="info" %}
In this example, in every request that match to **`mysite.com`** has added the **`x-my-header`** header with the value **`ok`**
{% endhint %}

