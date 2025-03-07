/*
Main Settings component for user preferences and account management
Handles theme selection, user profile updates, and group membership
*/
import React, { useState, useEffect } from "react";
import {
    FaSignOutAlt,
    FaSync,
    FaSignOutAlt as FaLeaveGroup
} from "react-icons/fa";
import * as S from "./SettingsStyles";
import { createGlobalStyle } from "styled-components";
import { userDB, groupsDB, membersDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";
import {
    authenticatedFetch,
    logoutUser
} from "../../account/authService";

export const GlobalStyle = createGlobalStyle`
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

/* 
Updates the PWA manifest colors when the user changes themes
Uses computed CSS variables from index.css to ensure consistent colors
*/
const updateManifestColors = (themeName) => {
    // Apply the theme class temporarily to get computed styles
    const originalClass = document.body.className;
    document.body.className = themeName;

    // Get computed CSS variables
    const styles = getComputedStyle(document.body);
    const backgroundColor = styles
        .getPropertyValue("--background-color")
        .trim();

    // Restore original class
    document.body.className = originalClass;

    const manifestLink = document.querySelector(
        'link[rel="manifest"]'
    );
    if (!manifestLink) return;

    fetch(manifestLink.href)
        .then((res) => res.json())
        .then((manifest) => {
            manifest.background_color = backgroundColor;
            manifest.theme_color = backgroundColor;

            const blob = new Blob([JSON.stringify(manifest)], {
                type: "application/json"
            });
            const newManifestURL = URL.createObjectURL(blob);

            manifestLink.href = newManifestURL;

            const themeColorMeta = document.querySelector(
                'meta[name="theme-color"]'
            );
            if (themeColorMeta) {
                themeColorMeta.content = backgroundColor;
            }
        })
        .catch(console.error);
};

function Settings({ setIsLoggedIn, userId }) {
    // State for theme and user profile management
    const [theme, setTheme] = useState("light-mode");

    // Track both current and edited user data for form management
    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: ""
    });
    const [editedUser, setEditedUser] = useState({
        name: "",
        email: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveStatus, setSaveStatus] = useState("");
    const [groups, setGroups] = useState([]);
    const [groupsError, setGroupsError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Fetch user data on component mount with offline-first approach
    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true);
            try {
                const response = await authenticatedFetch(
                    `${API_BASE_URL}/api/user/details`
                );

                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data);
                    setEditedUser(data);
                    setIsLoading(false);
                } else {
                    setError("Failed to load user information");
                }
            } catch (error) {
                console.error(
                    "Error fetching user details:",
                    error
                );
                setError("Failed to load user information");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    // Detect if user has made changes to their profile data
    const hasChanges =
        currentUser.name !== editedUser.name ||
        currentUser.email !== editedUser.email;

    // Handle input changes in the profile form
    const handleInputChange = (e) => {
        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value
        });
        setSaveStatus("");
    };

    // Save user profile changes to both local cache and server
    const handleSave = async () => {
        try {
            setSaveStatus("saving");
            setCurrentUser(editedUser);

            // First update local cache
            await userDB.update({
                ...editedUser,
                _id: "current_user"
            });

            // Then update the server
            const response = await fetch(
                `${API_BASE_URL}/api/user`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(editedUser)
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update"
                );
            }
            await userDB.update({
                ...editedUser,
                _id: "current_user"
            });

            setCurrentUser(editedUser);
            setSaveStatus("success");

            // Clear success message after delay
            setTimeout(() => setSaveStatus(""), 2000);
        } catch (error) {
            setSaveStatus("error");
            setError(error.message);

            setTimeout(() => setSaveStatus(""), 3000);
        }
    };

    // Fetch groups with offline-first approach
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                // First try local cache
                const cachedMemberObjects =
                    await membersDB.getGroupIds("current_user");
                const cachedGroups = [];

                // Build groups array from cached data
                for (
                    let i = 0;
                    i < cachedMemberObjects.length;
                    i++
                ) {
                    const groupToAdd = await groupsDB.getById(
                        cachedMemberObjects[i].group_id
                    );
                    if (groupToAdd) {
                        cachedGroups.push(groupToAdd);
                    }
                }

                if (cachedGroups.length > 0) {
                    setGroups(cachedGroups);
                }

                // Then fetch from server for latest data
                const response = await fetch(
                    `${API_BASE_URL}/api/groups`,
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch groups");
                }

                const fetchedGroups = await response.json();
                setGroups(fetchedGroups);

                // Sync fetched data with IndexedDB for offline access
                if (fetchedGroups) {
                    for (
                        let i = 0;
                        i < fetchedGroups.length;
                        i++
                    ) {
                        const newGroupObject = {
                            _id: fetchedGroups[i][0]._id,
                            group_code:
                                fetchedGroups[i][0].group_code,
                            name: fetchedGroups[i][0].name
                        };

                        try {
                            await groupsDB.update(
                                newGroupObject
                            );
                        } catch (err) {
                            await groupsDB.add(newGroupObject);
                        }

                        // Check if membership relationship exists in cache
                        const memberExists =
                            cachedMemberObjects.some(
                                (member) =>
                                    member.group_id ===
                                    fetchedGroups[i][0]._id
                            );

                        // Add missing membership records
                        if (!memberExists) {
                            const newMembersObject = {
                                _id: `${fetchedGroups[i][0]._id}_current_user`,
                                user_id: "current_user",
                                group_id:
                                    fetchedGroups[i][0]._id
                            };
                            try {
                                await membersDB.add(
                                    newMembersObject
                                );
                            } catch (err) {
                                console.log(
                                    "Member relationship already exists"
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                setGroupsError("Failed to load groups");
                console.error("Error fetching groups:", error);
            }
        };

        fetchGroups();
    }, []);

    // Load saved theme from localStorage on mount
    useEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        if (currentTheme) {
            setTheme(currentTheme);
        }
    }, []);

    // Apply theme changes to document and save to localStorage
    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.body.className = theme;
        console.log(theme);
    }, [theme]);

    // Handle user logout - clear cache and server session
    const handleLogout = async () => {
        try {
            const result = await logoutUser();
            if (result.success) {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    // Handle theme changes including DOM and manifest updates
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        // Remove all theme classes and add the new one
        document.body.classList.remove(
            "dark-mode",
            "min-theme",
            "blue-theme"
        );

        document.body.classList.add(newTheme);

        // Update PWA manifest to match selected theme
        updateManifestColors(newTheme);
    };

    // Open confirmation modal for leaving a group
    const handleLeaveClick = (group) => {
        setSelectedGroup(group);
        setModalOpen(true);
    };

    // Close the confirmation modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedGroup(null);
    };

    // Handle the process of leaving a group
    const handleLeaveGroup = async (groupId) => {
        try {
            // First remove user from group on the server
            const response = await fetch(
                `${API_BASE_URL}/api/groups/${groupId}/leave`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to leave group");
            }

            try {
                // Then update local cache by removing relationship
                const memberObjects =
                    await membersDB.getGroupIds("current_user");
                const memberToDelete = memberObjects.find(
                    (member) => member.group_id === groupId
                );

                if (memberToDelete) {
                    await membersDB.delete(memberToDelete._id);
                }

                // Update UI by filtering out the removed group
                setGroups((prevGroups) =>
                    prevGroups.filter(
                        (g) => g[0]._id !== groupId
                    )
                );

                setModalOpen(false);
                setSelectedGroup(null);
            } catch (dbError) {
                console.error(
                    "Error updating IndexedDB:",
                    dbError
                );
                // Still update UI since server operation succeeded
                setGroups((prevGroups) =>
                    prevGroups.filter(
                        (g) => g[0]._id !== groupId
                    )
                );
                setModalOpen(false);
                setSelectedGroup(null);
            }
        } catch (error) {
            setGroupsError("Failed to leave group");
            console.error("Error leaving group:", error);
            setModalOpen(false);
        }
    };

    if (isLoading) {
        return <div></div>;
    }

    return (
        <S.SettingsContainer>
            <S.SectionContainer>
                <S.SectionHeader>Appearance</S.SectionHeader>
                <S.ContentCard>
                    <S.ThemeSelection
                        onClick={() =>
                            handleThemeChange("light-mode")
                        }
                        $active={"light-mode"}
                        selected={theme === "light-mode"}
                    >
                        <S.IconWrapper>
                            <S.Circle color="#f2c4bb" />
                        </S.IconWrapper>
                        Classic
                    </S.ThemeSelection>
                    <S.ThemeSelection
                        onClick={() =>
                            handleThemeChange("dark-mode")
                        }
                        $active={"dark-mode"}
                        selected={theme === "dark-mode"}
                    >
                        <S.Circle color="#000000" />
                        Dark
                    </S.ThemeSelection>
                    <S.ThemeSelection
                        $active={theme === "blue-theme"}
                        onClick={() =>
                            handleThemeChange("blue-theme")
                        }
                        selected={theme === "blue-theme"}
                    >
                        <S.Circle color="#9bc4e2" />
                        Sky
                    </S.ThemeSelection>
                    <S.ThemeSelection
                        $active={theme === "min-theme"}
                        onClick={() =>
                            handleThemeChange("min-theme")
                        }
                        selected={theme === "min-theme"}
                    >
                        <S.Circle color="#d3d3d3" />
                        Minimalist
                    </S.ThemeSelection>
                    <S.ThemeSelection
                        $active={theme === "green-theme"}
                        onClick={() => setTheme("green-theme")}
                        selected={theme === "green-theme"}
                    >
                        <S.Circle color="#afbf9f" />
                        Sage
                    </S.ThemeSelection>
                </S.ContentCard>
            </S.SectionContainer>

            <S.SectionContainer>
                <S.SectionHeader>Information</S.SectionHeader>
                <S.ContentCard>
                    <S.InputWrapper>
                        <S.InputHeader>
                            <S.InputLabel>Name</S.InputLabel>
                        </S.InputHeader>
                        <S.InputField
                            type="text"
                            name="name"
                            value={editedUser.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                        />
                    </S.InputWrapper>
                    <S.InputWrapper>
                        <S.InputHeader>
                            <S.InputLabel>Email</S.InputLabel>
                        </S.InputHeader>
                        <S.InputField
                            type="email"
                            name="email"
                            value={editedUser.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                        />
                    </S.InputWrapper>
                    {error && (
                        <S.ErrorMessage>{error}</S.ErrorMessage>
                    )}
                    {hasChanges && (
                        <S.SaveButton
                            onClick={handleSave}
                            disabled={saveStatus === "saving"}
                            status={saveStatus}
                        >
                            {saveStatus === "saving" ? (
                                <>
                                    <FaSync
                                        style={{
                                            animation:
                                                "spin 1s linear infinite"
                                        }}
                                    />
                                    Updating...
                                </>
                            ) : saveStatus === "success" ? (
                                "Updated!"
                            ) : (
                                <>
                                    <FaSync />
                                    Update Info
                                </>
                            )}
                        </S.SaveButton>
                    )}
                </S.ContentCard>
            </S.SectionContainer>

            <S.SectionContainer>
                <S.SectionHeader>Groups</S.SectionHeader>
                <S.ContentCard>
                    {groupsError ? (
                        <S.ErrorMessage>
                            {groupsError}
                        </S.ErrorMessage>
                    ) : groups.length === 0 ? (
                        <S.EmptyMessage>
                            No groups joined yet
                        </S.EmptyMessage>
                    ) : (
                        <S.GroupsList>
                            {groups.map((group) => (
                                <S.GroupItem key={group[0]._id}>
                                    <S.GroupName>
                                        {group[0].name}
                                    </S.GroupName>
                                    <S.RemoveButton
                                        onClick={() =>
                                            handleLeaveClick(
                                                group[0]
                                            )
                                        }
                                        aria-label="Leave group"
                                    >
                                        <FaLeaveGroup />
                                    </S.RemoveButton>
                                </S.GroupItem>
                            ))}
                        </S.GroupsList>
                    )}
                </S.ContentCard>
            </S.SectionContainer>

            <S.LogoutButton onClick={handleLogout}>
                <FaSignOutAlt />
                Sign Out
            </S.LogoutButton>

            {modalOpen && (
                <S.ModalOverlay onClick={handleCloseModal}>
                    <S.ModalContent
                        onClick={(e) => e.stopPropagation()}
                    >
                        <S.ModalTitle>
                            Leaving Group.
                        </S.ModalTitle>
                        <div>
                            Are you sure you want to leave?
                        </div>
                        <S.ModalButtons>
                            <S.ModalButton
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </S.ModalButton>
                            <S.ModalButton
                                variant="confirm"
                                onClick={() =>
                                    handleLeaveGroup(
                                        selectedGroup._id
                                    )
                                }
                            >
                                Leave
                            </S.ModalButton>
                        </S.ModalButtons>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.SettingsContainer>
    );
}

export default Settings;
