/*
IMPORTS
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
import { ThemeProvider } from "styled-components";

import { membersDB, entriesDB } from "../utils/db";
import { API_BASE_URL } from "../utils/config.js";

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
    ReactionCount
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
    const [entries, setEntries] = useState([]);
    const [theme, setTheme] = useState({ mode: "light-mode" });
    const [reactionCounts, setReactionCounts] = useState({});
    const [reactionNumbers, setReactionNumbers] = useState({});
    const groupUsers = location.state?.users;

    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

    // Get gradient for the group
    const gradient = getGradient(groupId);

    // Function for copying group code
    const handleCopyCode = () => {
        navigator.clipboard.writeText(groupCode);
        setShowToast(true);
    };

    // Function to get date display
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

    // Fetch entries for the group

    // Backend function instructions
    // 1. get all users of the group
    // 2. get the most recent public entry of each user (this shouldn't be hard with IndexedDb)
    //

    const fetchEntries = async () => {
        // get cached info

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
            //const currentUser = userId;
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

            // Update indexed db - add entries to DB if they are not already in it

            for (let i = 0; i < entries.length; i++) {
                await entriesDB.addIfNotPresent(entries[i]);
            }
        } catch (error) {
            console.error("Error fetching entries:", error);
        }
    };

    // Update useEffect to remove groupUsers dependency
    useEffect(() => {
        if (groupId && userId) {
            fetchEntries();
        }
        // eslint-disable-next-line
    }, [groupId, userId]);

    // add new reaction
    const newReaction = async (emoji, user, entry) => {
        const currentUser = userId;
        if (!currentUser) {
            console.error("No user ID found");
            return;
        }

        // check if type of reaction already made by that user
        if (reactionCounts[entry]?.[currentUser] === emoji) {
            return;
        }

        if (user !== currentUser) {
            // make reaction object
            const reactionData = {
                entry_id: entry,
                group_id: groupId,
                reaction_string: emoji
            };

            console.log("Sending reaction data:", reactionData);

            try {
                // post new reaction with credentials
                const response = await axios.put(
                    `${API_BASE_URL}/entries/reaction`,
                    reactionData,
                    {
                        withCredentials: true
                    }
                );

                if (response && response.status === 201) {
                    console.log(
                        "Reaction recorded: ",
                        response.data
                    );

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

    // fetch reaction counts for entries
    useEffect(() => {
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
                                // get most recent entry for each user
                                `${API_BASE_URL}/users/${user}/recent`
                            );

                            if (!resp.ok) {
                                throw new Error(
                                    `HTTP error! status: ${resp.status}`
                                );
                            }

                            const data = await resp.json();

                            // check for entry and reactions
                            if (
                                data.currentEntry &&
                                Array.isArray(
                                    data.currentEntry.reactions
                                )
                            ) {
                                // extract reactions
                                const reacts =
                                    data.currentEntry.reactions;
                                console.log(reacts);

                                // initialize to empty
                                const userReacts = {};

                                // relate reaction type to user
                                reacts.forEach((rxn) => {
                                    console.log(rxn.reaction);
                                    userReacts[
                                        rxn.user_reacting_id
                                    ] = rxn.reaction;
                                });
                                console.log(userReacts);
                                console.log(
                                    data.currentEntry._id
                                );

                                const counts = {
                                    thumb: 0,
                                    heart: 0,
                                    smile: 0,
                                    laugh: 0,
                                    cry: 0
                                };

                                // get total reaction counts
                                reacts.forEach((rxn) => {
                                    console.log(rxn.reaction);
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

                // reaction type based on reacting user
                setReactionCounts((prev) => {
                    const updated = { ...prev };

                    validReactionData.forEach((data) => {
                        console.log(data.userReacts);
                        updated[data.entryId] = data.userReacts;
                    });

                    return updated;
                });

                // tally of types of reactions
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
        // fetch numbers on change of:
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

                    {/* Map through the entries */}
                    <EntriesContainer>
                        {entries.map((entry) => {
                            console.log("Entry object:", entry);
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
                                {/* map through reactions for given entry */}
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
                                                console.log(
                                                    "Reaction click params:",
                                                    {
                                                        emoji,
                                                        userId: entry.userId,
                                                        entryId:
                                                            entry._id,
                                                        entry
                                                    }
                                                );
                                                newReaction(
                                                    emoji,
                                                    entry.userId,
                                                    entry._id
                                                );
                                            }}
                                        >
                                            {/* render emojis */}
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
