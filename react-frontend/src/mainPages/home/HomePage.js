/**
 * Home Page Component
 * Displays user's entry calendar, recent reflections, and streak statistics
 */
import React, { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { entriesDB, userDB } from "../../utils/db";
import { API_BASE_URL } from "../../utils/config.js";

// Styles
import "react-calendar/dist/Calendar.css";
import {
    HomeContainer,
    WelcomeSection,
    WelcomeHeader,
    StreakCounter,
    NoEntryMessage,
    SectionTitle,
    Section,
    CalendarContainer,
    StyledCalendar,
    EntryDisplay,
    EntryItem,
    StyledModal,
    NoEntry
} from "./HomeStyles";

function HomePage({ userId }) {
    const [date, setDate] = useState(new Date());
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [recentEntry, setRecentEntry] = useState(null);
    const [entryDates, setEntryDates] = useState([]);
    const [streakCount, setStreakCount] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [activeStartDate, setActiveStartDate] = useState(
        new Date()
    );
    const [setIsLoading] = useState(true);
    const [userName, setUserName] = useState("User");

    // Handle calendar month swipe navigation
    const handleSwipe = (direction) => {
        const newDate = new Date(activeStartDate);
        if (direction === "left") {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (direction === "right") {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setActiveStartDate(newDate);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleSwipe("left"),
        onSwipedRight: () => handleSwipe("right")
    });

    // Fetch user details using offline-first approach
    const fetchUserDetails = useCallback(async () => {
        try {
            // First try to get from IndexedDB
            const users = await userDB.getAll();
            if (users && users.length > 0) {
                setUserName(users[0].name || "User");
            }

            // Then fetch from API and update IndexedDB
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/user/details`,
                    {
                        credentials: "include"
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.name || "User");
                    // Update user in IndexedDB
                    await userDB.update({
                        ...data,
                        _id: userId
                    });
                }
            } catch (networkError) {
                console.log(
                    "Network error fetching user details:",
                    networkError
                );
                // Don't set offline here to prevent UI issues
            }
        } catch (error) {
            console.log("Error fetching user details:", error);
            // Don't set offline here to prevent UI issues
        }
        // eslint-disable-next-line
    }, [userId]);

    // Fetch most recent entry using offline-first approach
    const fetchMostRecentEntry = useCallback(async () => {
        try {
            const cachedEntry =
                await entriesDB.getMostRecent(userId);
            if (cachedEntry) {
                setRecentEntry(cachedEntry);
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const entries = await response.json();

                    // sort entries from newest to oldest
                    const sortedEntries = entries.sort(
                        (a, b) =>
                            new Date(b.date) - new Date(a.date)
                    );

                    if (sortedEntries.length > 0) {
                        setRecentEntry(
                            sortedEntries[0] || null
                        );
                        await entriesDB.add(sortedEntries[0]);
                    }
                }
            } catch (networkError) {
                console.log(
                    "Network error fetching recent entry:",
                    networkError
                );
                // Continue with cached data, don't set offline
            }
        } catch (error) {
            console.log("Error fetching recent entry:", error);
            // Continue with whatever data we have
        }
        // eslint-disable-next-line
    }, [userId]);

    // Fetch entry for a specific date
    const fetchEntryForDate = async (selectedDate) => {
        try {
            const cachedEntry = await entriesDB.getByDate(
                userId,
                selectedDate
            );
            if (cachedEntry) {
                setSelectedEntry(cachedEntry);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const entries = await response.json();

                    const matchingEntry = entries.find(
                        (entry) => {
                            const entryDate = new Date(
                                entry.date
                            );
                            return (
                                entryDate.toDateString() ===
                                selectedDate.toDateString()
                            );
                        }
                    );

                    setSelectedEntry(matchingEntry || null);
                }
            } catch (networkError) {
                console.log(
                    "Network error fetching entry for date:",
                    networkError
                );
                // Continue with cached data
            }
        } catch (error) {
            console.log(
                "Error fetching entry for date:",
                error
            );
            // Just show null if we can't find an entry
            setSelectedEntry(null);
        }
    };

    // Fetch all entry dates for calendar highlighting and streak calculation
    const fetchAllEntryDates = useCallback(async () => {
        try {
            const cachedEntries =
                await entriesDB.getAll(userId);
            const cachedDates = cachedEntries.map((entry) =>
                new Date(entry.date).toDateString()
            );
            setEntryDates(cachedDates);
            calculateStreakCount(cachedDates);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/entries`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const entries = await response.json();
                    const datesWithEntries = entries.map(
                        (entry) =>
                            new Date(entry.date).toDateString()
                    );

                    setEntryDates(datesWithEntries);
                    calculateStreakCount(datesWithEntries);

                    // Update the cache
                    for (const entry of entries) {
                        await entriesDB.update(entry);
                    }
                }
            } catch (networkError) {
                console.log(
                    "Network error fetching all entries:",
                    networkError
                );
                // Continue with cached data
            }
        } catch (error) {
            console.log("Error fetching all entries:", error);
            // Ensure we at least have an empty array
            setEntryDates([]);
        } finally {
            // Always set loading to false when done
            setIsLoading(false);
        }
        // eslint-disable-next-line
    }, [userId]);

    // Calculate user's current streak based on consecutive daily entries
    const calculateStreakCount = (dates) => {
        // If no dates, set streak to 0
        if (!dates || dates.length === 0) {
            setStreakCount(0);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sortedDates = [...dates]
            .map((date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d;
            })
            .sort((a, b) => b - a);

        // If no entries or most recent entry is before yesterday, streak is 0
        if (
            sortedDates.length === 0 ||
            sortedDates[0] < yesterday
        ) {
            setStreakCount(0);
            return;
        }

        let streak = 0;
        let currentDate = new Date(sortedDates[0]);

        // Check if the most recent entry is from today or yesterday
        if (
            currentDate.getTime() === today.getTime() ||
            currentDate.getTime() === yesterday.getTime()
        ) {
            streak = 1;
            const checkDate = new Date(currentDate);

            // Count backwards from the most recent entry date
            for (let i = 1; i < 1000; i++) {
                // Move to the previous day
                checkDate.setDate(checkDate.getDate() - 1);

                // Check if there's an entry for this day
                const hasEntryForDate = sortedDates.some(
                    (date) =>
                        date.getTime() === checkDate.getTime()
                );

                if (hasEntryForDate) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        setStreakCount(streak);
    };

    // Initialize all data on component mount
    useEffect(() => {
        const initializeData = async () => {
            try {
                await fetchUserDetails();
                await fetchMostRecentEntry();
                await fetchAllEntryDates();
            } catch (error) {
                console.log("Error initializing data:", error);
                // Ensure loading is set to false even if there's an error
                setIsLoading(false);
            }
        };

        initializeData();
        // eslint-disable-next-line
    }, [
        fetchUserDetails,
        fetchMostRecentEntry,
        fetchAllEntryDates
    ]);

    // Handle date selection on calendar
    const handleDateChange = async (newDate) => {
        setDate(newDate);
        await fetchEntryForDate(newDate);
        setModalIsOpen(true);
    };

    // Close the entry detail modal
    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Add CSS class to calendar tiles with entries
    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toDateString();
            return entryDates.includes(dateStr)
                ? "has-entry"
                : null;
        }
    };

    // Check if user has created an entry for the current day
    const hasEntryForToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            entryDates.some((dateStr) => {
                const entryDate = new Date(dateStr);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            }) || false
        ); // Ensure we return false if entryDates is empty
    };

    // Always render the UI
    return (
        <HomeContainer {...swipeHandlers}>
            <WelcomeSection>
                <WelcomeHeader>
                    Welcome back, {userName || "User"}!
                </WelcomeHeader>
                {streakCount > 0 && (
                    <StreakCounter>
                        <h2>
                            Current Streak: {streakCount}{" "}
                            {streakCount === 1 ? "day" : "days"}
                            !
                        </h2>
                    </StreakCounter>
                )}
                {!hasEntryForToday() && (
                    <NoEntryMessage>
                        <h3>
                            Don't forget to post an entry for
                            today!
                        </h3>
                    </NoEntryMessage>
                )}
            </WelcomeSection>

            <Section>
                <SectionTitle>
                    Look Back at Your Journey
                </SectionTitle>
                <CalendarContainer>
                    <StyledCalendar
                        onChange={handleDateChange}
                        value={date}
                        tileClassName={tileClassName}
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={({
                            activeStartDate
                        }) =>
                            setActiveStartDate(activeStartDate)
                        }
                    />
                </CalendarContainer>
            </Section>

            {recentEntry && (
                <Section>
                    <SectionTitle>
                        Your Latest Entry
                    </SectionTitle>
                    <EntryDisplay>
                        <EntryItem>
                            <h3>
                                {new Date(
                                    recentEntry.date
                                ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </h3>
                            <p>
                                <strong>Rose:</strong>{" "}
                                {recentEntry.rose_text}
                            </p>
                            <p>
                                <strong>Bud:</strong>{" "}
                                {recentEntry.bud_text}
                            </p>
                            <p>
                                <strong>Thorn:</strong>{" "}
                                {recentEntry.thorn_text}
                            </p>
                        </EntryItem>
                    </EntryDisplay>
                </Section>
            )}

            <StyledModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Entry Details"
                appElement={document.getElementById("root")}
            >
                {selectedEntry ? (
                    <>
                        <h2>
                            {new Date(
                                selectedEntry.date
                            ).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric"
                            })}
                        </h2>
                        <p>
                            <strong>Rose:</strong>{" "}
                            {selectedEntry.rose_text}
                        </p>
                        <p>
                            <strong>Bud:</strong>{" "}
                            {selectedEntry.bud_text}
                        </p>
                        <p>
                            <strong>Thorn:</strong>{" "}
                            {selectedEntry.thorn_text}
                        </p>
                        <button onClick={closeModal}>
                            Close
                        </button>
                    </>
                ) : (
                    <NoEntry>
                        No entry for this date.{" "}
                        <button onClick={closeModal}>
                            Close
                        </button>
                    </NoEntry>
                )}
            </StyledModal>
        </HomeContainer>
    );
}

export default HomePage;
