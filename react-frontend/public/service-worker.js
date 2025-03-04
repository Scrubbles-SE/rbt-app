/* eslint-disable no-restricted-globals */
const CACHE_NAME = "rbt-cache-v1";
const API_CACHE = "rbt-api-cache";

// Assets that need to be available offline
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(
                        (name) =>
                            name !== CACHE_NAME &&
                            name !== API_CACHE
                    )
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
    // Don't cache or intercept websocket connections
    if (
        event.request.cache === "only-if-cached" &&
        event.request.mode !== "same-origin"
    ) {
        return;
    }

    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }

    const { request } = event;

    // API requests strategy
    if (request.url.includes("/api/")) {
        event.respondWith(
            fetch(request, { credentials: "include" })
                .then((response) => {
                    // Only cache successful responses
                    if (!response.ok) {
                        return response;
                    }
                    // Clone and cache successful API responses
                    const responseClone = response.clone();
                    caches
                        .open(API_CACHE)
                        .then((cache) =>
                            cache.put(request, responseClone)
                        );
                    return response;
                })
                .catch((error) => {
                    console.error("API fetch failed:", error);
                    // If offline, try to return cached response
                    return caches
                        .match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cached response, return a custom offline response
                            return new Response(
                                JSON.stringify({
                                    error: "You are offline",
                                    offline: true
                                }),
                                {
                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    }
                                }
                            );
                        });
                })
        );
        return;
    }

    // For non-API requests, only intercept same-origin requests
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) {
        return;
    }

    // Static assets strategy - Cache First, Network Fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then((response) => {
                // Only cache successful responses
                if (!response.ok) {
                    return response;
                }
                // Cache new successful responses
                const responseClone = response.clone();
                caches
                    .open(CACHE_NAME)
                    .then((cache) =>
                        cache.put(request, responseClone)
                    );
                return response;
            });
        })
    );
});
