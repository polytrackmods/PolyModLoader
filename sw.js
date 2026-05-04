"use strict";

/** @type {Map<string, string>} */
const idMap = new Map();
/** @type {Map<string, Map<string, Response>>} */
const vfs = new Map();

self.addEventListener("message", (event) => {
    const data = event.data;
    switch (data.type) {
        case "SKIP_WAITING": {
            self.skipWaiting();
        }
        case "REGISTER_MOD": {
            const { modId, baseUrl } = data;
            idMap.set(modId, baseUrl);
            vfs.set(modId, new Map());
        }
        default: break;
    }
});
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
    console.log("------------------------------");
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    console.log(`Fetching: ${event.request.url} --- (stripped: ${pathname})`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        console.log("Skipping non http/https protocol fetch");
        return;
    }
    if (!pathname.startsWith("/mods/")) {
        console.log("Prefix not found, falling back to default fetch");
        return;
    }
    console.log("Prefix found, fetching from VFS");
    event.respondWith(fetchModResource(event.request, pathname));
});

/**
 * @param {Request} request 
 * @param {string} pathname
 */
async function fetchModResource(request, pathname) {
    const [,, modId, ...rest] = pathname.split("/");
    const path = rest.join("/");
    console.log(`Getting ${modId} -> ${path}`);
    const baseUrl = idMap.get(modId);
    const pathMap = vfs.get(modId);
    if (baseUrl === undefined) {
        console.error(`Mod id ${modId} not registered yet`);
        return new Response(`Unregistered mod id: ${modId}`, {
            status: 404,
            headers: { "Content-Type": "text/plain" },
        });
    }

    const obj = pathMap.get(path);
    if (obj !== undefined) {
        console.log("Fetched from VFS:", obj);
        return obj.clone();
    }
    console.log(`Path not in VFS, falling back to browser fetch: ${baseUrl}/${path}`);
    const upstream = await fetch(`${baseUrl}/${path}`);
    console.log("Browser fetch result:", upstream);
    const body = await upstream.arrayBuffer();
    const headers = upstream.headers;

    const rerouted = new Response(body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
    });
    console.log("Rerouted:", rerouted);
    // Give a chance for next attempts to re-fetch
    if (upstream.ok) pathMap.set(path, rerouted.clone());
    return rerouted;
}
