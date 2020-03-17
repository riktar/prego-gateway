# Define an endpoint

Defining an endpoint is a piece of cake!

In Prego, for deploy a new endpoint, you must create a new file .yaml in the `rules` directory.

## Here some example

### Basic

Create `example.yaml` in the `rules` directory and copy this in it:

```yaml
listener:
  host: "mysite.com"
route:
  - regex: "/(.*)"
    target: "http://127.0.0.1:3000"
```

{% hint style="info" %}
 This example deploy a listener to **`mysite.com`**that do a proxy to the service available on **`http://127.0.0.1:3000`**
{% endhint %}

{% hint style="info" %}
The **`host`** and **`regex`** fields in the .yaml validate the host and the path of the request and routing it to the right proxy!
{% endhint %}

### Endpoint with prefix

```yaml
listener:
  host: "mysite.com"
route:
  - regex: "/(.*)"
    prefix: "/service1"
    target: "http://127.0.0.1:3000"
```

{% hint style="info" %}
 This example deploy a listener to **`mysite.com/service1`**and do a proxy to the service available on**`http://127.0.0.1:3000`**
{% endhint %}

### Endpoint with custom path

```yaml
listener:
  host: "mysite.com"
route:
  - regex: "/mypath/very/custom"
    target: "http://127.0.0.1:3000/api/v1/something"
```

{% hint style="info" %}
 This example deploy a listener to **`mysite.com/mypath/very/custom`**and do a proxy to the service available on**`http://127.0.0.1:3000/api/v1/something`**
{% endhint %}

