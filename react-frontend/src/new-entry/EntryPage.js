import React, { useState, useEffect } from "react";
import { FaTimes, FaEye, FaLock } from "react-icons/fa";
import { ThemeProvider } from "styled-components";
import {
    EntryContainer,
    EntryTitle,
    EntryField,
    EntryInput,
    EntryText,
    TagsSection,
    TagsContainer,
    TagPill,
    ErrorMessage,
    FieldLabel,
    SubmitContainer,
    VisibilityToggle,
    ToggleOption,
    SubmitWrapper,
    SubmitText
} from "./Entry.styles";
import { entriesDB, tagsDB } from "../utils/db";

const theme = {
    lightPink: "rgba(242, 196, 187, 0.5)" // Lighter version of fill-color
};

const NewEntryPage = ({ userId }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    // State for entry data
    const [entry, setEntry] = useState({
        rose: "",
        bud: "",
        thorn: ""
    });

    // State for UI
    const [isLoading, setIsLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState("");
    const [editingField, setEditingField] = useState(null);
    const [error, setError] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch today's entry on mount
    useEffect(() => {
        loadTodaysEntry();
    }, []);

    /* 
    -=-This is the function to pay attention to if trying to understand IndexedDB
    */
    const loadTodaysEntry = async () => {
        // Start loading state
        setIsLoading(true);

        try {
            // First try IndexedDB
            const cachedEntry =
                await entriesDB.getTodaysEntry(userId);

            // If you find an entry in the IndexedDB, use that
            if (cachedEntry) {
                await updateUIFromEntry(cachedEntry);
            }

            // Then regardless of what happens, fetch from API - get all entries and find today's
            try {
                const response = await fetch(
                    "http://localhost:8000/api/entries",
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const entries = await response.json();
                    const today = new Date();
                    const todaysEntry = entries.find(
                        (entry) => {
                            const entryDate = new Date(
                                entry.date
                            );
                            return (
                                entryDate.getDate() ===
                                    today.getDate() &&
                                entryDate.getMonth() ===
                                    today.getMonth() &&
                                entryDate.getFullYear() ===
                                    today.getFullYear()
                            );
                        }
                    );

                    if (todaysEntry) {
                        // Update the UI
                        await updateUIFromEntry(todaysEntry);

                        // Update the IndexedDB with the latest data
                        await entriesDB.update({
                            ...todaysEntry,
                            user_id: userId
                        });
                    }
                }
            } catch (networkError) {
                console.log(
                    "Network request failed, using cached data"
                );
            }
        } catch (error) {
            console.error("Error loading entry:", error);
        }

        setIsLoading(false);
    };

    // Helper to update UI state from entry data
    const updateUIFromEntry = async (entryData) => {
        setEntry({
            rose: entryData.rose_text,
            bud: entryData.bud_text,
            thorn: entryData.thorn_text,
            _id: entryData._id
        });

        // Handle tags
        let tagNames = [];
        if (
            Array.isArray(entryData.tags) &&
            entryData.tags.length > 0
        ) {
            // Fetch tag names for each tag ID
            try {
                const response = await fetch(
                    `http://localhost:8000/api/entries/tags/${userId}`,
                    {
                        credentials: "include"
                    }
                );
                if (response.ok) {
                    const allTags = await response.json();
                    // Map tag IDs to their names
                    tagNames = entryData.tags
                        .map((tagId) => {
                            const tag = allTags.find(
                                (t) => t._id === tagId
                            );
                            return tag ? tag.tag_name : null;
                        })
                        .filter((name) => name !== null); // Remove any null values
                }
            } catch (error) {
                console.error(
                    "Error fetching tag names:",
                    error
                );
            }
        } else if (entryData.tag_string) {
            // If we have a tag_string, use that as fallback
            tagNames = entryData.tag_string
                .split(", ")
                .filter((tag) => tag);
        }

        setTags(tagNames);
        setIsPublic(entryData.is_public);
        setIsEditMode(true);
        setHasChanges(false);
    };

    // Tag handling
    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = currentTag.trim();
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setCurrentTag("");
                setHasChanges(true);
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
        setHasChanges(true);
    };

    // Field editing
    const handleFieldClick = (field) => {
        setEditingField(field);
    };

    const handleFieldChange = (field, value) => {
        setHasChanges(true);
        setEntry((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFieldBlur = () => {
        setEditingField(null);
    };

    // You can reference the logic from this one too, but it's more confusing because it's dealing with a post and update call from the same button based on state
    const handleSubmit = async () => {
        if (!entry.rose || !entry.bud || !entry.thorn) {
            setError("Please fill in all fields");
            return;
        }

        // Create tag string from array
        const tag_string = tags.join(", ");

        const entryData = {
            rose_text: entry.rose,
            bud_text: entry.bud,
            thorn_text: entry.thorn,
            tags: tags,
            tag_string: tag_string,
            is_public: isPublic
        };

        try {
            if (isEditMode) {
                // Update existing entry
                await entriesDB.update({
                    ...entryData,
                    _id: entry._id
                });
                const response = await fetch(
                    `http://localhost:8000/api/entries/${entry._id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify(entryData)
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to update entry");
                const data = await response.json();
                updateUIFromEntry(data.entry);
            } else {
                // Create new entry
                const response = await fetch(
                    "http://localhost:8000/api/entries",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify(entryData)
                    }
                );

                if (!response.ok)
                    throw new Error("Failed to create entry");

                const data = await response.json();

                // Update IndexedDB after successful API call
                await entriesDB.add({
                    ...data,
                    user_id: userId
                });

                // Fetch and update tags in IndexedDB
                try {
                    const tagsResponse = await fetch(
                        `http://localhost:8000/api/entries/tags/${userId}`,
                        {
                            credentials: "include"
                        }
                    );

                    if (tagsResponse.ok) {
                        const tagsData =
                            await tagsResponse.json();
                        // Update each tag individually in IndexedDB
                        for (const tag of tagsData) {
                            await tagsDB.update({
                                ...tag,
                                user_id: userId
                            });
                        }
                    }
                } catch (error) {
                    console.error(
                        "Error updating tags in IndexedDB:",
                        error
                    );
                }

                // After successful creation, load today's entry fresh
                await loadTodaysEntry();
            }
        } catch (error) {
            console.error("Error saving entry:", error);
            setError("Failed to save entry");
        }
    };

    if (isLoading) {
        return <div></div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <EntryContainer>
                <EntryTitle>
                    {isEditMode ? "Today's Entry" : "New Entry"}
                </EntryTitle>

                {["rose", "bud", "thorn"].map((field) => (
                    <EntryField key={field}>
                        <FieldLabel>{field}</FieldLabel>
                        {isEditMode && !editingField ? (
                            <EntryText
                                onClick={() =>
                                    handleFieldClick(field)
                                }
                            >
                                {entry[field] ||
                                    `Click to edit your ${field}`}
                            </EntryText>
                        ) : (
                            <EntryInput
                                value={entry[field]}
                                onChange={(e) =>
                                    handleFieldChange(
                                        field,
                                        e.target.value
                                    )
                                }
                                onBlur={
                                    isEditMode
                                        ? handleFieldBlur
                                        : undefined
                                }
                                placeholder={`What's your ${field} for today?`}
                                autoFocus={
                                    editingField === field
                                }
                            />
                        )}
                    </EntryField>
                ))}

                <EntryField>
                    <FieldLabel>Tags</FieldLabel>
                    <EntryInput
                        value={currentTag}
                        onChange={(e) =>
                            setCurrentTag(e.target.value)
                        }
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add tags (separate with commas)"
                    />
                    <TagsSection hasTags={tags.length > 0}>
                        <TagsContainer>
                            {tags.map((tag) => (
                                <TagPill key={tag}>
                                    {tag}
                                    <button
                                        onClick={() =>
                                            removeTag(tag)
                                        }
                                    >
                                        <FaTimes />
                                    </button>
                                </TagPill>
                            ))}
                        </TagsContainer>
                    </TagsSection>
                </EntryField>

                <SubmitContainer>
                    <SubmitWrapper
                        onClick={handleSubmit}
                        isEditMode={isEditMode}
                        hasChanges={hasChanges}
                    >
                        <SubmitText>
                            {isEditMode
                                ? "Save Changes"
                                : "Submit Entry"}
                        </SubmitText>
                        <VisibilityToggle
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ToggleOption
                                selected={isPublic}
                                onClick={() =>
                                    setIsPublic(true)
                                }
                            >
                                <FaEye />
                                <span>Public</span>
                            </ToggleOption>
                            <ToggleOption
                                selected={!isPublic}
                                onClick={() =>
                                    setIsPublic(false)
                                }
                            >
                                <FaLock />
                                <span>Private</span>
                            </ToggleOption>
                        </VisibilityToggle>
                    </SubmitWrapper>
                </SubmitContainer>

                {error && <ErrorMessage>{error}</ErrorMessage>}
            </EntryContainer>
        </ThemeProvider>
    );
};

export default NewEntryPage;
