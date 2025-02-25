import { API_BASE_URL } from "../utils/config.js";

const API_AUTH_URL = `${API_BASE_URL}/api`;

// CHECK IF USER EXISTS
export const checkIfUserExists = async (email) => {
    try {
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

// REGISTER USER
export const registerUser = async (userData) => {
    try {
        const response = await fetch(
            `${API_AUTH_URL}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
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

// LOGIN USER
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Login failed"
            };
        }

        return {
            success: true,
            message: "Login successful"
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "Error logging you in. Please try again."
        };
    }
};
