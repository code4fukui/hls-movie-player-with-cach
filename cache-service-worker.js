self.addEventListener("install", (event) => {
  console.log("worker-install")
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then((response) => {
          /* // if cache
          const responseClone = response.clone();
          caches.open("v1").then((cache) => {
            cache.put(event.request, responseClone);
          });
          */
          return response;
        })
      }
    })
  );
});

const postMessage = async (data) => {
    const cs = await clients.matchAll({
      includeUncontrolled: true,
    });
    return Promise.all(cs.map(i => i.postMessage(data)));
};

onmessage = async (e) => {
  console.log(e);
  const type = e.data.type;
  const id = e.data.id;
  /*
  if (!e.clientId) return;
  const client = await clients.get(e.clientId);
  if (!client) return;
  */

  if (type == "addCache") {
    const url = e.data.data;
    const cache = await caches.open("v1");
    try {
      if (!await cache.match(new Request(url))) {
        await cache.add(url);
      }
      await postMessage({ type, id, result: true });
    } catch (e) {
      await postMessage({ type, id, result: false, err: e });
    }
  } else if (type == "checkCache") {
    const urls = e.data.data;
    const cache = await caches.open("v1");
    for (const url of urls) {
      if (!await cache.match(new Request(url))) {
        await postMessage({ type, id, result: false });
        break;
      }
    }
    await postMessage({ type, id, result: true });
  } else if (type == "removeCache") {
    const urls = e.data.data;
    const cache = await caches.open("v1");
    for (const url of urls) {
      await cache.delete(new Request(url));
    }
    await postMessage({ type, id, result: true });
  } else if (type == "clearCache") {
    const keys = await caches.keys();
    await Promise.all(keys.map(i => caches.delete(i)));
    console.log("cache cleared");
    await postMessage({ type, id, result: true });
  }
};
