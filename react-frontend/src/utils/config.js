// This file is just something I am using to be able to run the app on my phone for PWA and sizing testing

// Configuration for API endpoints that supports local and Azure deployment

const getApiBaseUrl = () => {
    // Check if running in production environment
    if (process.env.NODE_ENV === "production") {
        // If a specific backend URL is defined in environment, use it
        if (process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }

        // In production without specific backend URL:
        // If deployed on Azure Static Web Apps with the backend
        // deployed to Azure App Service, use relative API path
        return ""; // Empty string means use relative paths
    }

    // For local development or ngrok testing
    if (window.location.hostname.includes("ngrok")) {
        return ""; // Empty string for ngrok testing
    }

    // Default local development
    return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();
