/*
Tag entry detail view component
Displays all entries associated with a specific tag
*/
import React, { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { FiChevronLeft } from "react-icons/fi";
import {
    ContentContainer,
    Container,
    HeaderContainer,
    HeaderRow,
    BackButton,
    EntriesContainer,
    EntryCard,
    EntryHeader,
    EntrySection,
    EntryDate,
    EntryText,
    EntryPageTitle
} from "./search.styles";

function TagEntries() {
    const navigate = useNavigate();
    const location = useLocation();
    const tagEntries = location.state.entries;
    const tagName = location.state.tag_name;
    const [theme, setTheme] = useState({ mode: "light-mode" });

    // Synchronize with the app theme from localStorage
    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

    // Format date for display in entry cards
    const getDate = (dateString) => {
        const entryDate = new Date(dateString);
        return {
            text: entryDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            })
        };
    };

    return (
        <ThemeProvider theme={theme}>
            {!tagEntries ? (
                <p>No entries found</p>
            ) : (
                <Container>
                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderRow>
                                <BackButton
                                    onClick={() =>
                                        navigate("/search")
                                    }
                                >
                                    <FiChevronLeft />
                                </BackButton>
                                <EntryPageTitle>
                                    {tagName}
                                </EntryPageTitle>
                                <div></div>
                            </HeaderRow>
                        </HeaderContainer>

                        <EntriesContainer>
                            {tagEntries.map((entry) => {
                                return (
                                    <EntryCard key={entry._id}>
                                        <EntryHeader>
                                            <EntryDate>
                                                {
                                                    getDate(
                                                        entry.date
                                                    ).text
                                                }
                                            </EntryDate>
                                        </EntryHeader>
                                        <EntrySection type="rose">
                                            <EntryText>
                                                {
                                                    entry.rose_text
                                                }
                                            </EntryText>
                                        </EntrySection>
                                        <EntrySection type="bud">
                                            <EntryText>
                                                {entry.bud_text}
                                            </EntryText>
                                        </EntrySection>
                                        <EntrySection type="thorn">
                                            <EntryText>
                                                {
                                                    entry.thorn_text
                                                }
                                            </EntryText>
                                        </EntrySection>
                                    </EntryCard>
                                );
                            })}
                        </EntriesContainer>
                    </ContentContainer>
                </Container>
            )}
        </ThemeProvider>
    );
}

export default TagEntries;
