/* 
Search page component for displaying and navigating user tags
Handles fetching tag data and entries with offline-first approach
*/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoFolderOutline } from "react-icons/io5";
import { MdTagFaces } from "react-icons/md";
import {
    Title,
    PageContainer,
    TagFolder,
    Subtitle,
    TagContent,
    Folder,
    TagName,
    EntryNumber
} from "./search.styles";
import { entriesDB, tagsDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";

function SearchPage({ userId }) {
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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
        setIsLoading(true);

        try {
            const cachedTags = await tagsDB.getAll(userId);

            if (cachedTags) {
                setTags(cachedTags);
            }

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

                const tags = await response.json();
                console.log("User's tags fetched:", tags);
                setTags(tags || []);

                // Update local cache with latest tag data
                if (tags && tags.length > 0) {
                    for (const tag of tags) {
                        await tagsDB.update({
                            ...tag,
                            user_id: userId
                        });
                    }
                }
            } catch (networkError) {
                console.error(
                    "Network tags request failed, using cached data:",
                    networkError
                );
            }
        } catch (error) {
            console.error("Error loading tags:", error);
            setTags([]);
        }

        setIsLoading(false);
    };

    // Combined effect that runs on both mount and userId changes
    useEffect(() => {
        if (userId) {
            console.log("Fetching tags for userId:", userId);
            fetchTags();
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line
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
            {/* no tags view */}
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
            ) : (
                // display tags
                <>
                    <Subtitle>Your Tags</Subtitle>
                    {tags.map((tag) => (
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
