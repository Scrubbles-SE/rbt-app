/* 
IMPORTS
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { IoChevronForward } from "react-icons/io5";
import { groupsDB, membersDB } from "../utils/db";
import { API_BASE_URL } from "../utils/config.js";

// Styles
import {
    PageContainer,
    Subtitle,
    GroupCard,
    getGradient,
    GroupCardContent,
    ChevronIcon
} from "./group.styles";

// Components
import CreateGroup from "./CreateGroup";
import JoinGroup from "./JoinGroup";

/*
RENDER
*/
function GroupsPage({ userId }) {
    const [userGroups, setUserGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [theme, setTheme] = useState({ mode: "light-mode" });

    // Set the theme
    useEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

    // Fetch groups for the user - INDEXED DB STUFF
    const fetchGroups = async () => {
        setIsLoading(true);

        try {
            const cachedMemberObjects =
                await membersDB.getGroupIds(userId);

            const cachedGroups = [];

            for (
                let i = 0;
                i < cachedMemberObjects.length;
                i++
            ) {
                const groupToAdd = await groupsDB.getById(
                    cachedMemberObjects[i].group_id
                );
                cachedGroups.push(groupToAdd);
            }

            console.log("Cached Groups: " + cachedGroups);

            if (cachedGroups) {
                setUserGroups(cachedGroups);
            }

            // Now, fetch from API

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/groups`,
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

                const groups = await response.json();

                setUserGroups(groups);

                if (groups) {
                    for (let i = 0; i < groups.length; i++) {
                        const newGroupObject = {
                            _id: groups[i][0]._id,
                            group_code: groups[i][0].group_code,
                            name: groups[i][0].name
                        };
                        const newMembersObject = {
                            _id: Date.now(),
                            user_id: userId,
                            group_id: groups[i][0]._id
                        };
                        // If the group is NOT in the cached group, we should add it to the cached group
                        if (
                            !cachedGroups.some(
                                (group) =>
                                    group[0]._id ===
                                    newGroupObject._id
                            )
                        ) {
                            await groupsDB.add(newGroupObject);
                            console.log(newMembersObject);
                            await membersDB.add(
                                newMembersObject
                            );
                        }
                    }
                }
                console.log("Fetched groups:", groups);
            } catch (networkError) {
                console.log(
                    "Network request failed, using cached data" +
                        networkError
                );
            }
        } catch (err) {
            console.error("Error fetching groups:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Navigates to the group's entries page
    const handleGroupClick = (group) => {
        navigate(
            `/groups/${group._id}/${encodeURIComponent(
                group.name
            )}`,
            {
                state: {
                    group_code: group.group_code,
                    users: group.users
                }
            }
        );
    };

    // Shown if the user is not in any groups
    const NoGroupsView = () => (
        <>
            <Subtitle>Join a Group!</Subtitle>
            <CreateGroup onGroupUpdate={fetchGroups} />
            <JoinGroup onGroupUpdate={fetchGroups} />
        </>
    );

    // Shown if the user is in at least one group
    const GroupsView = () => (
        <>
            <Subtitle>Your Groups</Subtitle>
            {userGroups.map((group) => (
                <GroupCard
                    key={group[0]._id}
                    gradient={getGradient(group[0]._id)}
                    onClick={() => handleGroupClick(group[0])}
                >
                    <GroupCardContent>
                        <h3>{group[0].name}</h3>
                        <ChevronIcon>
                            <IoChevronForward />
                        </ChevronIcon>
                    </GroupCardContent>
                </GroupCard>
            ))}
            <Subtitle>Expand Your Groups</Subtitle>
            <CreateGroup onGroupUpdate={fetchGroups} />
            <JoinGroup onGroupUpdate={fetchGroups} />
        </>
    );

    // Loading spinner
    if (isLoading) {
        return <div></div>;
    }

    // Fall back if there's an error
    if (error) {
        return <PageContainer>Error: {error}</PageContainer>;
    }

    // Render the page based on # of groups
    return (
        <ThemeProvider theme={theme}>
            <PageContainer>
                {userGroups.length === 0 ? (
                    <NoGroupsView />
                ) : (
                    <GroupsView />
                )}
            </PageContainer>
        </ThemeProvider>
    );
}

export default GroupsPage;
