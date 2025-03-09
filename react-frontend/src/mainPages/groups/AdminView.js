/**
 * Admin View Component
 * Displays a simple admin interface for group management
 * Shows all users in the current group
 */
import React, {
    useState,
    useLayoutEffect, 
    useEffect
    // useEffect
} from "react";
import { ThemeProvider } from "styled-components";
import { API_BASE_URL } from "../../utils/config.js";


import {
    EntriesContainer,
    EntryName,
    ListContainer,
    MemberCard,
    MemberName,
    Remove
} from "./group.styles";

function AdminView({ groupUsers, groupId }) {
    const [theme, setTheme] = useState({ mode: "light-mode" });
    const [userObjects, setUserObjects] = useState([]);

    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

    useEffect(() => {
        getUserObjects();
    }, [groupUsers]);

    const getUserObjects = async () => {
        const users = [];

        for (let i = 0; i<groupUsers.length; i++) {
            const response = await fetch(
                `${API_BASE_URL}/api/user/${groupUsers[i]}`,
                {
                    credentials: "include" // Important for sending cookies
                }
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message || "Failed to fetch groups"
                );
            } 
            const userObject = await response.json();
            users.push(userObject[0]);
        }

        console.log(users);

        setUserObjects(users);

    }

    const removeFromGroup = async (userToRemove, groupId) => {
        try {
            const response = await fetch(
                `/api/groups/${groupId}/leave`,
                {
                    method: "DELETE",
                    credentials: "include", // For JWT cookie
                    body: JSON.stringify({
                        userId: userToRemove
                    })
                }
            );

            if (response.ok) {
                console.log(
                    "Removed from group: ",
                    userToRemove
                );
            } else {
                const errorResp = await response.json();
                console.error(
                    "Failed to remove from group",
                    errorResp
                );
            }
        } catch (error) {
            console.error("Error removing from group", error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <ListContainer>
                <EntryName>Users</EntryName>

                <EntriesContainer>
                    {groupUsers?.length > 0 ? (
                        userObjects.map((user) => (
                            <MemberCard key={user._id}>
                                <MemberName>
                                    {user.first_name}
                                </MemberName>
                                <Remove
                                    onClick={(user) =>
                                        removeFromGroup(
                                            user._id,
                                            groupId
                                        )
                                    }
                                >
                                    Remove
                                </Remove>
                            </MemberCard>
                        ))
                    ) : (
                        <MemberName>No users found</MemberName>
                    )}
                    {/* <MemberCard>
                        <MemberName>James</MemberName>
                        <Remove
                            onClick={(user) =>
                                removeFromGroup()
                            }
                        >
                            Remove
                        </Remove>
                    </MemberCard>
                    <MemberCard>
                        <MemberName>Emily</MemberName>
                        <Remove>Remove</Remove>
                    </MemberCard> */}
                </EntriesContainer>
            </ListContainer>
        </ThemeProvider>
    );
}

export default AdminView;
