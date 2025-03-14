/**
 * Admin View Component
 * Displays a simple admin interface for group management
 * Shows all users in the current group
 */
import React, {
    useState,
    useEffect,
    useLayoutEffect
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

function AdminView({ groupUsers = [], groupId, selfId }) {
    const [theme, setTheme] = useState({ mode: "light-mode" });
    const [userObjects, setUserObjects] = useState([]);
    const [selfAdmin, setSelfAdmin] = useState(false);

    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getUserObjects();
        // eslint-disable-next-line
    }, [groupUsers]);

    const getUserObjects = async () => {
        const users = [];

        for (let i = 0; i < groupUsers.length; i++) {
            const response = await fetch(
                `${API_BASE_URL}/api/user/${groupUsers[i].user_id}/${groupId}`,
                {
                    credentials: "include" // Important for sending cookies
                }
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message ||
                        "Failed to fetch group members"
                );
            }
            const userObject = await response.json();
            users.push(userObject[0]);

            if (userObject[0]._id === selfId && userObject[0].isAdmin) {
                setSelfAdmin(true);
            }
        }


        setUserObjects(users);
    };

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
                                {!user.isAdmin && selfAdmin && (
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
                                )}
                            </MemberCard>
                        ))
                    ) : (
                        <MemberName>No users found</MemberName>
                    )}
                </EntriesContainer>
            </ListContainer>
        </ThemeProvider>
    );
}

export default AdminView;
