/* 
Search page component for displaying and navigating user tags
Handles fetching tag data and entries with offline-first approach
*/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoFolderOutline } from "react-icons/io5";
import { MdTagFaces } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { HiOutlineSearchCircle } from "react-icons/hi";
import {
    Title,
    PageContainer,
    TagFolder,
    TagContent,
    Folder,
    TagName,
    EntryNumber,
    SearchBarContainer,
    SearchInput,
    SearchIcon,
    NoResultsContainer,
    NoResultsIcon,
    NoResultsText,
    NoResultsSubText
} from "./search.styles";
import { entriesDB, tagsDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";

function SearchPage({ userId }) {
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredTags = tags.filter((tag) =>
        tag.tag_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Fetch a single entry by ID with offline-first approach
    const fetchEntry = async (entryId) => {
        setIsLoading(true);

        try {
            const cachedEntry =
                await entriesDB.getById(entryId);

            if (cachedEntry) {
                return cachedEntry;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries/${entryId}`,
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch entry");
                }

                const entry = await response.json();

                if (entry) {
                    await entriesDB.update({
                        ...entry,
                        user_id: userId
                    });
                }

                return entry;
            } catch (networkError) {
                console.error(
                    "Network entry request failed, using cached data:",
                    networkError
                );
            }
        } catch (error) {
            console.error(
                "Error fetching entry by entryid:",
                error
            );
        }

        setIsLoading(false);
    };

    // Fetch all tags with associated entries using offline-first approach
    const fetchTags = async () => {
        if (!userId) {
            console.log(
                "No userId provided, skipping tag fetch"
            );
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        console.log("Fetching tags for userId:", userId);

        let tagsFromServer = null;
        let networkFailed = false;

        try {
            // Try to get tags from the server first
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries/tags/${userId}`,
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(
                        data.message || "Failed to fetch tags"
                    );
                }

                tagsFromServer = await response.json();
                console.log(
                    "User's tags fetched from server:",
                    tagsFromServer
                );

                // Update local cache with latest tag data
                if (
                    tagsFromServer &&
                    tagsFromServer.length > 0
                ) {
                    for (const tag of tagsFromServer) {
                        await tagsDB.update({
                            ...tag,
                            user_id: userId
                        });
                    }
                }

                // Set tags from server immediately
                setTags(tagsFromServer || []);
            } catch (networkError) {
                console.error(
                    "Network tags request failed, will use cached data:",
                    networkError
                );
                networkFailed = true;
            }

            // If network request failed, fall back to cached tags
            if (networkFailed) {
                const cachedTags = await tagsDB.getAll(userId);
                console.log("Using cached tags:", cachedTags);
                setTags(cachedTags || []);
            }
        } catch (error) {
            console.error("Error loading tags:", error);
            setTags([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to fetch tags when component mounts or userId changes
    useEffect(() => {
        if (userId) {
            fetchTags();
        } else {
            console.log("Waiting for userId to be available");
            setIsLoading(false);
        }
    }, [userId]);

    // Navigate to tag detail view and preload entries
    const navigateToTag = async (tag) => {
        const entryObjects = [];
        for (let i = 0; i < tag.entries.length; i++) {
            let currentEntry = await fetchEntry(tag.entries[i]);
            entryObjects.push(currentEntry);
        }

        navigate(
            `/search/${tag._id}/${encodeURIComponent(
                tag.tag_name
            )}`,
            {
                state: {
                    tag_name: tag.tag_name,
                    entries: entryObjects
                }
            }
        );
    };

    if (isLoading) {
        return <div></div>;
    }

    return (
        <PageContainer>
            {/* Search bar */}
            <SearchBarContainer>
                <SearchIcon>
                    <FaSearch />
                </SearchIcon>
                <SearchInput
                    type="text"
                    placeholder="Search your tag folders"
                    value={searchQuery}
                    onChange={(e) =>
                        setSearchQuery(e.target.value)
                    }
                />
            </SearchBarContainer>

            {/* Tags list or no tags/no results state */}
            {tags.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem 1rem"
                    }}
                >
                    <MdTagFaces
                        style={{
                            fontSize: "5rem",
                            color: "var(--fill-color)",
                            marginBottom: "0.2rem"
                        }}
                    />
                    <Title>No Tags Yet!</Title>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1rem",
                            maxWidth: "300px",
                            margin: "0 auto"
                        }}
                    >
                        Add tags to your reflections to organize
                        and find them easier.
                    </p>
                </div>
            ) : filteredTags.length === 0 ? (
                <NoResultsContainer>
                    <NoResultsIcon>
                        <HiOutlineSearchCircle />
                    </NoResultsIcon>
                    <NoResultsText>
                        No Results Found
                    </NoResultsText>
                    <NoResultsSubText>
                        No tag folders match your search query.
                        Try a different search term.
                    </NoResultsSubText>
                </NoResultsContainer>
            ) : (
                // display filtered tags
                <>
                    {filteredTags.map((tag) => (
                        <TagFolder
                            key={tag._id}
                            onClick={() => navigateToTag(tag)}
                        >
                            <Folder>
                                <IoFolderOutline />
                            </Folder>
                            <TagContent>
                                <TagName>
                                    {tag.tag_name}
                                </TagName>
                                <EntryNumber>
                                    {tag.entries.length}{" "}
                                    {tag.entries.length === 1
                                        ? "entry"
                                        : "entries"}
                                </EntryNumber>
                            </TagContent>
                        </TagFolder>
                    ))}
                </>
            )}
        </PageContainer>
    );
}

export default SearchPage;
