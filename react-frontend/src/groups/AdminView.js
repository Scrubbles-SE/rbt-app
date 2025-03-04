import React, { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { FiChevronLeft } from "react-icons/fi";

import {
    Container,
    ContentContainer,
    HeaderRow,
    BackButton,
    HeaderContainer,
    EntriesContainer,
    EntryCard,
    EntrySection,
    EntryText,
    EntryHeader,
    EntryDate
} from "./group.styles";
import { EntryPageTitle } from "../search/search.styles";

function AdminView() {
    const navigate = useNavigate();
    const location = useLocation();
    const groupUsers = location.state?.users || [];
    const [theme, setTheme] = useState({ mode: "light-mode" });

    useLayoutEffect(() => {
        const currentTheme = localStorage.getItem("theme");
        setTheme({ mode: currentTheme || "light-mode" });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <ContentContainer>
                    <HeaderContainer>
                        <HeaderRow>
                            <BackButton
                                onClick={() =>
                                    navigate("/groups")
                                }
                            >
                                <FiChevronLeft />
                            </BackButton>
                            <EntryPageTitle>
                                Admin
                            </EntryPageTitle>
                        </HeaderRow>
                    </HeaderContainer>

                    {/* display all entries in the tag */}
                    <EntriesContainer>
                        {groupUsers?.length > 0 ? (
                            groupUsers.map((user) => (
                                <EntryCard
                                    key={user.first_name}
                                >
                                    <EntryPageTitle>
                                        {user.first_name}
                                    </EntryPageTitle>
                                </EntryCard>
                            ))
                        ) : (
                            <EntryPageTitle>
                                No users found
                            </EntryPageTitle>
                        )}
                    </EntriesContainer>
                </ContentContainer>
            </Container>
        </ThemeProvider>
    );
}

export default AdminView;
