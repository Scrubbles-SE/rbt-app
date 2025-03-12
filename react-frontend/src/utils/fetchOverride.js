import { API_BASE_URL } from "./config";

/**
 * Override the global fetch function to automatically handle authentication
 * This should be imported once early in the application initialization
 */
export const setupFetchOverride = () => {
    // Store reference to the original fetch function
    const originalFetch = window.fetch;
    window._originalFetch = originalFetch; // Store for reset function

    // Replace the global fetch with an enhanced version
    window.fetch = async function (url, options = {}) {
        // Only intercept API calls to the backend
        if (
            typeof url === "string" &&
            url.includes(API_BASE_URL)
        ) {
            // Ensure options object is properly initialized
            options = options || {};

            // Always include credentials for cookies
            options.credentials = "include";

            // Try the request with cookies first
            try {
                const response = await originalFetch(
                    url,
                    options
                );

                // If unauthorized, try with token
                if (response.status === 401) {
                    const token =
                        localStorage.getItem("authToken");

                    if (token) {
                        // Create headers if they don't exist
                        options.headers = options.headers || {};

                        // Add the Authorization header with token
                        options.headers = {
                            ...options.headers,
                            Authorization: `Bearer ${token}`
                        };

                        // Return a new fetch call with the token
                        return originalFetch(url, options);
                    }
                }

                return response;
            } catch (error) {
                console.error(`Fetch error for ${url}:`, error);
                throw error;
            }
        }

        // For non-API calls, use the original fetch without modification
        return originalFetch(url, options);
    };

    console.log("Global fetch override has been set up");
};

/**
 * Reset the fetch function to its original behavior
 * Used for testing or manual fallback if needed
 */
export const resetFetchOverride = () => {
    if (window._originalFetch) {
        window.fetch = window._originalFetch;
        delete window._originalFetch;
        console.log("Global fetch has been reset to original");
    }
};
