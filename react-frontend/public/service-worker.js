/* eslint-disable no-restricted-globals */
const CACHE_NAME = "rbt-cache-v2";
const API_CACHE = "rbt-api-cache";

// Add version for better tracking
const SW_VERSION = "v2.0";
console.log("Service Worker version:", SW_VERSION);

// Assets that need to be available offline
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
    console.log("Service Worker installing");
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Add message event listener to check for updates
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "CHECK_UPDATE") {
        console.log("Update check requested by client");
        self.skipWaiting();
        self.clients.claim();
    }
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker activating");
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(
                            (name) =>
                                name !== CACHE_NAME &&
                                name !== API_CACHE
                        )
                        .map((name) => {
                            console.log(
                                "Deleting old cache:",
                                name
                            );
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
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

    // *** UPDATED STRATEGY: Network First, Cache Fallback ***
    // This ensures users always get the latest content unless they're offline
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                // If we got a good response from the network, cache it for offline use
                if (networkResponse.ok) {
                    const responseToCache =
                        networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If network request fails (user is offline), try to serve from cache
                console.log(
                    "Network request failed, falling back to cache for:",
                    request.url
                );
                return caches
                    .match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // If the request is for the index.html, return the cached version
                        if (
                            request.url.endsWith("/") ||
                            request.url.includes("index.html")
                        ) {
                            return caches.match("/index.html");
                        }

                        // Otherwise return a simple offline message
                        return new Response(
                            "You are offline and this content is not cached.",
                            {
                                headers: {
                                    "Content-Type": "text/plain"
                                }
                            }
                        );
                    });
            })
    );
});
