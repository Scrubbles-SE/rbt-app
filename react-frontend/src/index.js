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
import AdminView from "./mainPages/groups/AdminView.js";

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
            }
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
            <Route path="/" element={<HomePage />} />
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
                    <Settings setIsLoggedIn={setIsLoggedIn} />
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
            <Route
                path="/groups/:groupId/admin"
                element={<AdminView />}
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

    useEffect(() => {
        // Verify JWT token validity with server
        const checkAuth = async () => {
            try {
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
                    // Clear authentication state if token invalid
                    setIsLoggedIn(false);
                    setUserId(null);
                }
            } catch (error) {
                setIsLoggedIn(false);
                setUserId(null);
            }
        };
        checkAuth();
    }, []);

    return (
        <Routes>
            <Route
                path="/account"
                element={
                    isLoggedIn ? (
                        // Redirect already logged in users to home
                        <Navigate to="/" />
                    ) : (
                        <AccountFlow
                            setIsLoggedIn={setIsLoggedIn}
                            setUserId={setUserId}
                        />
                    )
                }
            />
            <Route
                path="/*"
                element={
                    isLoggedIn ? (
                        // Protected routes - only accessible when authenticated
                        <AppLayout>
                            <MainAppRoutes
                                setIsLoggedIn={setIsLoggedIn}
                                setUserId={setUserId}
                                userId={userId}
                            />
                        </AppLayout>
                    ) : (
                        // Redirect unauthenticated users to login
                        <Navigate to="/account" />
                    )
                }
            />
        </Routes>
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
