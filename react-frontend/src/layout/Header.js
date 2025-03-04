/*
IMPORTS
*/

// Libraries
import React from "react";
import { useLocation } from "react-router-dom";
import {
    MdHome,
    MdSearch,
    MdGroups,
    MdSettings
} from "react-icons/md";
import { IoRose } from "react-icons/io5";

// Styles
import {
    HeaderContainer,
    ViewInfo,
    ViewTitle
} from "./Header.styles";

/*
COMPONENT
*/

/**
 * Application header component
 * Displays the current section title and icon based on navigation path
 */
function Header() {
    const location = useLocation();
    const path = location.pathname;

    /**
     * Configuration map for section titles and icons
     * Used to determine what to display in the header for each route
     */
    const viewConfigs = {
        "/": { icon: <MdHome />, title: "Home" },
        "/search": { icon: <MdSearch />, title: "Search" },
        "/new-entry": {
            icon: <IoRose />,
            title: "Your RBT"
        },
        "/groups": { icon: <MdGroups />, title: "Groups" },
        "/settings": { icon: <MdSettings />, title: "Settings" }
    };

    // For nested routes like /groups/123, use the parent route's config
    const currentView = path.startsWith("/groups/")
        ? viewConfigs["/groups"]
        : viewConfigs[path] || viewConfigs["/"];

    return (
        <HeaderContainer>
            <ViewInfo>
                {currentView.icon}
                <ViewTitle>{currentView.title}</ViewTitle>
            </ViewInfo>
        </HeaderContainer>
    );
}

export default Header;
