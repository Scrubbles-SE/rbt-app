/**
 * Groups Page Component
 *
 * This component displays a user's groups and provides options to create or join new groups.
 * It implements an offline-first approach using IndexedDB for local storage with API synchronization.
 * Users can navigate to individual groups, create new groups, or join existing ones with group codes.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { groupsDB, membersDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";

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

    /**
     * Fetch groups for the current user
     * Uses an offline-first approach by first retrieving cached groups from IndexedDB,
     * then syncing with the API to get the latest data.
     */
    const fetchGroups = async () => {
        setIsLoading(true);

        try {
            // First try to get data from local IndexedDB
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

            if (cachedGroups) {
                setUserGroups(cachedGroups);
            }

            // Then fetch from API to ensure data is current
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

                // Sync fetched groups with IndexedDB for offline access
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
                            await membersDB.add(
                                newMembersObject
                            );
                        }
                    }
                }
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

    // Fetch groups on component mount
    useEffect(() => {
        fetchGroups();
        // eslint-disable-next-line
    }, []);

    /**
     * Navigates to the selected group's entries page
     * Passes group ID, name, and additional state (group code and users)
     */
    const handleGroupClick = (group) => {
        navigate(
            `/groups/${group._id}/${encodeURIComponent(
                group.name
            )}`,
            {
                state: {
                    group_code: group.group_code,
                }
            }
        );
    };

    /**
     * Component displayed when user has no groups
     * Shows options to create or join a group
     */
    const NoGroupsView = () => (
        <>
            <Subtitle>Join a Group!</Subtitle>
            <CreateGroup onGroupUpdate={fetchGroups} />
            <JoinGroup onGroupUpdate={fetchGroups} />
        </>
    );

    /**
     * Component displayed when user has at least one group
     * Shows existing groups and options to create or join additional groups
     */
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
        <PageContainer>
            {userGroups.length === 0 ? (
                <NoGroupsView />
            ) : (
                <GroupsView />
            )}
        </PageContainer>
    );
}

export default GroupsPage;
