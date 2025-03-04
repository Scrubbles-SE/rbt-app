/**
 * Home Page Component
 * Displays user's entry calendar, recent reflections, and streak statistics
 */
import { useState, useEffect, useCallback } from "react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [userName, setUserName] = useState("");

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
                setUserName(users[0].name);
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
                    setUserName(data.name);
                    // Update user in IndexedDB
                    await userDB.update({
                        ...data,
                        _id: userId
                    });
                }
            } catch (networkError) {
                setIsOffline(true);
            }
        } catch (error) {
            setIsOffline(true);
        }
    }, [userId]);

    // Fetch most recent entry using offline-first approach
    const fetchMostRecentEntry = useCallback(async () => {
        try {
            const cachedEntry =
                await entriesDB.getMostRecent(userId);
            if (cachedEntry) {
                setRecentEntry(cachedEntry);
            }
            const response = await fetch(
                `${API_BASE_URL}/api/entries`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch entries");
            }

            const entries = await response.json();

            // sort entries from newest to oldest
            const sortedEntries = entries.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            setRecentEntry(sortedEntries[0] || null);
            await entriesDB.add(sortedEntries[0]);
            setIsOffline(false);
        } catch (error) {
            setIsOffline(true);
        }
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

            const response = await fetch(
                `${API_BASE_URL}/api/entries`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch entries");
            }

            const entries = await response.json();

            const matchingEntry = entries.find((entry) => {
                const entryDate = new Date(entry.date);
                return (
                    entryDate.toDateString() ===
                    selectedDate.toDateString()
                );
            });

            setSelectedEntry(matchingEntry || null);
        } catch (error) {
            setIsOffline(true);
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
            const response = await fetch(
                `${API_BASE_URL}/api/entries`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch entries");
            }

            const entries = await response.json();
            const datesWithEntries = entries.map((entry) =>
                new Date(entry.date).toDateString()
            );

            setEntryDates(datesWithEntries);
            calculateStreakCount(datesWithEntries);
            await Promise.all(
                entries.map(
                    entries.map((entry) =>
                        entriesDB.update(entry)
                    )
                )
            );
        } catch (error) {
            setIsOffline(true);
        }
    }, [userId]);

    // Calculate user's current streak based on consecutive daily entries
    const calculateStreakCount = (dates) => {
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
        let index = 0;

        // Count consecutive days
        while (index < sortedDates.length) {
            if (
                index === 0 ||
                (currentDate - sortedDates[index]) /
                    (1000 * 60 * 60 * 24) <=
                    1
            ) {
                streak++;
                currentDate = sortedDates[index];
                index++;
            } else {
                break;
            }
        }

        setStreakCount(streak);
    };

    // Initialize all data on component mount
    const initializeData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([
            fetchUserDetails(),
            fetchMostRecentEntry(),
            fetchAllEntryDates()
        ]);
        setIsLoading(false);
    }, [
        fetchUserDetails,
        fetchMostRecentEntry,
        fetchAllEntryDates
    ]);

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    if (isLoading) {
        return null;
    }

    // Handle date selection on calendar
    const handleDateChange = async (newDate) => {
        setDate(newDate);
        await fetchEntryForDate(newDate);
        setModalIsOpen(true);
    };

    // Close the entry detail modal
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedEntry(null);
    };

    // Add CSS class to calendar tiles with entries
    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const dateStr = date.toDateString();
            if (entryDates.includes(dateStr)) {
                return "entry-date";
            }
        }
        return null;
    };

    // Check if user has created an entry for the current day
    const hasEntryForToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return entryDates.some((dateStr) => {
            const entryDate = new Date(dateStr);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
    };

    if (isOffline) {
        return <div>Offline</div>;
    }

    return (
        <HomeContainer {...swipeHandlers}>
            <WelcomeSection>
                <WelcomeHeader>
                    Welcome back, {userName}!
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
                        Most Recent Reflection
                    </SectionTitle>
                    <EntryDisplay>
                        <EntryItem>
                            <h3>Rose</h3>
                            <p>{recentEntry.rose_text}</p>
                        </EntryItem>
                        <EntryItem>
                            <h3>Bud</h3>
                            <p>{recentEntry.bud_text}</p>
                        </EntryItem>
                        <EntryItem>
                            <h3>Thorn</h3>
                            <p>{recentEntry.thorn_text}</p>
                        </EntryItem>
                    </EntryDisplay>
                </Section>
            )}

            <StyledModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="pop-up"
                overlayClassName="overlay"
            >
                <div onClick={closeModal}>
                    <h2>{date.toDateString()}</h2>
                    {selectedEntry ? (
                        <EntryDisplay>
                            <EntryItem>
                                <h3>Rose</h3>
                                <p>{selectedEntry.rose_text}</p>
                            </EntryItem>
                            <EntryItem>
                                <h3>Bud</h3>
                                <p>{selectedEntry.bud_text}</p>
                            </EntryItem>
                            <EntryItem>
                                <h3>Thorn</h3>
                                <p>
                                    {selectedEntry.thorn_text}
                                </p>
                            </EntryItem>
                        </EntryDisplay>
                    ) : (
                        <NoEntry>
                            No entry for this date
                        </NoEntry>
                    )}
                </div>
            </StyledModal>
        </HomeContainer>
    );
}

export default HomePage;
