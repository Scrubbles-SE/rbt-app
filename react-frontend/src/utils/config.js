// This file helps with the configuration of the API endpoints that supports local and Azure deployment

const getApiBaseUrl = () => {
    // Check if running in production environment
    if (process.env.NODE_ENV === "production") {
        // If a specific backend URL is defined in environment, use it
        if (process.env.REACT_APP_API_URL) {
            console.log(
                "Using environment variable API URL:",
                process.env.REACT_APP_API_URL
            );
            return process.env.REACT_APP_API_URL;
        }

        // In production without specific backend URL:
        // If deployed on Azure Static Web Apps with the backend
        // deployed to Azure App Service, use relative API path
        console.log(
            "No API URL specified, using empty string for relative paths"
        );
        return ""; // Empty string means use relative paths
    }

    // For local development
    if (window.location.hostname.includes("ngrok")) {
        console.log("Using ngrok, setting empty API URL");
        return "";
    }

    // Default local development
    console.log("Using localhost:8000 for API URL");
    return "http://localhost:8000";
};

// Get the API base URL
export const API_BASE_URL = getApiBaseUrl();
console.log("Final API_BASE_URL:", API_BASE_URL);
