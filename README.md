# @cosmicvelocity/cache
Cache library that can be used in browsers.

## Install
Using npm

``npm install @cosmicvelocity/cache``


## Example

```typescript
// create cache object.
const cache = CacheFactory.create("localstorage");

// set
await cache.set("foo", "Hello !!");
await cache.set("bar", "Timeout", 500); // Invalid after 500ms.

// get
await cache.get("foo");

// delete
await cache.delete("foo");
```
