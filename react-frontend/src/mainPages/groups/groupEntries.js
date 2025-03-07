/**
 * Group Entries Component
 *
 * This component displays entries from all members of a specific group.
 * It fetches and displays the most recent entries for each user in the group,
 * shows group information, and allows users to react to entries.
 * Implements an offline-first approach with IndexedDB and API synchronization.
 */
import React, {
    useState,
    useEffect,
    useLayoutEffect
} from "react";
import axios from "axios";
import {
    useParams,
    useNavigate,
    useLocation
} from "react-router-dom";
import {
    FiCopy,
    FiShare,
    FiHash,
    FiChevronLeft
} from "react-icons/fi";
import { MdOutlinePeopleOutline } from "react-icons/md";
import { ThemeProvider } from "styled-components";
import AdminView from "./AdminView.js";

import { membersDB, entriesDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";

// Styles
import {
    Container,
    ContentContainer,
    EntryPageTitle,
    CodeButton,
    GroupCodeDisplay,
    ActionIcon,
    Toast,
    HeaderRow,
    BackButton,
    HeaderContainer,
    getGradient,
    EntriesContainer,
    EntryCard,
    EntryName,
    EntrySection,
    EntryText,
    EntryHeader,
    EntryDate,
    EntryReactions,
    Reaction,
    ReactionCount,
    AdminDisplay
} from "./group.styles";

/*
RENDER
*/
function GroupEntries({ userId }) {
    // Constants & states
    const { groupId, groupName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const groupCode = location.state?.group_code;
    const [showToast, setShowToast] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [entries, setEntries] = useState([]);
    const [theme, setTheme] = useState({ mode: "light-mode" });
    const [reactionCounts, setReactionCounts] = useState({});
    const [reactionNumbers, setReactionNumbers] = useState({});
    const [groupUsers] = useState(location.state?.users || []);

    /**
     * Set the theme from local storage on component mount
     */
    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
        console.log(groupUsers);
    }, []);

    // Get gradient for the group
    const gradient = getGradient(groupId);

    /**
     * Copy group code to clipboard and show a toast notification
     */
    const handleCopyCode = () => {
        navigator.clipboard.writeText(groupCode);
        setShowToast(true);
    };

    /**
     * Format date for display with appropriate emoji
     * Shows relative time for recent entries and formatted date for older ones
     */
    const getDateDisplay = (dateString) => {
        const entryDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - entryDate);
        const diffDays = Math.floor(
            diffTime / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
            return { text: "Today", emoji: "😊" };
        } else if (diffDays === 1) {
            return { text: "Yesterday", emoji: "🙂" };
        } else if (diffDays <= 7) {
            return {
                text: `${diffDays} days ago`,
                emoji: "😕"
            };
        } else {
            return {
                text: entryDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                }),
                emoji: "😢"
            };
        }
    };

    /**
     * Fetch entries for all users in the group
     * Uses offline-first approach by first retrieving cached entries from IndexedDB,
     * then syncing with the API to get the latest data
     */
    const fetchEntries = async () => {
        // Get cached information from IndexedDB
        const cachedMemberObjects =
            await membersDB.getUserIds(groupId);

        const groupsPageEntries = [];
        for (let i = 0; i < cachedMemberObjects.length; i++) {
            const newEntry =
                await entriesDB.getMostRecentByUserId(
                    cachedMemberObjects[0].user_id
                );
            groupsPageEntries.push(newEntry);
        }

        // Filter out nulls
        const finalCachedPageEntries = groupsPageEntries.filter(
            (entry) => entry != null
        );

        if (finalCachedPageEntries) {
            setEntries(finalCachedPageEntries);
        }

        try {
            // Fetch latest entries from API
            const response = await fetch(
                `${API_BASE_URL}/api/groups/${groupId}/entries`,
                {
                    credentials: "include" // For JWT cookie
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch entries");
            }

            const entries = await response.json();

            setEntries(entries);

            // Update IndexedDB with new entries
            for (let i = 0; i < entries.length; i++) {
                await entriesDB.addIfNotPresent(entries[i]);
            }
        } catch (error) {
            console.error("Error fetching entries:", error);
        }
    };

    // Fetch entries when groupId or userId changes
    useEffect(() => {
        if (groupId && userId) {
            fetchEntries();
        }
        // eslint-disable-next-line
    }, [groupId, userId]);

    /**
     * Create a new reaction on an entry
     * @param {string} emoji - Type of reaction (e.g., 'thumb', 'heart')
     * @param {string} user - User ID of the entry's owner
     * @param {string} entry - Entry ID to react to
     */
    const newReaction = async (emoji, user, entry) => {
        const currentUser = userId;
        if (!currentUser) {
            console.error("No user ID found");
            return;
        }

        // Check if same reaction type already made by current user
        if (reactionCounts[entry]?.[currentUser] === emoji) {
            return;
        }

        if (user !== currentUser) {
            // Prepare reaction data
            const reactionData = {
                entry_id: entry,
                group_id: groupId,
                reaction_string: emoji
            };

            try {
                // Post new reaction to API
                const response = await axios.put(
                    `${API_BASE_URL}/entries/reaction`,
                    reactionData,
                    {
                        withCredentials: true
                    }
                );

                if (response && response.status === 201) {
                    // Update local state with new reaction
                    setReactionCounts((prev) => {
                        const updated = { ...prev };
                        if (!updated[entry]) {
                            updated[entry] = {};
                        }
                        updated[entry][currentUser] = emoji;
                        return updated;
                    });

                    setReactionNumbers((prev) => {
                        const update = { ...prev };
                        if (!update[user]) {
                            update[user] = {
                                thumb: 0,
                                heart: 0,
                                smile: 0,
                                laugh: 0,
                                cry: 0
                            };
                        }
                        update[entry][emoji] += 1;
                        return update;
                    });
                }
            } catch (err) {
                console.error("Error saving reaction: ", err);
            }
        }
    };

    // Fetch all reactions for entries when entries or groupUsers change
    useEffect(() => {
        /**
         * Fetch reactions for all entries
         * Aggregates reactions by type and by user
         */
        const fetchReactions = async () => {
            try {
                if (!Array.isArray(groupUsers)) {
                    console.error(
                        "groupUsers is not an array:",
                        groupUsers
                    );
                    return;
                }

                const reactionData = await Promise.all(
                    groupUsers.map(async (user) => {
                        try {
                            const resp = await fetch(
                                // Get most recent entry for each user
                                `${API_BASE_URL}/users/${user}/recent`
                            );

                            if (!resp.ok) {
                                throw new Error(
                                    `HTTP error! status: ${resp.status}`
                                );
                            }

                            const data = await resp.json();

                            // Check for entry and reactions
                            if (
                                data.currentEntry &&
                                Array.isArray(
                                    data.currentEntry.reactions
                                )
                            ) {
                                // Extract reactions
                                const reacts =
                                    data.currentEntry.reactions;

                                // Initialize to empty
                                const userReacts = {};

                                // Relate reaction type to user
                                reacts.forEach((rxn) => {
                                    userReacts[
                                        rxn.user_reacting_id
                                    ] = rxn.reaction;
                                });

                                const counts = {
                                    thumb: 0,
                                    heart: 0,
                                    smile: 0,
                                    laugh: 0,
                                    cry: 0
                                };

                                // Get total reaction counts
                                reacts.forEach((rxn) => {
                                    if (
                                        rxn.reaction === "thumb"
                                    )
                                        counts.thumb += 1;
                                    if (
                                        rxn.reaction === "heart"
                                    )
                                        counts.heart += 1;
                                    if (
                                        rxn.reaction === "smile"
                                    )
                                        counts.smile += 1;
                                    if (
                                        rxn.reaction === "laugh"
                                    )
                                        counts.laugh += 1;
                                    if (rxn.reaction === "cry")
                                        counts.cry += 1;
                                });

                                return {
                                    entryId:
                                        data.currentEntry._id,
                                    userReacts,
                                    counts
                                };
                            }

                            return null;
                        } catch (err) {
                            console.error(
                                `Failed to fetch reactions for user ${user}:`,
                                err
                            );
                            return null;
                        }
                    })
                );

                const validReactionData = reactionData.filter(
                    (rxns) => rxns !== null
                );

                // Update reaction type based on reacting user
                setReactionCounts((prev) => {
                    const updated = { ...prev };

                    validReactionData.forEach((data) => {
                        updated[data.entryId] = data.userReacts;
                    });

                    return updated;
                });

                // Update tally of reaction types
                setReactionNumbers((prev) => {
                    const update = { ...prev };

                    validReactionData.forEach((data) => {
                        update[data.entryId] = data.counts;
                    });

                    return update;
                });
            } catch (err) {
                console.error("Error fetching reactions:", err);
            }
        };

        if (
            entries.length > 0 &&
            groupUsers &&
            groupUsers.length > 0
        ) {
            fetchReactions();
        }
    }, [entries, groupUsers]);

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <ContentContainer>
                    {/* Header */}
                    <HeaderContainer>
                        <HeaderRow>
                            <BackButton
                                onClick={() =>
                                    navigate("/groups")
                                }
                            >
                                <FiChevronLeft />
                            </BackButton>
                            <EntryPageTitle gradient={gradient}>
                                {decodeURIComponent(groupName)}
                            </EntryPageTitle>
                            {/* *** */}
                            {/* {userId?.isAdmin && (
                                <CodeButton
                                    onClick={() =>
                                        setShowAdmin(!showAdmin)
                                    }
                                    // onClick={() =>
                                    //     console.log(groupUsers)
                                    // }
                                >
                                    <MdOutlinePeopleOutline />
                                </CodeButton>
                            )} */}

                            <CodeButton
                                onClick={() =>
                                    setShowAdmin(!showAdmin)
                                }
                                // onClick={() =>
                                //     console.log(groupUsers)
                                // }
                            >
                                <MdOutlinePeopleOutline />
                            </CodeButton>

                            <CodeButton
                                onClick={() =>
                                    setShowCode(!showCode)
                                }
                            >
                                <FiHash />
                            </CodeButton>
                        </HeaderRow>
                    </HeaderContainer>

                    {/* Group code display */}
                    <GroupCodeDisplay isVisible={showCode}>
                        <span className="code">
                            {groupCode}
                        </span>
                        <ActionIcon onClick={handleCopyCode}>
                            <FiCopy />
                        </ActionIcon>
                        <ActionIcon>
                            <FiShare />
                        </ActionIcon>
                    </GroupCodeDisplay>

                    {/* Toast for copying code */}
                    {showToast && (
                        <Toast
                            onAnimationEnd={() =>
                                setShowToast(false)
                            }
                        >
                            Code copied to clipboard!
                        </Toast>
                    )}
                    {/* *** */}
                    <AdminDisplay isVisible={showAdmin}>
                        <AdminView
                            groupUsers={groupUsers}
                            groupId={groupId}
                        ></AdminView>
                    </AdminDisplay>

                    {/* Map through the entries */}
                    <EntriesContainer>
                        {entries.map((entry) => {
                            return <></>; // Return an empty fragment for each entry
                        })}
                        {entries.map((entry) => (
                            <EntryCard key={entry.userId}>
                                <EntryHeader>
                                    <EntryName>
                                        {entry.userName}
                                    </EntryName>
                                    <EntryDate>
                                        {
                                            getDateDisplay(
                                                entry.date
                                            ).text
                                        }
                                        <span>
                                            {
                                                getDateDisplay(
                                                    entry.date
                                                ).emoji
                                            }
                                        </span>
                                    </EntryDate>
                                </EntryHeader>
                                <EntrySection type="rose">
                                    <EntryText>
                                        {entry.rose_text}
                                    </EntryText>
                                </EntrySection>
                                <EntrySection type="bud">
                                    <EntryText>
                                        {entry.bud_text}
                                    </EntryText>
                                </EntrySection>
                                <EntrySection type="thorn">
                                    <EntryText>
                                        {entry.thorn_text}
                                    </EntryText>
                                </EntrySection>
                                {/* Reaction buttons for each entry */}
                                <EntryReactions>
                                    {[
                                        "thumb",
                                        "heart",
                                        "smile",
                                        "laugh",
                                        "cry"
                                    ].map((emoji) => (
                                        <Reaction
                                            key={emoji}
                                            onClick={() => {
                                                newReaction(
                                                    emoji,
                                                    entry.userId,
                                                    entry._id
                                                );
                                            }}
                                        >
                                            {/* Render emoji icons */}
                                            {emoji ===
                                                "thumb" && "👍"}
                                            {emoji ===
                                                "heart" && "❤️"}
                                            {emoji ===
                                                "smile" && "🙂"}
                                            {emoji ===
                                                "laugh" && "😂"}
                                            {emoji === "cry" &&
                                                "😭"}
                                            <ReactionCount>
                                                {reactionNumbers[
                                                    entry._id
                                                ]?.[emoji] || 0}
                                            </ReactionCount>
                                        </Reaction>
                                    ))}
                                </EntryReactions>
                            </EntryCard>
                        ))}
                    </EntriesContainer>
                </ContentContainer>
            </Container>
        </ThemeProvider>
    );
}

export default GroupEntries;
