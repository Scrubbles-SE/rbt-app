/* 
LIBRARY & STYLE IMPORTS
 */
// Libraries
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { API_BASE_URL } from "./utils/config.js";
import { initDB } from "./utils/db";
import { setupFetchOverride } from "./utils/fetchOverride";

// Layout
import AppLayout from "./layout/AppLayout";

// Styles
import "./index.css";

/* 
PAGE IMPORTS
 */
// Account Flow
import AccountFlow from "./account/accountFlow.js";

// Main Tab Pages
import HomePage from "./mainPages/home/HomePage.js";
import SearchPage from "./mainPages/search/SearchPage.js";
import NewEntryPage from "./mainPages/new-entry/EntryPage.js";
import GroupsPage from "./mainPages/groups/groupsPage.js";
import Settings from "./mainPages/settings/SettingsPage.js";

// Full Screen Pages
import GroupEntries from "./mainPages/groups/groupEntries.js";
import TagEntries from "./mainPages/search/TagEntries.js";

// Set up fetch override to handle authentication globally
setupFetchOverride();

/* 
SERVICE WORKER & INDEXED-DB REGISTRATION
 */
// Register Service Worker (FOR PWA)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            console.log(
                "Attempting to register service worker..."
            );
            // First check if there's already a service worker
            const registration =
                await navigator.serviceWorker.getRegistration();

            if (!registration) {
                // Only register if one doesn't exist
                const swReg =
                    await navigator.serviceWorker.register(
                        "/service-worker.js",
                        {
                            scope: "/"
                        }
                    );
                console.log(
                    "ServiceWorker registration successful with scope:",
                    swReg.scope
                );
            } else {
                console.log(
                    "Service worker already registered:",
                    registration
                );

                // Check for updates on page load
                registration.update().then(() => {
                    console.log(
                        "Service worker update check triggered"
                    );
                });

                // When a new service worker is waiting to activate, notify it to take over
                if (registration.waiting) {
                    console.log(
                        "New service worker waiting - activating"
                    );
                    registration.waiting.postMessage({
                        type: "CHECK_UPDATE"
                    });
                }

                // Listen for new service workers
                registration.addEventListener(
                    "updatefound",
                    () => {
                        const newWorker =
                            registration.installing;
                        console.log(
                            "New service worker found, state:",
                            newWorker.state
                        );

                        newWorker.addEventListener(
                            "statechange",
                            () => {
                                console.log(
                                    "Service worker state changed:",
                                    newWorker.state
                                );
                                if (
                                    newWorker.state ===
                                        "installed" &&
                                    navigator.serviceWorker
                                        .controller
                                ) {
                                    // New service worker is ready to take over
                                    newWorker.postMessage({
                                        type: "CHECK_UPDATE"
                                    });
                                    console.log(
                                        "New service worker activated"
                                    );
                                }
                            }
                        );
                    }
                );
            }

            // Listen for controller change which indicates a new service worker has taken over
            navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => {
                    console.log(
                        "Service worker controller changed - refreshing page"
                    );
                    window.location.reload();
                }
            );
        } catch (err) {
            console.log(
                "ServiceWorker registration failed: ",
                err
            );
        }
    });
}

// Initialize IndexedDB (For PWA)
window.addEventListener("load", () => {
    initDB()
        .then(() => {
            console.log("IndexedDB initialized successfully");
        })
        .catch((error) => {
            console.error(
                "Error initializing IndexedDB:",
                error
            );
        });
});

/* 
MAIN APP ROUTES
(Tab and full screen routes)
 */
const MainAppRoutes = ({ setIsLoggedIn, userId }) => {
    // Check for dark mode and pass through
    useEffect(() => {
        const currentTheme =
            localStorage.getItem("theme") || "light-mode";

        // remove any other themes
        document.body.classList.remove(
            "dark-mode",
            "min-theme",
            "blue-theme"
        );

        // apply current theme
        document.body.classList.add(currentTheme);
    }, []);

    return (
        <Routes>
            {/* Tab Routes */}
            <Route
                path="/"
                element={<HomePage userId={userId} />}
            />
            <Route
                path="/search"
                element={<SearchPage userId={userId} />}
            />
            <Route
                path="/new-entry"
                element={<NewEntryPage userId={userId} />}
            />
            <Route
                path="/groups"
                element={<GroupsPage userId={userId} />}
            />
            <Route
                path="/settings"
                element={
                    <Settings
                        setIsLoggedIn={setIsLoggedIn}
                        userId={userId}
                    />
                }
            />

            {/* Full Screen Routes */}
            <Route
                path="/groups/:groupId/:groupName"
                element={<GroupEntries userId={userId} />}
            />
            <Route
                path="/search/:tagId/:tagName"
                element={<TagEntries />}
            />
        </Routes>
    );
};

/* 
AUTHENTICATION ROUTES
(Account flow and authentication check)
 */
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    // Add initializing state to prevent auth screen flash
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        // Apply saved theme immediately on load
        const savedTheme =
            localStorage.getItem("theme") || "light-mode";
        document.body.className = savedTheme;

        // Check for auth token locally first
        const hasToken = !!localStorage.getItem("authToken");

        // Set initial auth state based on local storage
        if (hasToken) {
            setIsLoggedIn(true);
            setUserId(localStorage.getItem("userId"));
        }

        // Verify JWT token validity with server in background
        const checkAuth = async () => {
            try {
                // First try with cookies (normal flow)
                const response = await fetch(
                    `${API_BASE_URL}/api/auth/verify`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(true);
                    setUserId(data.userId);
                } else {
                    // If cookies fail, try with localStorage token as fallback
                    // This helps with iOS devices where httpOnly cookies might not work properly
                    const token =
                        localStorage.getItem("authToken");
                    const storedUserId =
                        localStorage.getItem("userId");

                    if (token && storedUserId) {
                        // Verify the token by making an authenticated request
                        const fallbackResponse = await fetch(
                            `${API_BASE_URL}/api/user/current`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        if (fallbackResponse.ok) {
                            setIsLoggedIn(true);
                            setUserId(storedUserId);
                        } else {
                            // Token invalid, clear storage
                            localStorage.removeItem(
                                "authToken"
                            );
                            localStorage.removeItem("userId");
                            setIsLoggedIn(false);
                            setUserId(null);
                        }
                    } else {
                        // No token in localStorage either
                        setIsLoggedIn(false);
                        setUserId(null);
                    }
                }
            } catch (error) {
                console.error(
                    "Auth verification error:",
                    error
                );
                setIsLoggedIn(false);
                setUserId(null);
            } finally {
                // Mark initialization as complete
                setInitializing(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <>
            {initializing ? (
                // Show a simple full-screen div that matches the theme while loading
                <div className="initializing-screen">
                    <div className="loading-indicator"></div>
                </div>
            ) : (
                <Routes>
                    <Route
                        path="/account"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <AccountFlow
                                    setIsLoggedIn={
                                        setIsLoggedIn
                                    }
                                />
                            )
                        }
                    />
                    <Route
                        path="/*"
                        element={
                            isLoggedIn ? (
                                <AppLayout>
                                    <MainAppRoutes
                                        setIsLoggedIn={
                                            setIsLoggedIn
                                        }
                                        userId={userId}
                                    />
                                </AppLayout>
                            ) : (
                                <Navigate
                                    to="/account"
                                    replace
                                />
                            )
                        }
                    />
                </Routes>
            )}
        </>
    );
};

/* 
RENDER APP
 */
ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById("root")
);
