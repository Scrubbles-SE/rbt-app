/**
 * Admin View Component
 * Displays a simple admin interface for group management
 * Shows all users in the current group
 */
import React, {
    useState,
    useLayoutEffect
    // useEffect
} from "react";
import { ThemeProvider } from "styled-components";

import {
    Container,
    ContentContainer,
    HeaderRow,
    BackButton,
    HeaderContainer,
    EntriesContainer,
    EntryCard,
    EntryName,
    ListContainer,
    MemberCard,
    MemberName,
    Remove
    // EntrySection,
    // EntryText,
    // EntryHeader,
    // EntryDate
} from "./group.styles";
import { EntryPageTitle } from "../search/search.styles";

function AdminView({ groupUsers = [] }) {
    const [theme, setTheme] = useState({ mode: "light-mode" });

    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

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
            {/* <HeaderContainer>
                <HeaderRow></HeaderRow>
            </HeaderContainer> */}
            <ListContainer>
                <EntryName>Users</EntryName>

                {/* display all entries in the tag */}
                <EntriesContainer>
                    {/* {groupUsers?.length > 0 ? (
                    groupUsers.map((user) => (
                        <EntryCard key={user._id}>
                            <EntryPageTitle>
                                {user.first_name}
                            </EntryPageTitle>
                        </EntryCard>
                    ))
                ) : (
                    <EntryPageTitle>
                        No users found
                    </EntryPageTitle>
                )} */}
                    <MemberCard>
                        <MemberName>James</MemberName>
                        <Remove
                            onClick={(user) =>
                                removeFromGroup("light-mode")
                            }
                        >
                            Remove
                        </Remove>
                    </MemberCard>
                    <MemberCard>
                        <MemberName>Emily</MemberName>
                        <Remove>Remove</Remove>
                    </MemberCard>
                </EntriesContainer>
            </ListContainer>
        </ThemeProvider>
    );
}

export default AdminView;
