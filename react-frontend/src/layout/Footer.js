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

// Footer component render
function Footer() {
    // Used for navigation
    const location = useLocation();
    const currentPath = location.pathname;

    // Change icon based on selected tab
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
