/*
IMPORTS
*/

// Libraries
import React from "react";
import { useLocation } from "react-router-dom";
import {
    MdOutlineHome,
    MdHome,
    MdOutlineSearch,
    MdSearch,
    MdOutlineGroups,
    MdGroups,
    MdOutlineSettings,
    MdSettings
} from "react-icons/md";
import { IoRose, IoRoseOutline } from "react-icons/io5";

// Styles
import {
    FooterContainer,
    TabBarContainer,
    ActionButton,
    Nav,
    TabList,
    TabItem,
    TabLink,
    NewEntryButton
} from "./Footer.styles";

/*
COMPONENT
*/

/**
 * Footer navigation component with tabs and floating action button
 * Contains navigation links to main app sections
 */
function Footer() {
    // Used for navigation
    const location = useLocation();
    const currentPath = location.pathname;

    /**
     * Renders either filled or outlined icon based on active route
     * Creates visual indication of the current active tab
     */
    const renderIcon = (path, OutlinedIcon, FilledIcon) => {
        return currentPath === path ? (
            <FilledIcon />
        ) : (
            <OutlinedIcon />
        );
    };

    return (
        <FooterContainer>
            <TabBarContainer>
                <Nav>
                    {/* Tab bar w/ Navigation */}
                    <TabList>
                        <TabItem>
                            <TabLink
                                to="/"
                                $isActive={currentPath === "/"}
                            >
                                {renderIcon(
                                    "/",
                                    MdOutlineHome,
                                    MdHome
                                )}
                            </TabLink>
                        </TabItem>
                        <TabItem>
                            <TabLink
                                to="/search"
                                $isActive={
                                    currentPath === "/search"
                                }
                            >
                                {renderIcon(
                                    "/search",
                                    MdOutlineSearch,
                                    MdSearch
                                )}
                            </TabLink>
                        </TabItem>
                        {/* Hidden placeholder to maintain tab spacing around FAB */}
                        <TabItem
                            style={{ visibility: "hidden" }}
                        >
                            <TabLink to="/new-entry">
                                <IoRoseOutline />
                            </TabLink>
                        </TabItem>
                        <TabItem>
                            <TabLink
                                to="/groups"
                                $isActive={
                                    currentPath === "/groups"
                                }
                            >
                                {renderIcon(
                                    "/groups",
                                    MdOutlineGroups,
                                    MdGroups
                                )}
                            </TabLink>
                        </TabItem>
                        <TabItem>
                            <TabLink
                                to="/settings"
                                $isActive={
                                    currentPath === "/settings"
                                }
                            >
                                {renderIcon(
                                    "/settings",
                                    MdOutlineSettings,
                                    MdSettings
                                )}
                            </TabLink>
                        </TabItem>
                    </TabList>
                </Nav>
            </TabBarContainer>
            {/* Floating action button for new entry creation */}
            <ActionButton>
                <NewEntryButton
                    to="/new-entry"
                    $isActive={currentPath === "/new-entry"}
                >
                    {renderIcon(
                        "/new-entry",
                        IoRoseOutline,
                        IoRose
                    )}
                </NewEntryButton>
            </ActionButton>
        </FooterContainer>
    );
}

// Used in index.js
export default Footer;
