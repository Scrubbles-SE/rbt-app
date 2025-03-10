/**
 * Authentication services for the application
 * Handles user account operations including login, registration, and user verification
 */
import { API_BASE_URL } from "../utils/config.js";
import { clearDB } from "../utils/db";

const API_AUTH_URL = `${API_BASE_URL}/api`;

/**
 * Verifies if a user account exists with the provided email
 */
export const checkIfUserExists = async (email) => {
    try {
        console.log(`Checking if user exists: ${email}`);
        console.log(
            `Using API URL: ${API_AUTH_URL}/user-exists/${email}`
        );

        const response = await fetch(
            `${API_AUTH_URL}/user-exists/${email}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        const data = await response.json();
        console.log("Check user exists response:", data);

        if (response.ok) {
            return {
                exists: data.exists,
                firstName: data.firstName
            };
        } else {
            return {
                exists: false,
                message:
                    data.message ||
                    "Failed to check user existence"
            };
        }
    } catch (error) {
        console.error("Error checking user existence:", error);
        return {
            exists: false,
            message:
                "Unable to connect to the server. Please check your connection and try again."
        };
    }
};

/**
 * Creates a new user account with provided information
 */
export const registerUser = async (userData) => {
    try {
        const response = await fetch(
            `${API_AUTH_URL}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Registration failed"
            };
        }

        return {
            success: true,
            message: "Registration successful"
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message:
                "Unable to connect to the server. Please try again."
        };
    }
};

/**
 * Authenticates a user with their credentials
 */
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Login failed"
            };
        }

        // Store token in localStorage as fallback for iOS devices
        // This ensures authentication persists even if cookies don't work
        if (data.token) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userId", data.userId);
        }

        return {
            success: true,
            userId: data.userId
        };
    } catch (error) {
        return {
            success: false,
            message: "Connection error. Please try again."
        };
    }
};

// Logout function that clears both cookie and localStorage
export const logoutUser = async () => {
    try {
        // Clear localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");

        // Clear IndexedDB data
        await clearDB();

        // Call logout endpoint to clear cookies
        const response = await fetch(
            `${API_AUTH_URL}/auth/logout`,
            {
                method: "POST"
            }
        );

        return { success: response.ok };
    } catch (error) {
        console.error("Logout error:", error);
        // Even if server request fails, consider logout successful after clearing localStorage
        return { success: true };
    }
};
