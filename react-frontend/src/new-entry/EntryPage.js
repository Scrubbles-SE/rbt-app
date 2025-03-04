import React, { useState, useEffect } from "react";
import { FaTimes, FaEye, FaLock, FaEdit } from "react-icons/fa";
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
    SubmitText,
    EditModeIndicator
} from "./Entry.styles";
import { entriesDB, tagsDB } from "../utils/db";
import { API_BASE_URL } from "../utils/config";

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

    // Store original entry for comparison (to detect changes)
    const [originalEntry, setOriginalEntry] = useState({
        rose: "",
        bud: "",
        thorn: ""
    });

    // State for UI
    const [isLoading, setIsLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [originalTags, setOriginalTags] = useState([]);
    const [currentTag, setCurrentTag] = useState("");
    const [editingField, setEditingField] = useState(null);
    const [error, setError] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [userStartedTyping, setUserStartedTyping] =
        useState(false);

    // Fetch today's entry on mount
    useEffect(() => {
        loadTodaysEntry();
        // eslint-disable-next-line
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
                    `${API_BASE_URL}/api/entries`,
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
        const entryState = {
            rose: entryData.rose_text,
            bud: entryData.bud_text,
            thorn: entryData.thorn_text,
            _id: entryData._id
        };

        setEntry(entryState);
        setOriginalEntry(entryState);

        // Handle tags
        let tagNames = [];
        if (
            Array.isArray(entryData.tags) &&
            entryData.tags.length > 0
        ) {
            // Fetch tag names for each tag ID
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries/tags/${userId}`,
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
        setOriginalTags([...tagNames]);
        setIsPublic(entryData.is_public);
        setIsEditMode(true);
        setHasChanges(false);
        setUserStartedTyping(false);
    };

    // Tag handling
    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = currentTag.trim();
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setCurrentTag("");
                checkForChanges([...tags, tag], originalTags);
            }
        }
    };

    const checkForChanges = (
        currentTags = tags,
        originalTagsList = originalTags
    ) => {
        // Check if entry fields have changed
        const entryChanged =
            entry.rose !== originalEntry.rose ||
            entry.bud !== originalEntry.bud ||
            entry.thorn !== originalEntry.thorn;

        // Check if tags have changed
        const tagsChanged =
            currentTags.length !== originalTagsList.length ||
            currentTags.some(
                (tag) => !originalTagsList.includes(tag)
            );

        setHasChanges(entryChanged || tagsChanged);
    };

    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(
            (tag) => tag !== tagToRemove
        );
        setTags(newTags);
        checkForChanges(newTags);
    };

    // Field editing
    const handleFieldClick = (field) => {
        setEditingField(field);
    };

    const handleFieldChange = (field, value) => {
        setUserStartedTyping(true);
        setEntry((prev) => {
            const newEntry = {
                ...prev,
                [field]: value
            };

            // Check if this causes any changes from original
            const hasChanges =
                newEntry.rose !== originalEntry.rose ||
                newEntry.bud !== originalEntry.bud ||
                newEntry.thorn !== originalEntry.thorn ||
                tags.length !== originalTags.length ||
                tags.some((tag) => !originalTags.includes(tag));

            setHasChanges(hasChanges);
            return newEntry;
        });
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
                    `${API_BASE_URL}/api/entries/${entry._id}`,
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
                    `${API_BASE_URL}/api/entries`,
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
                        `${API_BASE_URL}/api/entries/tags/${userId}`,
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

    // Define placeholder text for each field
    const placeholders = {
        rose: "Something good that happened",
        bud: "Something you're looking forward to",
        thorn: "Something that could have been better"
    };

    // Determine if submit button should be shown
    const showSubmitButton = !isEditMode
        ? userStartedTyping
        : hasChanges;

    // Format date for display in edit mode
    const formatDate = () => {
        const today = new Date();
        return today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <EntryContainer>
                <EntryTitle>
                    {isEditMode
                        ? "Today's Reflection"
                        : "Reflect on Your Day"}
                </EntryTitle>

                {isEditMode && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <EditModeIndicator>
                            <FaEdit
                                style={{ marginRight: "6px" }}
                            />
                            Editing entry for {formatDate()}
                        </EditModeIndicator>
                    </div>
                )}

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
                                placeholder={
                                    placeholders[field]
                                }
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
                        onChange={(e) => {
                            setCurrentTag(e.target.value);
                            if (
                                !userStartedTyping &&
                                !isEditMode
                            ) {
                                setUserStartedTyping(true);
                            }
                        }}
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

                {showSubmitButton && (
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
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
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
                )}

                {error && <ErrorMessage>{error}</ErrorMessage>}
            </EntryContainer>
        </ThemeProvider>
    );
};

export default NewEntryPage;
